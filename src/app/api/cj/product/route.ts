import { cjGet } from "@/lib/cj";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const pid = req.nextUrl.searchParams.get("pid");
  if (!pid) return Response.json({ error: "Falta parámetro pid" }, { status: 400 });

  try {
    const data = await cjGet("/product/query", { pid });
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
