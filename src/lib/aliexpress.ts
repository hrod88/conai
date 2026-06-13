import crypto from "crypto";

const AE_BASE = "https://api-sg.aliexpress.com/sync";

function getCredentials() {
  const appKey = process.env.AE_APP_KEY;
  const appSecret = process.env.AE_APP_SECRET;
  if (!appKey || !appSecret) throw new Error("AE_APP_KEY o AE_APP_SECRET no están definidas");
  return { appKey, appSecret };
}

function sign(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort();
  const str = secret + sorted.map(k => k + params[k]).join("") + secret;
  return crypto.createHash("md5").update(str).digest("hex").toUpperCase();
}

export async function aeCall(method: string, params: Record<string, string> = {}) {
  const { appKey, appSecret } = getCredentials();
  const timestamp = Date.now().toString();

  const allParams: Record<string, string> = {
    ...params,
    method,
    app_key: appKey,
    timestamp,
    format: "json",
    v: "2.0",
    sign_method: "md5",
  };
  allParams.sign = sign(allParams, appSecret);

  const url = new URL(AE_BASE);
  Object.entries(allParams).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AliExpress ${res.status}: ${text}`);
  }
  return res.json();
}
