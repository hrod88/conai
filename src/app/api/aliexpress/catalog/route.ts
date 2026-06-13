import { requireAdmin } from "@/lib/admin-guard";
import { aeCall } from "@/lib/aliexpress";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const q = req.nextUrl.searchParams.get("q") ?? "smart";
  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const probe = req.nextUrl.searchParams.get("probe");

  // Modo ping: prueba varios nombres de método hasta encontrar uno válido
  if (probe === "ping") {
    const methods = [
      "aliexpress.ds.category.get.list",
      "aliexpress.ds.product.search",
      "aliexpress.ds.product.list.get",
      "aliexpress.affiliate.product.query",
      "aliexpress.affiliate.category.get",
      "aliexpress.ds.recommend.feed.get",
      "aliexpress.dropshipping.product.search",
    ];
    const results: Record<string, unknown> = {};
    for (const method of methods) {
      try {
        const data = await aeCall(method, { local_country: "CL", local_language: "es", country: "CL", language: "es", currency: "CLP" });
        const resp = data as Record<string, unknown>;
        const isInvalid = JSON.stringify(resp).includes("InvalidApiPath");
        results[method] = isInvalid ? "InvalidApiPath" : resp;
      } catch (err) {
        results[method] = String(err);
      }
    }
    return Response.json(results);
  }

  try {
    const data = await aeCall("aliexpress.ds.recommend.feed.get", {
      product_id: "",
      country: "CL",
      language: "es",
      currency: "CLP",
      page_no: page,
      page_size: "20",
      keywords: q,
    });
    return Response.json({ status: 200, data });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
