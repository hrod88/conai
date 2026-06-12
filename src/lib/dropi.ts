const DROPI_BASE = process.env.DROPI_API_URL ?? "https://api.dropi.cl";

function getKey(): string {
  const key = process.env.DROPI_API_KEY;
  if (!key) throw new Error("DROPI_API_KEY no está definida");
  return key;
}

export async function dropiGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${DROPI_BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropi ${res.status}: ${text}`);
  }

  return res.json();
}

export async function dropiPost(path: string, body: unknown) {
  const res = await fetch(`${DROPI_BASE}${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dropi ${res.status}: ${text}`);
  }

  return res.json();
}
