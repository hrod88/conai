import { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } from "transbank-sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { z } from "zod";

// Usa producción SOLO si activas explícitamente la variable.
// Mientras desarrollas/pruebas, déjala sin definir y usará el modo integración de Transbank.
const isProduction = process.env.TRANSBANK_PRODUCTION === "true";

const tx = new WebpayPlus.Transaction(
  new Options(
    isProduction
      ? process.env.TRANSBANK_COMMERCE_CODE!
      : IntegrationCommerceCodes.WEBPAY_PLUS,
    isProduction
      ? process.env.TRANSBANK_API_KEY!
      : IntegrationApiKeys.WEBPAY,
    isProduction ? Environment.Production : Environment.Integration
  )
);

// El cliente solo nos dice QUÉ y CUÁNTO compra. NUNCA el precio.
const CheckoutSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  coupon_code: z.string().trim().min(1).optional().nullable(),
  shipping: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    region: z.string().min(1),
    cost: z.number().min(0),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = CheckoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const { items, coupon_code, shipping } = parsed.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = createAdminClient();

    // Recalcular el total desde la BD (NO confiar en el cliente)
    const ids = items.map((i) => i.id);
    const { data: dbProducts, error: prodErr } = await admin
      .from("products")
      .select("id, price, stock, name")
      .in("id", ids);

    if (prodErr || !dbProducts || dbProducts.length !== items.length) {
      return Response.json({ error: "Producto no encontrado" }, { status: 400 });
    }

    let total = 0;
    for (const item of items) {
      const prod = dbProducts.find((p) => p.id === item.id);
      if (!prod) {
        return Response.json({ error: "Producto no encontrado" }, { status: 400 });
      }
      if ((prod.stock ?? 0) < item.quantity) {
        return Response.json(
          { error: `Sin stock suficiente: ${prod.name}` },
          { status: 409 }
        );
      }
      total += Number(prod.price) * item.quantity;
    }

    const shippingCost = shipping?.cost ?? 0;
    total += shippingCost;

    if (total <= 0) {
      return Response.json({ error: "Total inválido" }, { status: 400 });
    }

    const buyOrder = `conai-${Date.now()}`;
    const sessionId = user?.id ?? `guest-${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/confirm`;

    const response = await tx.create(buyOrder, sessionId, total, returnUrl);

    const { data: order, error } = await admin
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        total,
        status: "pending",
        transbank_token: response.token,
        shipping_address: shipping?.address ?? null,
        shipping_name: shipping?.name ?? null,
        shipping_phone: shipping?.phone ?? null,
        shipping_city: shipping?.city ?? null,
        shipping_region: shipping?.region ?? null,
        shipping_cost: shippingCost,
        coupon_code: coupon_code ?? null,
      })
      .select()
      .single();

    if (error || !order) {
      return Response.json({ error: "Error creando la orden" }, { status: 500 });
    }

// ── Guardar/actualizar la dirección del usuario (Etapa 2 · opción C) ──
    // A prueba de fallos: si esto falla, NO se cae la compra.
    if (user?.id && shipping) {
      try {
        // ¿Ya tiene una dirección guardada? Si sí, la actualizamos; si no, la creamos.
        const { data: existing } = await admin
          .from("user_addresses")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        const addressData = {
          user_id: user.id,
          name: shipping.name,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          region: shipping.region,
          is_default: true,
        };

        if (existing?.id) {
          await admin
            .from("user_addresses")
            .update(addressData)
            .eq("id", existing.id);
        } else {
          await admin.from("user_addresses").insert(addressData);
        }
      } catch (addrErr) {
        // Solo registramos el error; la compra sigue su curso normal.
        console.error("No se pudo guardar la dirección (no afecta la compra):", addrErr);
      }
    }

    await admin.from("order_items").insert(
      items.map((item) => {
        const prod = dbProducts.find((p) => p.id === item.id)!;
        return {
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: Number(prod.price),
        };
      })
    );

    return Response.json({ url: `${response.url}?token_ws=${response.token}` });
  } catch (err) {
    console.error("Checkout error:", err);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}