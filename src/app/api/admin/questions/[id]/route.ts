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
  const body = await req.json() as { answer: string };
  if (!body.answer?.trim()) return Response.json({ error: "Falta answer" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("product_questions")
    .update({ answer: body.answer.trim() })
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
