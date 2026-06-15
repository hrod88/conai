import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { cjGet } from "@/lib/cj";
import { NextRequest } from "next/server";

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

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await req.json() as {
    name: string;
    description: string;
    price: number;
    original_price?: number | null;
    category: string;
    subcategory?: string | null;
    tag: string | null;
    image: string;
    images?: string[] | null;
    description_images?: string[] | null;
    specifications?: Array<{ key: string; value: string }> | null;
    icon: string;
    cj_pid: string;
    stock?: number;
  };

  if (!body.name || !body.price || !body.category) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("products").insert({
    name:               body.name,
    description:        body.description || body.name,
    price:              Number(body.price),
    original_price:     body.original_price ?? null,
    category:           body.category,
    subcategory:        body.subcategory || null,
    tag:                body.tag || null,
    image:              body.image || null,
    images:             body.images?.length ? body.images : null,
    description_images: body.description_images?.length ? body.description_images : null,
    specifications:     body.specifications?.length ? body.specifications : null,
    icon:               body.icon || "📦",
    cj_pid:             body.cj_pid || null,
    stock:              body.stock ?? 50,
    rating:             0,
    review_count:       0,
  }).select("id").single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Auto-enrich desde CJ: imágenes, descripción e specs en el momento de importar
  if (body.cj_pid && !body.cj_pid.startsWith("ae:")) {
    try {
      const cjData = await cjGet("/product/query", { pid: body.cj_pid });
      const d = cjData?.data ?? {};
      const update: Record<string, unknown> = {};

      // Galería de imágenes
      if (!body.images?.length) {
        const raw = d.productImageSet ?? [];
        const imageSet: string[] = Array.isArray(raw)
          ? raw
          : typeof raw === "string" && raw.trim()
            ? raw.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean)
            : [];
        if (imageSet.length > 0) update.images = imageSet;
      }

      // Descripción: guardar HTML original + extraer texto
      const cjDescRaw: string = d.description ?? "";
      if (cjDescRaw) update.description_html = cjDescRaw;
      const cjDescText = cjDescRaw.includes("<") ? stripHtml(cjDescRaw) : cjDescRaw;
      if (cjDescText && cjDescText.length > 10) {
        update.description = cjDescText;
      }

      // Imágenes de descripción (estilo AliExpress)
      let detailImgs: string[] = [];
      const rawDetail = d.productDetailImage ?? d.productDetailImages ?? d.detailImage ?? null;
      if (rawDetail) {
        detailImgs = Array.isArray(rawDetail)
          ? rawDetail
          : typeof rawDetail === "string" && rawDetail.trim()
            ? rawDetail.split(/[\n,]+/).map((s: string) => s.trim()).filter((s: string) => s.startsWith("http"))
            : [];
      }
      if (detailImgs.length === 0 && cjDescRaw) {
        detailImgs = extractImgsFromHtml(cjDescRaw);
      }
      if (detailImgs.length > 0) update.description_images = detailImgs;

      // Especificaciones
      const attrs: Array<{ key: string; value: string }> = (d.productAttributes ?? []).map(
        (a: { nameEn?: string; valueEn?: string; name?: string; value?: string }) => ({
          key: a.nameEn ?? a.name ?? "",
          value: a.valueEn ?? a.value ?? "",
        })
      ).filter((a: { key: string; value: string }) => a.key && a.value);
      if (attrs.length > 0) update.specifications = attrs;

      if (Object.keys(update).length > 0) {
        await admin.from("products").update(update).eq("id", data.id);
      }
    } catch {
      // No fallar el import si CJ falla
    }
  }

  return Response.json({ ok: true, id: data.id });
}

export async function DELETE(_req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
