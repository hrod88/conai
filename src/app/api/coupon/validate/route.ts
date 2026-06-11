import { NextRequest } from "next/server";

const COUPONS: Record<string, { discount: number; label: string }> = {
  CONAI20: { discount: 0.20, label: "20% de descuento" },
  CONAI10: { discount: 0.10, label: "10% de descuento" },
};

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const coupon = COUPONS[String(code).toUpperCase().trim()];
  if (!coupon) {
    return Response.json({ valid: false, error: "Cupón inválido o expirado" }, { status: 400 });
  }
  return Response.json({ valid: true, discount: coupon.discount, label: coupon.label });
}
