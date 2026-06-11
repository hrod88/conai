import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json() as {
    name: string;
    description: string;
    price: number;
    original_price?: number | null;
    category: string;
    subcategory?: string | null;
    tag: string | null;
    image: string;
    icon: string;
    cj_pid: string;
  };

  if (!body.name || !body.price || !body.category) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("products").insert({
    name:           body.name,
    description:    body.description || body.name,
    price:          Number(body.price),
    original_price: body.original_price ?? null,
    category:       body.category,
    subcategory:    body.subcategory || null,
    tag:            body.tag || null,
    image:       body.image || null,
    icon:        body.icon || "📦",
    cj_pid:      body.cj_pid || null,
    stock:       999,
    rating:      0,
    review_count: 0,
  }).select("id").single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, id: data.id });
}
