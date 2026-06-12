import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
