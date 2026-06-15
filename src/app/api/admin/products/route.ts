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
    images?: string[] | null;
    description_images?: string[] | null;
    specifications?: Array<{ key: string; value: string }> | null;
    icon: string;
    cj_pid: string;
    stock?: number;
  };

  if (!body.name || !body.price || !body.category) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("products").insert({
    name:               body.name,
    description:        body.description || body.name,
    price:              Number(body.price),
    original_price:     body.original_price ?? null,
    category:           body.category,
    subcategory:        body.subcategory || null,
    tag:                body.tag || null,
    image:              body.image || null,
    images:             body.images?.length ? body.images : null,
    description_images: body.description_images?.length ? body.description_images : null,
    specifications:     body.specifications?.length ? body.specifications : null,
    icon:               body.icon || "📦",
    cj_pid:             body.cj_pid || null,
    stock:              body.stock ?? 50,
    rating:             0,
    review_count:       0,
  }).select("id").single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, id: data.id });
}

export async function DELETE(_req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
