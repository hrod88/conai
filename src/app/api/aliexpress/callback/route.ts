import { NextRequest } from "next/server";

const AE_TOKEN_URL = "https://api-sg.aliexpress.com/rest/auth/token/create";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return new Response("No authorization code received", { status: 400 });
  }

  const appKey = process.env.AE_APP_KEY!;
  const appSecret = process.env.AE_APP_SECRET!;

  const res = await fetch(AE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      app_key: appKey,
      app_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/aliexpress/callback`,
    }),
  });

  const data = await res.json() as Record<string, unknown>;

  // Mostrar respuesta cruda para diagnosticar estructura
  return Response.json({ ok: res.ok, raw: data });
}
