import { cjGet } from "@/lib/cj";
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const q        = req.nextUrl.searchParams.get("q");
  const page     = req.nextUrl.searchParams.get("page") ?? "1";
  const sort     = req.nextUrl.searchParams.get("sort") ?? "BESTSELLING";
  const minPrice = req.nextUrl.searchParams.get("minPrice");
  const maxPrice = req.nextUrl.searchParams.get("maxPrice");
  if (!q) return Response.json({ error: "Falta parámetro q" }, { status: 400 });

  try {
    const params: Record<string, string> = {
      productNameEn: q,
      pageNum: page,
      pageSize: "50",
      sort,
      warehouseCountryCode: "CL",
    };
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    const data = await cjGet("/product/list", params);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
