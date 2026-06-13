import { NextRequest } from "next/server";

// AliExpress OAuth callback — recibe el code de autorización del seller
// En producción: intercambiar code por access_token y guardarlo en DB
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code) {
    return Response.json({ error: "No authorization code received" }, { status: 400 });
  }

  // Por ahora solo confirmamos que el callback funciona
  // TODO: intercambiar code por access_token con POST a https://api-sg.aliexpress.com/rest/auth/token/create
  return Response.json({ ok: true, code, state });
}
