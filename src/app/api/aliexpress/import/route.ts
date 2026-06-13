// @ts-nocheck
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return Response.json({ error: "URL requerida" }, { status: 400 });

  const match = url.match(/\/item\/(\d+)/);
  if (!match) return Response.json({ error: "URL de AliExpress inválida" }, { status: 400 });

  const productId = match[1];

  const res = await fetch(`https://www.aliexpress.com/item/${productId}.html`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return Response.json({ error: `AliExpress devolvió ${res.status}` }, { status: 502 });
  }

  const html = await res.text();

  if (req.nextUrl.searchParams.get("debug") === "1") {
    return Response.json({
      htmlLength: html.length,
      hasRunParams: html.includes("window.runParams"),
      hasNextData: html.includes("__NEXT_DATA__"),
      hasOgTitle: html.includes("og:title"),
      hasAEData: html.includes("__AE_DATA__"),
      hasPageData: html.includes("window.pageData"),
      snippet: html.slice(0, 500),
    });
  }

  const data = extractProductData(html, productId);
  return Response.json(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

function extractProductData(html: string, productId: string) {
  // Patrón 1: window.runParams (páginas legacy)
  const runParams = tryExtract(html, /window\.runParams\s*=\s*(\{[\s\S]+?\});\s*(?:try|var|\()/);
  if (runParams) {
    const d = (runParams.data ?? {}) as AnyObj;
    const info = (d.productInfoComponent ?? d) as AnyObj;
    if (info.subject) {
      const price = (info.priceComponent as AnyObj)?.discountPrice?.formattedPrice
        ?? (info.priceComponent as AnyObj)?.originalPrice?.formattedPrice ?? "";
      return buildProduct(productId, {
        title: String(info.subject),
        price: String(price),
        images: (info.imagePathList ?? (info.imageModule as AnyObj)?.imagePathList ?? []) as string[],
        description: String(info.description ?? ""),
      });
    }
  }

  // Patrón 2: __NEXT_DATA__
  const nextData = tryExtract(html, /<script id="__NEXT_DATA__" type="application\/json">(\{[\s\S]+?)<\/script>/);
  if (nextData) {
    const props = ((nextData.props as AnyObj)?.pageProps as AnyObj)?.initialData?.data as AnyObj;
    if (props) {
      const info = (props.productInfo ?? props.product ?? {}) as AnyObj;
      const title = String(info.subject ?? info.title ?? "");
      if (title) {
        return buildProduct(productId, {
          title,
          price: String(info.salePrice ?? info.price ?? ""),
          images: (info.images ?? info.imagePathList ?? []) as string[],
          description: String(info.description ?? ""),
        });
      }
    }
  }

  // Patrón 3: Open Graph meta tags
  const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? "";
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? "";
  const ogPrice = html.match(/<meta property="product:price:amount" content="([^"]+)"/)?.[1] ?? "";

  if (ogTitle) {
    return buildProduct(productId, {
      title: ogTitle,
      price: ogPrice ? `$${ogPrice}` : "",
      images: ogImage ? [ogImage] : [],
      description: "",
    });
  }

  return { ok: false, productId, message: "No se pudo extraer datos del producto." };
}

function tryExtract(html: string, pattern: RegExp): AnyObj | null {
  try {
    const match = html.match(pattern);
    if (!match?.[1]) return null;
    return JSON.parse(match[1]) as AnyObj;
  } catch {
    return null;
  }
}

function buildProduct(productId: string, data: { title: string; price: string; images: string[]; description: string }) {
  return {
    ok: true,
    productId,
    title: data.title,
    price: data.price,
    images: data.images.slice(0, 5),
    description: data.description,
    aliexpressUrl: `https://www.aliexpress.com/item/${productId}.html`,
  };
}
