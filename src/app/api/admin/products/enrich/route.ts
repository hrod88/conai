import { cjGet } from "@/lib/cj";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function translateToSpanish(text: string): Promise<string> {
  if (!text || text.length < 20) return text;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 4000))}&langpair=en|es`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    const data = await res.json() as { responseData?: { translatedText?: string }; responseStatus?: number };
    if (data.responseStatus !== 200) return text;
    const t = data?.responseData?.translatedText ?? "";
    if (!t || t.includes("MYMEMORY WARNING") || t.length < 10) return text;
    return t;
  } catch {
    return text;
  }
}

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
    .select("id, cj_pid, name, description, images, description_images, specifications, description_html")
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
    description_html?: string | null;
  };

  const toEnrich = (products as ProductRow[]).filter(
    (p) =>
      !p.images?.length ||
      !p.description_images?.length ||
      !p.specifications ||
      !p.description ||
      !p.description_html ||
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

      // Descripción: guardar HTML original + traducir texto al español
      const cjDescRaw: string = d.description ?? "";
      if (cjDescRaw && !product.description_html) update.description_html = cjDescRaw;
      const cjDescText = cjDescRaw.includes("<") ? stripHtml(cjDescRaw) : cjDescRaw;
      if (cjDescText && cjDescText.length > 20 && (!product.description || product.description === product.name)) {
        const translated = await translateToSpanish(cjDescText);
        update.description = translated;
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
        if (detailImgs.length === 0 && cjDescRaw) {
          detailImgs = extractImgsFromHtml(cjDescRaw);
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
