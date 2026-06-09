import { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } from "transbank-sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, total, shipping } = body as {
      items: { id: string; name: string; price: number; quantity: number }[];
      total: number;
      shipping?: {
        name: string;
        phone: string;
        address: string;
        city: string;
        region: string;
        cost: number;
      };
    };

    if (!items?.length || !total) {
      return Response.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const buyOrder = `conai-${Date.now()}`;
    const sessionId = user?.id ?? `guest-${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/confirm`;

    const response = await tx.create(buyOrder, sessionId, total, returnUrl);

    const admin = createAdminClient();

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
        shipping_cost: shipping?.cost ?? 0,
      })
      .select()
      .single();

    if (error || !order) {
      return Response.json({ error: "Error creando la orden" }, { status: 500 });
    }

    await admin.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }))
    );

    return Response.json({ url: `${response.url}?token_ws=${response.token}` });
  } catch (err) {
    console.error("Checkout error:", err);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
