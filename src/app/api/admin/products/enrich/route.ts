import { cjGet } from "@/lib/cj";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function extractImgsFromHtml(html: string): string[] {
  const urls: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const src = m[1].trim();
    if (src.startsWith("http")) urls.push(src);
  }
  return urls;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

export async function POST() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const admin = createAdminClient();

  const { data: products, error } = await admin
    .from("products")
    .select("id, cj_pid, name, description, images, description_images, specifications")
    .not("cj_pid", "is", null)
    .not("cj_pid", "like", "ae:%");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!products?.length) return Response.json({ ok: true, enriched: 0, total: 0 });

  type ProductRow = {
    id: string;
    cj_pid: string;
    name: string;
    description: string | null;
    images?: string[] | null;
    description_images?: string[] | null;
    specifications?: unknown;
  };

  const toEnrich = (products as ProductRow[]).filter(
    (p) =>
      !p.images?.length ||
      !p.description_images?.length ||
      !p.specifications ||
      !p.description ||
      p.description === p.name
  );

  let enriched = 0;
  for (const product of toEnrich) {
    try {
      const data = await cjGet("/product/query", { pid: product.cj_pid });
      const d = data?.data ?? {};
      const update: Record<string, unknown> = {};

      // Imágenes galería
      if (!product.images?.length) {
        const raw = d.productImageSet ?? [];
        const imageSet: string[] = Array.isArray(raw)
          ? raw
          : typeof raw === "string" && raw.trim()
            ? raw.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean)
            : [];
        if (imageSet.length > 0) update.images = imageSet;
      }

      // Descripción: extraer texto limpio del HTML de CJ
      const cjDescRaw: string = d.description ?? "";
      const cjDescText = cjDescRaw.includes("<") ? stripHtml(cjDescRaw) : cjDescRaw;
      if (cjDescText && cjDescText.length > 20 && (!product.description || product.description === product.name)) {
        update.description = cjDescText;
      }

      // Imágenes de descripción: extraídas del HTML
      if (!product.description_images?.length) {
        let detailImgs: string[] = [];

        // 1. Campo dedicado de CJ
        const rawDetail = d.productDetailImage ?? d.productDetailImages ?? d.detailImage ?? null;
        if (rawDetail) {
          detailImgs = Array.isArray(rawDetail)
            ? rawDetail
            : typeof rawDetail === "string" && rawDetail.trim()
              ? rawDetail.split(/[\n,]+/).map((s: string) => s.trim()).filter((s: string) => s.startsWith("http"))
              : [];
        }

        // 2. Si no hay campo dedicado, extraer del HTML de descripción
        if (detailImgs.length === 0 && cjDesc) {
          detailImgs = extractImgsFromHtml(cjDesc);
        }

        if (detailImgs.length > 0) update.description_images = detailImgs;
      }

      // Especificaciones
      if (!product.specifications) {
        const attrs: Array<{ key: string; value: string }> = (d.productAttributes ?? []).map(
          (a: { nameEn?: string; valueEn?: string; name?: string; value?: string }) => ({
            key: a.nameEn ?? a.name ?? "",
            value: a.valueEn ?? a.value ?? "",
          })
        ).filter((a: { key: string; value: string }) => a.key && a.value);
        if (attrs.length > 0) update.specifications = attrs;
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
