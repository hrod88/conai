import { cjGet } from "@/lib/cj";
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const pid = req.nextUrl.searchParams.get("pid");
  if (!pid) return Response.json({ error: "Falta parámetro pid" }, { status: 400 });

  try {
    const data = await cjGet("/product/variant/list", { pid });
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
