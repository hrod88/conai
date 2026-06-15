import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Product, QuestionRow } from "@/types";
import type { Metadata } from "next";

const categoryLabels: Record<string, string> = {
  salud: "Salud & Wearables",
  belleza: "Belleza Tech",
  hogar: "Hogar Inteligente",
  wearables: "Wearables",
  mascotas: "Mascotas Tech",
  gadgets: "Gadgets",
  audio: "Audio Inteligente",
  oficina: "Oficina Tech",
  juguetes: "Juguetes & Bebés",
  deportes: "Deportes & Outdoor",
  electronica: "Electrónica",
  telefonos: "Teléfonos & Accesorios",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, price, category, icon")
    .eq("id", id)
    .single();

  if (!product) return { title: "Producto no encontrado — conAI" };

  const catLabel = categoryLabels[product.category] ?? product.category;
  const priceFormatted = Number(product.price).toLocaleString("es-CL");
  const title = `${product.name} — conAI`;
  const description = `${product.description ?? product.name}. Categoría: ${catLabel}. Precio: $${priceFormatted} CLP. Envío a todo Chile.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_CL",
      siteName: "conAI",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_email: string;
};

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: { user } }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.auth.getUser(),
  ]);

  if (!product) notFound();

  const adminClient = createAdminClient();
  const [{ data: relatedRaw }, { data: reviewsRaw }, { data: questionsRaw }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("category", (product as Product).category)
      .neq("id", id)
      .limit(4),
    supabase
      .from("reviews")
      .select("id, user_id, rating, comment, created_at")
      .eq("product_id", id)
      .order("created_at", { ascending: false }),
    adminClient
      .from("product_questions")
      .select("id, user_id, user_email, question, answer, created_at")
      .eq("product_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const related: Product[] = (relatedRaw as Product[]) ?? [];

  const reviews: ReviewRow[] = (reviewsRaw ?? []).map((r) => ({
    ...r,
    user_email: (user && r.user_id === user.id) ? (user.email ?? "Tú") : "Usuario",
  }));

  const questions: QuestionRow[] = (questionsRaw ?? []) as QuestionRow[];

  const userHasReviewed = user
    ? reviews.some((r) => r.user_id === user.id)
    : false;

  const adminEmails = (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim());
  const isAdmin = !!user && adminEmails.includes(user.email ?? "");

  return (
    <ProductDetailClient
      product={product as Product}
      related={related}
      reviews={reviews}
      questions={questions}
      userId={user?.id ?? null}
      userEmail={user?.email ?? null}
      userHasReviewed={userHasReviewed}
      isAdmin={isAdmin}
    />
  );
}
