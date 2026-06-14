import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { url } = await req.json() as { url: string };
  if (!url?.trim()) return Response.json({ error: "URL requerida" }, { status: 400 });

  let imgRes: Response;
  try {
    imgRes = await fetch(url, {
      headers: {
        "Referer": "https://www.aliexpress.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
  } catch (e) {
    return Response.json({ error: `Error de red: ${String(e)}` }, { status: 502 });
  }

  if (!imgRes.ok) {
    return Response.json({ error: `Error ${imgRes.status} al descargar imagen` }, { status: 502 });
  }

  const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
  const buffer = await imgRes.arrayBuffer();

  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const filename = `ae-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filename, buffer, { contentType, upsert: false });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(filename);

  return Response.json({ ok: true, url: publicUrl });
}
