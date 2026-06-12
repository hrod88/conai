import { cjGet } from "@/lib/cj";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const admin = createAdminClient();

  const { data: products, error } = await admin
    .from("products")
    .select("id, cj_pid")
    .not("cj_pid", "is", null);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!products?.length) return Response.json({ ok: true, enriched: 0, total: 0 });

  // Solo los que aún no tienen imágenes en el array
  const toEnrich = products.filter(
    (p: { id: string; cj_pid: string | null; images?: string[] | null }) =>
      !p.images || (p.images as string[]).length === 0
  );

  let enriched = 0;
  for (const product of toEnrich) {
    try {
      const data = await cjGet("/product/query", { pid: product.cj_pid });
      const imageSet: string[] = data?.data?.productImageSet ?? [];
      if (imageSet.length > 0) {
        await admin.from("products").update({ images: imageSet }).eq("id", product.id);
        enriched++;
      }
    } catch {
      // skip producto que falla
    }
    await sleep(800);
  }

  return Response.json({ ok: true, enriched, total: toEnrich.length });
}
