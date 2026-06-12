import { dropiGet } from "@/lib/dropi";
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const q    = req.nextUrl.searchParams.get("q") ?? "";

  try {
    const data = await dropiGet("/v3/groupings", {
      page,
      ...(q ? { search: q } : {}),
    });
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
