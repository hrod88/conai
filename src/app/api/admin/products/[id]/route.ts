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
  const body = await req.json() as { stock?: number; tag?: string | null; price?: number; cj_pid?: string };

  const update: Record<string, unknown> = {};
  if (body.stock !== undefined) update.stock = Math.max(0, Number(body.stock));
  if ("tag" in body) update.tag = body.tag ?? null;
  if (body.price !== undefined) update.price = Number(body.price);
  if (body.cj_pid !== undefined) update.cj_pid = body.cj_pid;

  if (Object.keys(update).length === 0) {
    return Response.json({ error: "Sin campos para actualizar" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").update(update).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
