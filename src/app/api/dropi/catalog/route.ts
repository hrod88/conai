import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

const DROPI_BASE = process.env.DROPI_API_URL ?? "https://api.dropi.cl";
const DROPI_KEY  = process.env.DROPI_API_KEY ?? "";

const CANDIDATE_PATHS = [
  "/api/products",
  "/api/groupings",
  "/api/catalog",
  "/api/inventory",
  "/api/v3/products",
  "/api/v3/groupings",
  "/api/orders",
  "/api/items",
];

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const probe = req.nextUrl.searchParams.get("probe");

  // Debug: verificar que el token llega correctamente
  if (probe === "debug") {
    const key = DROPI_KEY;
    return Response.json({
      keyLength: key.length,
      keyStart: key.slice(0, 20),
      keyEnd: key.slice(-10),
      base: DROPI_BASE,
    });
  }

  // Modo login: obtener token de usuario
  if (probe === "login") {
    const email    = req.nextUrl.searchParams.get("email") ?? "";
    const password = req.nextUrl.searchParams.get("pass") ?? "";
    const candidates = ["/api/login", "/api/auth/login", "/api/v3/login", "/login", "/auth/login"];
    const results: Record<string, { status: number; preview: string }> = {};
    for (const path of candidates) {
      const res = await fetch(`${DROPI_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });
      const text = await res.text();
      results[path] = { status: res.status, preview: text.slice(0, 300) };
    }
    return Response.json(results);
  }

  // Modo descubrimiento POST: prueba paths con POST y body vacío
  if (probe === "1") {
    const results: Record<string, { status: number; preview: unknown }> = {};
    for (const path of CANDIDATE_PATHS) {
      try {
        const res = await fetch(`${DROPI_BASE}${path}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${DROPI_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ page: 1, per_page: 5 }),
          cache: "no-store",
        });
        let preview: unknown = null;
        try {
          const text = await res.text();
          preview = text.slice(0, 300);
        } catch { /* skip */ }
        results[path] = { status: res.status, preview };
      } catch (err) {
        results[path] = { status: -1, preview: String(err) };
      }
    }
    return Response.json(results);
  }

  // Modo normal: POST a /api/products
  const page = req.nextUrl.searchParams.get("page") ?? "1";
  const q    = req.nextUrl.searchParams.get("q") ?? "";

  try {
    const res = await fetch(`${DROPI_BASE}/api/products`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${DROPI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ page: Number(page), per_page: 20, ...(q ? { search: q } : {}) }),
      cache: "no-store",
    });
    const data = await res.json();
    return Response.json({ status: res.status, data });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
