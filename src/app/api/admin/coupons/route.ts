import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json();
  const { code, discount, label, expires_at } = body;

  if (!code || !discount || !label) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: String(code).toUpperCase().trim(),
      discount: Number(discount),
      label: String(label).trim(),
      expires_at: expires_at || null,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, data });
}
