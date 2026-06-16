import { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } from "transbank-sdk";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/email";
import { redirect } from "next/navigation";
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

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token_ws");
  if (!token) redirect("/pago/error?reason=no_token");

  try {
    const response = await tx.commit(token!);
    const admin = createAdminClient();

    if (response.response_code === 0) {
      const { data: order } = await admin
        .from("orders")
        .update({ status: "paid" })
        .eq("transbank_token", token)
        .select()
        .single();

      if (order) {
        type ItemRow = { product_id: string; quantity: number; unit_price: number; products: { name: string }[] };
        const { data: items } = await admin
          .from("order_items")
          .select("product_id, quantity, unit_price, products(name)")
          .eq("order_id", order.id) as { data: ItemRow[] | null };

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Descontar stock de forma ATÓMICA (arregla condición de carrera)
        const sinStock: string[] = [];
        if (items) {
          await Promise.all(
            items.map(async (item) => {
              const { data: ok, error } = await admin.rpc("decrement_stock", {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
              });
              if (error || ok === false) {
                sinStock.push(item.products?.[0]?.name ?? item.product_id);
              }
            })
          );
        }

        if (sinStock.length > 0) {
          console.error(
            `Orden ${order.id}: items sin stock al confirmar -> ${sinStock.join(", ")}`
          );
          await admin
            .from("orders")
            .update({ status: "paid", stock_issue: true })
            .eq("id", order.id);
        }

        if (order.coupon_code) {
          const { data: coupon } = await admin
            .from("coupons")
            .select("uses_count")
            .eq("code", order.coupon_code)
            .single();
          if (coupon != null) {
            await admin
              .from("coupons")
              .update({ uses_count: (coupon.uses_count ?? 0) + 1 })
              .eq("code", order.coupon_code);
          }
        }

        if (user?.email && items) {
          await sendOrderConfirmation({
            to: user.email,
            orderId: order.id,
            total: order.total,
            items: items.map((i) => ({
              name: i.products?.[0]?.name ?? "Producto",
              quantity: i.quantity,
              unit_price: i.unit_price,
            })),
          }).catch(() => {});
        }
      }

      redirect(`/pago/exito?token=${token}`);
    } else {
      await admin
        .from("orders")
        .update({ status: "pending" })
        .eq("transbank_token", token);

      redirect("/pago/error?reason=rejected");
    }
  } catch (err) {
    console.error("Confirm error:", err);
    redirect("/pago/error?reason=server_error");
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const token = formData.get("token_ws") as string | null;
  if (!token) redirect("/pago/error?reason=no_token");

  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/confirm`);
  url.searchParams.set("token_ws", token!);
  return Response.redirect(url.toString());
}