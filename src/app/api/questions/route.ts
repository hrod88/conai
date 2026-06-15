import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const product_id = req.nextUrl.searchParams.get("product_id");
  if (!product_id) return Response.json({ error: "Falta product_id" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_questions")
    .select("id, user_id, user_email, question, answer, created_at")
    .eq("product_id", product_id)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json() as { product_id: string; question: string };
  if (!body.product_id || !body.question?.trim()) {
    return Response.json({ error: "Campos requeridos: product_id, question" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_questions")
    .insert({
      product_id: body.product_id,
      user_id: user.id,
      user_email: user.email ?? null,
      question: body.question.trim(),
    })
    .select("id, user_id, user_email, question, answer, created_at")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, question: data });
}
