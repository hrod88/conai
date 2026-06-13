import { requireAdmin } from "@/lib/admin-guard";
import { aeCall } from "@/lib/aliexpress";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const q = req.nextUrl.searchParams.get("q") ?? "smart";
  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const probe = req.nextUrl.searchParams.get("probe");

  // Modo ping: verifica que las credenciales y firma funcionan
  if (probe === "ping") {
    try {
      const data = await aeCall("aliexpress.ds.category.get.list", {
        local_country: "CL",
        local_language: "es",
      });
      return Response.json({ ok: true, data });
    } catch (err) {
      return Response.json({ ok: false, error: String(err) }, { status: 500 });
    }
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
