import { createClient } from "@/lib/supabase/server";
import ProductsVitrina from "./ProductsVitrina";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, category, subcategory")
    .neq("active", false);

  return <ProductsVitrina products={products ?? []} />;
}