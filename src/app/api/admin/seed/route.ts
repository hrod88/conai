import { cjGet } from "@/lib/cj";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

const USD_CLP = 950;

type SeedEntry = { category: string; subcategory: string; query: string; tag: string };

export const SEED_MAP: SeedEntry[] = [
  // SALUD
  { category: "salud",      subcategory: "ecg",           query: "ECG smart watch heart rate monitor",              tag: "bestseller" },
  { category: "salud",      subcategory: "tension",        query: "smart blood pressure monitor bluetooth app",      tag: "destacado"  },
  { category: "salud",      subcategory: "sueno",          query: "smart sleep tracker AI monitor wearable",         tag: "nuevo"      },
  { category: "salud",      subcategory: "glucometro",     query: "smart glucometer bluetooth continuous glucose",    tag: "destacado"  },
  { category: "salud",      subcategory: "termometro",     query: "smart infrared thermometer digital",              tag: "oferta"     },
  { category: "salud",      subcategory: "oximetro",       query: "smart pulse oximeter bluetooth health",           tag: "oferta"     },
  { category: "salud",      subcategory: "masaje",         query: "smart massage gun percussive therapy deep",       tag: "bestseller" },
  // BELLEZA
  { category: "belleza",    subcategory: "piel",           query: "AI skin analyzer face care smart device",         tag: "nuevo"      },
  { category: "belleza",    subcategory: "ipl",            query: "IPL laser hair removal home device permanent",     tag: "bestseller" },
  { category: "belleza",    subcategory: "facial",         query: "EMS face lift microcurrent smart beauty device",  tag: "destacado"  },
  { category: "belleza",    subcategory: "espejo",         query: "smart LED makeup mirror adjustable light",        tag: "oferta"     },
  { category: "belleza",    subcategory: "cepillo",        query: "sonic smart electric toothbrush app whitening",   tag: "oferta"     },
  // HOGAR
  { category: "hogar",      subcategory: "iluminacion",    query: "smart RGB LED bulb wifi app color",               tag: "oferta"     },
  { category: "hogar",      subcategory: "enchufes",       query: "smart wifi plug energy power monitor app",        tag: "oferta"     },
  { category: "hogar",      subcategory: "seguridad",      query: "AI detection security camera wifi outdoor 4K",    tag: "bestseller" },
  { category: "hogar",      subcategory: "robots",         query: "AI robot vacuum mop obstacle avoidance mapping",  tag: "bestseller" },
  { category: "hogar",      subcategory: "clima",          query: "smart thermostat wifi temperature control app",   tag: "destacado"  },
  { category: "hogar",      subcategory: "cerraduras",     query: "face recognition smart door lock fingerprint",    tag: "nuevo"      },
  // WEARABLES
  { category: "wearables",  subcategory: "smartwatch",     query: "smart watch health GPS AI 2024",                  tag: "bestseller" },
  { category: "wearables",  subcategory: "anillos",        query: "smart ring health NFC tracker 2024",              tag: "nuevo"      },
  { category: "wearables",  subcategory: "fitness",        query: "AI fitness tracker smart band health monitor",    tag: "destacado"  },
  { category: "wearables",  subcategory: "gafas",          query: "smart glasses bluetooth audio AR wearable",       tag: "nuevo"      },
  // MASCOTAS
  { category: "mascotas",   subcategory: "gps-pet",        query: "GPS pet tracker collar dog cat real time",        tag: "bestseller" },
  { category: "mascotas",   subcategory: "comedero",       query: "smart automatic pet feeder camera wifi app",      tag: "destacado"  },
  { category: "mascotas",   subcategory: "camara-pet",     query: "smart pet camera treat dispenser interactive",    tag: "nuevo"      },
  { category: "mascotas",   subcategory: "salud-pet",      query: "smart pet health activity monitor collar",        tag: "oferta"     },
  { category: "mascotas",   subcategory: "juguetes-pet",   query: "automatic interactive cat toy laser smart",       tag: "oferta"     },
  // GADGETS
  { category: "gadgets",    subcategory: "cargadores",     query: "smart GaN fast charger USB-C portable 65W",       tag: "oferta"     },
  { category: "gadgets",    subcategory: "proyectores",    query: "smart mini projector wifi portable 1080p",        tag: "destacado"  },
  { category: "gadgets",    subcategory: "lamparas",       query: "smart LED desk lamp app dimmer wireless",         tag: "oferta"     },
  { category: "gadgets",    subcategory: "accesorios",     query: "smart tech gadget AI portable 2024 trending",     tag: "nuevo"      },
  // AUDIO
  { category: "audio",      subcategory: "auriculares",    query: "ANC TWS earbuds AI noise cancelling 2024",        tag: "bestseller" },
  { category: "audio",      subcategory: "parlantes",      query: "smart bluetooth speaker AI voice assistant",      tag: "destacado"  },
  { category: "audio",      subcategory: "traductores",    query: "AI real time translator earpiece device 2024",    tag: "nuevo"      },
  { category: "audio",      subcategory: "micros",         query: "smart wireless microphone AI noise reduction",    tag: "destacado"  },
  // OFICINA
  { category: "oficina",    subcategory: "teclados",       query: "smart ergonomic wireless keyboard AI backlit",    tag: "oferta"     },
  { category: "oficina",    subcategory: "monitores-of",   query: "portable smart monitor USB-C display IPS",        tag: "destacado"  },
  { category: "oficina",    subcategory: "webcams",        query: "AI webcam autofocus HD 1080p privacy",            tag: "nuevo"      },
  { category: "oficina",    subcategory: "productividad",  query: "smart digital notepad pen AI writing tablet",     tag: "nuevo"      },
  // JUGUETES
  { category: "juguetes",   subcategory: "educativos",     query: "AI educational toy kids smart learning 2024",     tag: "nuevo"      },
  { category: "juguetes",   subcategory: "bebes",          query: "smart baby monitor camera wifi AI breathing",     tag: "bestseller" },
  { category: "juguetes",   subcategory: "robots-edu",     query: "programmable coding robot kids STEM AI",          tag: "nuevo"      },
  { category: "juguetes",   subcategory: "stem",           query: "STEM robot kit children coding AI learning",      tag: "destacado"  },
  // DEPORTES
  { category: "deportes",   subcategory: "relojes-dep",    query: "GPS sport smart watch outdoor AI multisport",     tag: "bestseller" },
  { category: "deportes",   subcategory: "sensores-dep",   query: "smart jump rope calorie sensor AI training",      tag: "oferta"     },
  { category: "deportes",   subcategory: "ropa-smart",     query: "smart sport sensor fitness wearable AI",          tag: "nuevo"      },
  { category: "deportes",   subcategory: "equipos-dep",    query: "smart fitness equipment AI training home",        tag: "destacado"  },
  // ELECTRONICA
  { category: "electronica",subcategory: "tablets",        query: "smart drawing tablet stylus pen AI digital",      tag: "destacado"  },
  { category: "electronica",subcategory: "streaming",      query: "smart TV stick 4K wifi streaming AI voice",       tag: "oferta"     },
  { category: "electronica",subcategory: "accesorios-elec",query: "smart electronics accessory gadget AI 2024",      tag: "oferta"     },
  // TELEFONOS
  { category: "telefonos",  subcategory: "smartphones",    query: "AI smartphone camera smart phone 2024",           tag: "destacado"  },
  { category: "telefonos",  subcategory: "accesorios-tel", query: "smart phone camera lens AI accessory",            tag: "oferta"     },
  { category: "telefonos",  subcategory: "fundas",         query: "smart battery phone case wireless charging AI",   tag: "oferta"     },
];

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;
  return Response.json({ total: SEED_MAP.length });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { index } = await req.json() as { index: number };
  if (index < 0 || index >= SEED_MAP.length) {
    return Response.json({ error: "Índice inválido" }, { status: 400 });
  }

  const entry = SEED_MAP[index];

  try {
    const data = await cjGet("/product/list", {
      productNameEn: entry.query,
      pageNum: "1",
      pageSize: "20",
    });

    const list: {
      pid: string;
      productNameEn: string;
      productImage: string;
      sellPrice: number;
      marketPrice?: number;
    }[] = data?.data?.list ?? [];

    const admin = createAdminClient();
    let inserted = 0;

    for (const p of list) {
      if (!p.pid || !p.sellPrice) continue;
      const price = Math.round(p.sellPrice * USD_CLP * 3 / 100) * 100;
      const marketCLP = p.marketPrice ? Math.round(p.marketPrice * USD_CLP / 100) * 100 : null;
      const original_price = marketCLP && marketCLP > price
        ? marketCLP
        : Math.round(price * 1.4 / 100) * 100;

      const { error } = await admin.from("products").insert({
        name:          p.productNameEn,
        description:   p.productNameEn,
        price,
        original_price,
        category:      entry.category,
        subcategory:   entry.subcategory,
        tag:           entry.tag || null,
        image:         p.productImage || null,
        icon:          "📦",
        cj_pid:        p.pid,
        stock:         999,
        rating:        0,
        review_count:  0,
      });

      if (!error) inserted++;
    }

    return Response.json({
      ok: true,
      inserted,
      category:    entry.category,
      subcategory: entry.subcategory,
      total:       SEED_MAP.length,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
