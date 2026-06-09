import { createClient } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";
import type { Category } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <ProductsClient
      products={products ?? []}
      initialCategory={(cat as Category) ?? null}
    />
  );
}
