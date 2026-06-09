import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const validStatuses = ["pending", "paid", "shipped", "delivered"];
  if (!validStatuses.includes(status)) {
    return Response.json({ error: "Estado inválido" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ status }).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
