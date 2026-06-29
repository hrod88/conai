import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order")?.trim().toUpperCase();
  const email   = searchParams.get("email")?.trim().toLowerCase();

  if (!orderId || !email) {
    return NextResponse.json({ error: "Número de pedido y email son requeridos." }, { status: 400 });
  }

  const supabase = await createClient();

  // Buscar por los primeros 8 caracteres del ID (el ID corto que ve el cliente)
  // y verificar el email del usuario asociado
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id, status, shipping_status, tracking_number, courier,
      created_at, shipping_name, shipping_city, shipping_region, total,
      profiles:user_id ( email )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Error al buscar el pedido." }, { status: 500 });
  }

  // Filtrar por ID corto y email del perfil
  const order = (orders ?? []).find((o) => {
    const shortId = o.id.slice(0, 8).toUpperCase();
    const profile = o.profiles as { email?: string } | null;
    return shortId === orderId && profile?.email?.toLowerCase() === email;
  });

  if (!order) {
    return NextResponse.json(
      { error: "No encontramos un pedido con esos datos. Verifica el número de pedido y el email con que compraste." },
      { status: 404 }
    );
  }

  // Devolver solo los campos necesarios (sin exponer datos sensibles)
  return NextResponse.json({
    order: {
      id:               order.id,
      status:           order.status,
      shipping_status:  order.shipping_status,
      tracking_number:  order.tracking_number,
      courier:          order.courier,
      created_at:       order.created_at,
      shipping_name:    order.shipping_name,
      shipping_city:    order.shipping_city,
      shipping_region:  order.shipping_region,
      total:            order.total,
    },
  });
}