const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getCJToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.CJ_API_EMAIL,
      password: process.env.CJ_API_KEY,
    }),
  });

  const json = await res.json();
  if (json.code !== 200 || !json.data?.accessToken) {
    throw new Error(`CJ auth failed (${json.code}): ${json.message ?? JSON.stringify(json)}`);
  }

  cachedToken = json.data.accessToken as string;
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23 horas
  return cachedToken;
}

export async function cjGet(path: string, params?: Record<string, string>) {
  const token = await getCJToken();
  const url = new URL(`${CJ_BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { "CJ-Access-Token": token },
  });
  return res.json();
}

export async function cjPost(path: string, body: unknown) {
  const token = await getCJToken();
  const res = await fetch(`${CJ_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": token,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}
