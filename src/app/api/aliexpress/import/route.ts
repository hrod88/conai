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

  // Intenta extraer datos del JSON embebido en la página
  const data = extractProductData(html, productId);
  return Response.json(data);
}

function extractProductData(html: string, productId: string) {
  // Patrón 1: window.runParams (páginas legacy)
  const runParams = tryExtract(html, /window\.runParams\s*=\s*(\{[\s\S]+?\});\s*(?:try|var|\()/);
  if (runParams) {
    const info = runParams?.data?.productInfoComponent ?? runParams?.data;
    if (info?.subject) {
      return buildProduct(productId, {
        title: info.subject,
        price: info.priceComponent?.discountPrice?.formattedPrice ?? info.priceComponent?.originalPrice?.formattedPrice ?? "",
        images: info.imagePathList ?? info.imageModule?.imagePathList ?? [],
        description: info.description ?? "",
      });
    }
  }

  // Patrón 2: __NEXT_DATA__ (páginas React SSR)
  const nextData = tryExtract(html, /<script id="__NEXT_DATA__" type="application\/json">(\{[\s\S]+?)<\/script>/);
  if (nextData) {
    const props = nextData?.props?.pageProps?.initialData?.data;
    if (props) {
      const info = props.productInfo ?? props.product;
      if (info?.subject ?? info?.title) {
        return buildProduct(productId, {
          title: info.subject ?? info.title,
          price: info.salePrice ?? info.price ?? "",
          images: info.images ?? info.imagePathList ?? [],
          description: info.description ?? "",
        });
      }
    }
  }

  // Patrón 3: data-spm en metadatos Open Graph
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

  return { ok: false, productId, message: "No se pudo extraer datos. La página puede estar bloqueada." };
}

function tryExtract(html: string, pattern: RegExp): Record<string, unknown> | null {
  try {
    const match = html.match(pattern);
    if (!match?.[1]) return null;
    return JSON.parse(match[1]);
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
