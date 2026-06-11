import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return Response.json({ valid: false, error: "Falta el código" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", String(code).toUpperCase().trim())
    .eq("active", true)
    .single();

  if (!coupon) {
    return Response.json({ valid: false, error: "Cupón inválido o expirado" }, { status: 400 });
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return Response.json({ valid: false, error: "Este cupón ha expirado" }, { status: 400 });
  }

  return Response.json({ valid: true, discount: coupon.discount, label: coupon.label });
}
