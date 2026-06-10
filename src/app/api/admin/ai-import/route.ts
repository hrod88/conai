import Anthropic from "@anthropic-ai/sdk";
import { cjGet } from "@/lib/cj";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import type { Category } from "@/types";

const CATEGORY_ICONS: Record<Category, string> = {
  salud: "❤️", belleza: "✨", hogar: "🏠", wearables: "⌚",
  mascotas: "🐾", gadgets: "🤖", audio: "🎧", oficina: "💼",
  juguetes: "🧸", deportes: "⚽", electronica: "🔌", telefonos: "📱",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { topic, category }: { topic: string; category: Category } = await req.json();
  if (!topic) return Response.json({ error: "Falta topic" }, { status: 400 });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Step 1: Generate English search queries
  const queryMsg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Generate 3 specific English product search queries for CJ Dropshipping based on: "${topic}" (category hint: ${category}). Return ONLY a JSON array of strings. Example: ["health monitor watch", "blood pressure machine", "pulse oximeter clip"]. No explanation.`,
    }],
  });

  let queries: string[] = [topic];
  try {
    const text = queryMsg.content[0].type === "text" ? queryMsg.content[0].text.trim() : "[]";
    queries = JSON.parse(text);
  } catch { /* use fallback */ }

  // Step 2: Search CJ for each query
  const seen = new Set<string>();
  const allProducts: CJRawProduct[] = [];

  for (const q of queries.slice(0, 3)) {
    try {
      const res = await cjGet("/product/list", { productNameEn: q, pageNum: "1", pageSize: "8" });
      for (const p of (res.data?.list ?? []) as CJRawProduct[]) {
        if (!seen.has(p.pid)) { seen.add(p.pid); allProducts.push(p); }
      }
    } catch { /* skip failed query */ }
  }

  if (allProducts.length === 0) return Response.json({ products: [], queries });

  // Step 3: Enrich with Spanish names, CLP prices, tags
  const enrichMsg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `You manage a Chilean e-commerce store. For each product, provide a short catchy Spanish name (max 50 chars), a CLP price (~300% markup on USD, round to nearest 990), and a tag (bestseller/nuevo/descuento/null).

Products:
${JSON.stringify(allProducts.map(p => ({ pid: p.pid, name: p.productNameEn, usd: p.sellPrice })))}

Return ONLY a JSON array: [{"pid":"...","nameEs":"...","priceCLP":12990,"tag":"nuevo"}]. No explanation.`,
    }],
  });

  let enriched: Array<{ pid: string; nameEs: string; priceCLP: number; tag: string | null }> = [];
  try {
    const text = enrichMsg.content[0].type === "text" ? enrichMsg.content[0].text.trim() : "[]";
    enriched = JSON.parse(text);
  } catch { /* use raw data */ }

  const enrichedMap = new Map(enriched.map(e => [e.pid, e]));
  const icon = CATEGORY_ICONS[category] ?? "📦";

  const products = allProducts.map(p => {
    const ai = enrichedMap.get(p.pid);
    return {
      pid:          p.pid,
      productNameEn: p.productNameEn,
      nameEs:       ai?.nameEs ?? p.productNameEn,
      sellPrice:    p.sellPrice,
      priceCLP:     ai?.priceCLP ?? Math.round(p.sellPrice * 1000),
      productImage: p.productImage,
      tag:          ai?.tag ?? null,
      category,
      icon,
    };
  });

  return Response.json({ products, queries });
}

type CJRawProduct = {
  pid: string;
  productNameEn: string;
  sellPrice: number;
  productImage: string;
};
