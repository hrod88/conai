import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

const DROPI_BASE = process.env.DROPI_API_URL ?? "https://api.dropi.cl";
const DROPI_KEY  = process.env.DROPI_API_KEY ?? "";

const CANDIDATE_PATHS = [
  "/api/v3/groupings",
  "/api/v3/products",
  "/api/products",
  "/api/catalog",
  "/wc/v3/products",
  "/integration/products",
  "/integration/v3/products",
  "/v1/products",
  "/v1/groupings",
  "/v2/products",
  "/v2/groupings",
  "/orders/myorders",
  "/",
];

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const probe = req.nextUrl.searchParams.get("probe");

  // Modo descubrimiento: prueba todos los paths candidatos
  if (probe === "1") {
    const results: Record<string, { status: number; preview: unknown }> = {};
    for (const path of CANDIDATE_PATHS) {
      try {
        const res = await fetch(`${DROPI_BASE}${path}`, {
          headers: { "dropi-integration-key": DROPI_KEY, "Content-Type": "application/json" },
          cache: "no-store",
        });
        let preview: unknown = null;
        try {
          const text = await res.text();
          preview = text.slice(0, 200);
        } catch { /* skip */ }
        results[path] = { status: res.status, preview };
      } catch (err) {
        results[path] = { status: -1, preview: String(err) };
      }
    }
    return Response.json(results);
  }

  // Modo normal: path configurado
  const path = req.nextUrl.searchParams.get("path") ?? "/v3/products";
  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const q    = req.nextUrl.searchParams.get("q") ?? "";

  try {
    const url = new URL(`${DROPI_BASE}${path}`);
    url.searchParams.set("page", page);
    if (q) url.searchParams.set("search", q);

    const res = await fetch(url.toString(), {
      headers: { "dropi-integration-key": DROPI_KEY, "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    return Response.json({ status: res.status, path, data });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
