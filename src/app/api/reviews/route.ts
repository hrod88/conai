import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Debes iniciar sesión para dejar una reseña" }, { status: 401 });
  }

  const { product_id, rating, comment } = await req.json() as {
    product_id: string;
    rating: number;
    comment: string;
  };

  if (!product_id || !rating || rating < 1 || rating > 5) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error: insertError } = await admin
    .from("reviews")
    .insert({ user_id: user.id, product_id, rating, comment: comment.trim() || null });

  if (insertError) {
    if (insertError.code === "23505") {
      return Response.json({ error: "Ya dejaste una reseña para este producto" }, { status: 409 });
    }
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  // Recalcular rating y review_count del producto
  const { data: stats } = await admin
    .from("reviews")
    .select("rating")
    .eq("product_id", product_id);

  if (stats && stats.length > 0) {
    const avg = stats.reduce((s, r) => s + r.rating, 0) / stats.length;
    await admin
      .from("products")
      .update({ rating: Math.round(avg * 10) / 10, review_count: stats.length })
      .eq("id", product_id);
  }

  return Response.json({ ok: true });
}
