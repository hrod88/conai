import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { cjPost } from "@/lib/cj";
import { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*, order_items(quantity, products(name, cj_pid))")
    .eq("id", id)
    .single() as {
      data: {
        id: string;
        shipping_name: string | null;
        shipping_phone: string | null;
        shipping_address: string | null;
        shipping_city: string | null;
        shipping_region: string | null;
        order_items: { quantity: number; products: { name: string; cj_pid: string | null } }[];
      } | null;
    };

  if (!order) return Response.json({ error: "Pedido no encontrado" }, { status: 404 });

  const products = order.order_items
    .filter((i) => i.products?.cj_pid)
    .map((i) => ({ vid: i.products.cj_pid!, quantity: i.quantity }));

  if (products.length === 0) {
    return Response.json(
      { error: "Ningún producto del pedido tiene CJ ID vinculado. Vincúlalos primero en la pestaña Productos." },
      { status: 422 }
    );
  }

  const cjPayload = {
    orderNumber: order.id,
    shippingCountryCode: "CL",
    shippingCountry: "Chile",
    shippingProvince: order.shipping_region ?? "",
    shippingCity: order.shipping_city ?? "",
    shippingAddress: order.shipping_address ?? "",
    shippingCustomerName: order.shipping_name ?? "",
    shippingPhone: order.shipping_phone ?? "",
    products,
  };

  const result = await cjPost("/shopping/order/createOrderV2", cjPayload);

  if (result.code !== 200) {
    return Response.json({ error: result.message ?? "Error al crear orden en CJ" }, { status: 500 });
  }

  await admin.from("orders").update({ status: "shipped" }).eq("id", id);

  return Response.json({ ok: true, cjOrderId: result.data?.orderId });
}
