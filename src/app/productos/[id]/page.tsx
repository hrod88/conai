import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import type { Product } from "@/types";

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

  const [{ data: relatedRaw }, { data: reviewsRaw }] = await Promise.all([
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
  ]);

  const related: Product[] = (relatedRaw as Product[]) ?? [];

  // Obtener emails de los reviewers via auth (solo los IDs que tenemos)
  // Como no tenemos acceso directo a auth.users desde el cliente, usamos el email
  // guardado en user_metadata o mostramos la primera letra del user_id como avatar
  const reviews: ReviewRow[] = (reviewsRaw ?? []).map((r) => ({
    ...r,
    user_email: r.user_id === user?.id ? (user.email ?? "Tú") : "Usuario",
  }));

  const userHasReviewed = user
    ? reviews.some((r) => r.user_id === user.id)
    : false;

  return (
    <ProductDetailClient
      product={product as Product}
      related={related}
      reviews={reviews}
      userId={user?.id ?? null}
      userEmail={user?.email ?? null}
      userHasReviewed={userHasReviewed}
    />
  );
}
