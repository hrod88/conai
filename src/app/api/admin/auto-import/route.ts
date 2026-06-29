import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { cjGet } from "@/lib/cj";
import { NextRequest, NextResponse } from "next/server";

const USD_CLP = 950;

const CATEGORY_QUERIES: Record<string, string[]> = {
  salud:       ["blood pressure monitor", "pulse oximeter", "massage gun", "glucometer", "ecg watch"],
  belleza:     ["facial massager", "ipl hair removal", "led face mask"],
  telefonos:   ["smartphone case", "phone holder", "fast charger"],
  wearables:   ["smart glasses", "fitness tracker", "smart ring"],
  deportes:    ["sports watch", "exercise equipment", "resistance band"],
  hogar:       ["robot vacuum", "smart plug", "led bulb"],
  audio:       ["translator earbuds", "bluetooth speaker"],
  mascotas:    ["automatic pet feeder", "pet camera"],
  gadgets:     ["usb hub", "portable charger", "mini projector"],
  electronica: ["webcam", "mechanical keyboard", "usb adapter"],
};

export async function GET(req: NextRequest) {
  const isCron = req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
  if (!isCron) {
    const guard = await requireAdmin();
    if ("error" in guard) return guard.error;
  }

  const admin = createAdminClient();
  let totalAdded = 0;
  let totalSkipped = 0;

  const { data: existing } = await admin
    .from("products")
    .select("cj_pid")
    .not("cj_pid", "is", null);

  const { data: candidates } = await admin
    .from("product_candidates")
    .select("cj_pid");

  const existingPids = new Set([
   ...((existing ?? []) as Array<{ cj_pid: string | null }>).map((p) => p.cj_pid).filter((id): id is string => !!id),
    ...((candidates ?? []) as Array<{ cj_pid: string | null }>).map((p) => p.cj_pid).filter((id): id is string => !!id),
  ]);

  for (const [category, queries] of Object.entries(CATEGORY_QUERIES)) {
    const query = queries[Math.floor(Math.random() * queries.length)];

    try {
      const res = await cjGet("/product/list", {
        productNameEn: query,
        pageNum: "1",
        pageSize: "10",
        sortField: "BESTSELLING",
      });

      const products: Array<{
        pid: string;
        productNameEn: string;
        productImage?: string;
        sellPrice?: string;
      }> = res?.data?.list ?? [];

      for (const p of products) {
        if (existingPids.has(p.pid)) { totalSkipped++; continue; }

        const price = Math.round(parseFloat(p.sellPrice ?? "0") * USD_CLP * 3 / 100) * 100;
        if (price <= 0) continue;

        await admin.from("product_candidates").upsert({
          cj_pid:         p.pid,
          name:           p.productNameEn,
          image:          p.productImage ?? null,
          price:          String(price),
          original_price: String(Math.round(price * 1.35 / 100) * 100),
          category,
          subcategory:    null,
          tag:            "nuevo",
          status:         "pending",
        }, { onConflict: "cj_pid" });

        existingPids.add(p.pid);
        totalAdded++;
      }

      await new Promise(r => setTimeout(r, 300));

    } catch {
      // Continuar con la siguiente categoría si falla una
    }
  }

  return NextResponse.json({
    ok: true,
    added: totalAdded,
    skipped: totalSkipped,
    timestamp: new Date().toISOString(),
  });
}