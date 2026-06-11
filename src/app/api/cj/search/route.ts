import { cjGet } from "@/lib/cj";
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const q = req.nextUrl.searchParams.get("q");
  if (!q) return Response.json({ error: "Falta parámetro q" }, { status: 400 });

  try {
    const data = await cjGet("/product/list", {
      productNameEn: q,
      pageNum: "1",
      pageSize: "20",
    });
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
