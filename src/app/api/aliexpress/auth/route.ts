import { requireAdmin } from "@/lib/admin-guard";
import { NextResponse } from "next/server";

// Redirige al admin a la pantalla de autorización OAuth de AliExpress
export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const appKey = process.env.AE_APP_KEY!;
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/aliexpress/callback`;

  const authUrl = new URL("https://api-sg.aliexpress.com/oauth/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("force_auth", "true");
  authUrl.searchParams.set("redirect_uri", callbackUrl);
  authUrl.searchParams.set("client_id", appKey);

  return NextResponse.redirect(authUrl.toString());
}
