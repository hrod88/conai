import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order")?.trim().toUpperCase();
  const email   = searchParams.get("email")?.trim().toLowerCase();

  if (!orderId || !email) {
    return NextResponse.json(
      { error: "Número de pedido y email son requeridos." },
      { status: 400 }
    );
  }

  // Usamos el admin client para acceder a auth.users
  const adminSupabase = createAdminClient();

  // 1. Buscar el usuario por email en auth.users
  const { data: userData, error: userError } = await adminSupabase.auth.admin.listUsers();
  if (userError) {
    return NextResponse.json({ error: "Error al verificar el usuario." }, { status: 500 });
  }

  const user = userData.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    return NextResponse.json(
      { error: "No encontramos un pedido con esos datos. Verifica el número de pedido y el email con que compraste." },
      { status: 404 }
    );
  }

  // 2. Buscar el pedido por ID corto y user_id
  const supabase = await createClient();
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, status, shipping_status, tracking_number, courier, created_at, shipping_name, shipping_city, shipping_region, total")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: "Error al buscar el pedido." }, { status: 500 });
  }

  const order = (orders ?? []).find((o) =>
    o.id.slice(0, 8).toUpperCase() === orderId
  );

  if (!order) {
    return NextResponse.json(
      { error: "No encontramos un pedido con esos datos. Verifica el número de pedido y el email con que compraste." },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}