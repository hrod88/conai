import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { cjGet } from "@/lib/cj";
import { NextRequest, NextResponse } from "next/server";

// ── /api/admin/sync-cj ────────────────────────────────────────────────
// Sincroniza precios y stock de todos los productos con cj_pid desde CJ.
// Se puede llamar manualmente (GET desde el panel admin) o automáticamente
// via cron job de Vercel cada 24 horas.
// ─────────────────────────────────────────────────────────────────────

const USD_CLP = 950; // Tipo de cambio aproximado

export async function GET(req: NextRequest) {
  // Permitir llamada desde cron (con header de Vercel) o desde admin
  const isCron = req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCron) {
    const guard = await requireAdmin();
    if ("error" in guard) return guard.error;
  }

  const admin = createAdminClient();

  // Traer todos los productos con cj_pid (excluyendo AliExpress)
  const { data: products, error } = await admin
    .from("products")
    .select("id, name, price, original_price, stock, cj_pid")
    .not("cj_pid", "is", null)
    .not("cj_pid", "like", "ae:%")
    .eq("active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!products || products.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, total: 0, message: "No hay productos con cj_pid para sincronizar." });
  }

  let updated = 0;
  let errors = 0;
  const changes: Array<{ id: string; name: string; field: string; old: number; new: number }> = [];

  for (const product of products) {
    try {
      const cjData = await cjGet("/product/query", { pid: product.cj_pid });
      const d = cjData?.data ?? {};

      const update: Record<string, unknown> = {};

      // Precio: convertir de USD a CLP con margen x3
      const cjPriceUSD = parseFloat(d.sellPrice ?? d.price ?? "0");
      if (cjPriceUSD > 0) {
        const newPrice = Math.round(cjPriceUSD * USD_CLP * 3 / 100) * 100;
        if (Math.abs(newPrice - product.price) > 100) { // Solo actualizar si cambió más de $100
          changes.push({ id: product.id, name: product.name, field: "price", old: product.price, new: newPrice });
          update.price = newPrice;
          // Actualizar precio original también (mantener margen del 35%)
          update.original_price = Math.round(newPrice * 1.35 / 100) * 100;
        }
      }

      // Stock: CJ devuelve stock por variante, usamos el total disponible
      const cjStock = parseInt(d.inventoryTotal ?? d.stock ?? "-1");
      if (cjStock >= 0 && cjStock !== product.stock) {
        changes.push({ id: product.id, name: product.name, field: "stock", old: product.stock, new: cjStock });
        update.stock = cjStock;
        // Si stock llega a 0, ocultar el producto automáticamente
        if (cjStock === 0) update.active = false;
      }

      if (Object.keys(update).length > 0) {
        await admin.from("products").update(update).eq("id", product.id);
        updated++;
      }

      // Pequeña pausa para no saturar la API de CJ
      await new Promise(r => setTimeout(r, 200));

    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    total: products.length,
    updated,
    errors,
    changes,
    timestamp: new Date().toISOString(),
  });
}