import { cjPost } from "@/lib/cj";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const orderNo = req.nextUrl.searchParams.get("orderNo");
  const trackNo = req.nextUrl.searchParams.get("trackNo");

  if (!orderNo && !trackNo) {
    return Response.json({ error: "Falta parámetro orderNo o trackNo" }, { status: 400 });
  }

  try {
    const body: Record<string, string> = {};
    if (orderNo) body.orderNum = orderNo;
    if (trackNo) body.trackingNumber = trackNo;

    const data = await cjPost("/logistic/track/query", body);
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
