import { createClient } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";
import type { Category } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; category?: string; subcategory?: string; tag?: string }>;
}) {
  const { cat, category, subcategory, tag } = await searchParams;
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .neq("active", false)
    .order("created_at", { ascending: false });

  // Aceptamos `category` (del mega menú) o `cat` (legacy) como categoría inicial.
  const initialCategory = (category ?? cat) as Category | undefined;

  return (
    <ProductsClient
      products={products ?? []}
      initialCategory={initialCategory ?? null}
      initialSubcategory={subcategory ?? null}
      initialTag={tag ?? null}
    />
  );
}