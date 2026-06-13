import { NextRequest } from "next/server";
import crypto from "crypto";

const AE_TOKEN_URL = "https://api-sg.aliexpress.com/rest/auth/token/create";
const CALLBACK_URL = "https://conai-rho.vercel.app/api/aliexpress/callback";

function sign(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort();
  const str = secret + sorted.map(k => k + params[k]).join("") + secret;
  return crypto.createHash("md5").update(str).digest("hex").toUpperCase();
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return new Response("No authorization code received", { status: 400 });
  }

  const appKey = process.env.AE_APP_KEY!;
  const appSecret = process.env.AE_APP_SECRET!;
  const timestamp = Date.now().toString();

  const params: Record<string, string> = {
    app_key: appKey,
    code,
    grant_type: "authorization_code",
    redirect_uri: CALLBACK_URL,
    timestamp,
  };
  params.sign = sign(params, appSecret);
  params.sign_method = "md5";

  const res = await fetch(AE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });

  const data = await res.json() as Record<string, unknown>;

  if (data.access_token) {
    return Response.json({
      ok: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expire_time,
      user_id: data.user_id,
      instruction: "Copia access_token y agrégalo como AE_ACCESS_TOKEN en .env.local y Vercel",
    });
  }

  return Response.json({ ok: false, raw: data });
}
