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
    .select("id, cj_pid, images, description_images, specifications")
    .not("cj_pid", "is", null);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!products?.length) return Response.json({ ok: true, enriched: 0, total: 0 });

  const toEnrich = (products ?? []).filter(
    (p: { id: string; cj_pid: string | null; images?: string[] | null; description_images?: string[] | null; specifications?: unknown }) =>
      !p.images?.length || !p.description_images?.length || !p.specifications
  );

  let enriched = 0;
  for (const product of toEnrich) {
    try {
      const data = await cjGet("/product/query", { pid: product.cj_pid });
      const d = data?.data ?? {};
      const update: Record<string, unknown> = {};

      if (!product.images?.length) {
        const imageSet: string[] = d.productImageSet ?? [];
        if (imageSet.length > 0) update.images = imageSet;
      }
      if (!product.description_images?.length) {
        const detailImgs: string[] = d.productDetailImage ?? d.productImages ?? [];
        if (detailImgs.length > 0) update.description_images = detailImgs;
      }
      if (!product.specifications) {
        const attrs: Array<{ key: string; value: string }> = (d.productAttributes ?? []).map(
          (a: { nameEn?: string; valueEn?: string; name?: string; value?: string }) => ({
            key: a.nameEn ?? a.name ?? "",
            value: a.valueEn ?? a.value ?? "",
          })
        ).filter((a: { key: string; value: string }) => a.key && a.value);
        if (attrs.length > 0) update.specifications = attrs;
      }
      if (d.description && !product.images?.length) {
        update.description = d.description;
      }

      if (Object.keys(update).length > 0) {
        await admin.from("products").update(update).eq("id", product.id);
        enriched++;
      }
    } catch {
      // skip producto que falla
    }
    await sleep(800);
  }

  return Response.json({ ok: true, enriched, total: toEnrich.length });
}
