import { cjGet } from "@/lib/cj";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

const USD_CLP = 950;

type SeedEntry = { category: string; subcategory: string; label: string; query: string; tag: string };

const SEED_MAP: SeedEntry[] = [
  // SALUD
  { category: "salud", subcategory: "ecg",        label: "Relojes & ECG",           query: "ECG smart watch heart rate monitor 2024",           tag: "bestseller" },
  { category: "salud", subcategory: "tension",     label: "Tensiómetros Smart",      query: "smart blood pressure monitor bluetooth app",        tag: "destacado"  },
  { category: "salud", subcategory: "sueno",       label: "Sueño & Descanso",        query: "AI sleep tracker monitor wearable smart",           tag: "nuevo"      },
  { category: "salud", subcategory: "glucometro",  label: "Glucómetros",             query: "continuous glucose monitor smart CGM bluetooth",    tag: "destacado"  },
  { category: "salud", subcategory: "termometro",  label: "Termómetros Smart",       query: "smart infrared thermometer digital baby",           tag: "oferta"     },
  { category: "salud", subcategory: "oximetro",    label: "Oxímetros",               query: "smart pulse oximeter bluetooth health finger",      tag: "oferta"     },
  { category: "salud", subcategory: "masaje",      label: "Masajeadores",            query: "massage gun percussive therapy smart deep tissue",  tag: "bestseller" },
  // BELLEZA
  { category: "belleza", subcategory: "piel",      label: "Cuidado de Piel IA",      query: "AI skin analyzer face care smart device",           tag: "nuevo"      },
  { category: "belleza", subcategory: "ipl",       label: "Depilación IPL",          query: "IPL laser hair removal home device permanent",      tag: "bestseller" },
  { category: "belleza", subcategory: "facial",    label: "Masaje Facial Smart",     query: "EMS face lift microcurrent smart beauty device",    tag: "destacado"  },
  { category: "belleza", subcategory: "espejo",    label: "Espejos Inteligentes",    query: "smart LED makeup mirror adjustable light",          tag: "oferta"     },
  { category: "belleza", subcategory: "cepillo",   label: "Cepillos Sónicos",        query: "sonic smart electric toothbrush whitening app",     tag: "oferta"     },
  // HOGAR
  { category: "hogar", subcategory: "iluminacion", label: "Iluminación Smart",       query: "smart RGB LED bulb wifi app color voice",           tag: "oferta"     },
  { category: "hogar", subcategory: "enchufes",    label: "Enchufes & Energía",      query: "smart wifi plug energy power monitor app",          tag: "oferta"     },
  { category: "hogar", subcategory: "seguridad",   label: "Cámaras & Seguridad",     query: "AI detection security camera wifi outdoor 4K",      tag: "bestseller" },
  { category: "hogar", subcategory: "robots",      label: "Robots del Hogar",        query: "AI robot vacuum mop obstacle avoidance mapping",    tag: "bestseller" },
  { category: "hogar", subcategory: "clima",       label: "Termostatos & Clima",     query: "smart thermostat wifi temperature control app",     tag: "destacado"  },
  { category: "hogar", subcategory: "cerraduras",  label: "Cerraduras Smart",        query: "face recognition smart door lock fingerprint app",  tag: "nuevo"      },
  // WEARABLES
  { category: "wearables", subcategory: "smartwatch", label: "Smartwatches",         query: "smart watch health GPS AI 2024 fitness",            tag: "bestseller" },
  { category: "wearables", subcategory: "anillos",    label: "Smart Rings",          query: "smart ring health NFC sleep tracker 2024",          tag: "nuevo"      },
  { category: "wearables", subcategory: "fitness",    label: "Fitness Trackers",     query: "AI fitness tracker smart band health monitor",      tag: "destacado"  },
  { category: "wearables", subcategory: "gafas",      label: "Gafas Smart",          query: "smart glasses bluetooth audio open ear AR",         tag: "nuevo"      },
  // MASCOTAS
  { category: "mascotas", subcategory: "gps-pet",      label: "GPS & Rastreo",          query: "GPS pet tracker collar dog cat real time app",      tag: "bestseller" },
  { category: "mascotas", subcategory: "comedero",     label: "Comederos Automáticos",  query: "smart automatic pet feeder camera wifi app",        tag: "destacado"  },
  { category: "mascotas", subcategory: "camara-pet",   label: "Cámaras para Mascotas",  query: "smart pet camera treat dispenser interactive wifi", tag: "nuevo"      },
  { category: "mascotas", subcategory: "salud-pet",    label: "Monitores de Salud",     query: "smart pet health activity monitor collar",          tag: "oferta"     },
  { category: "mascotas", subcategory: "juguetes-pet", label: "Juguetes Interactivos",  query: "automatic interactive cat toy laser robot smart",    tag: "oferta"     },
  // GADGETS
  { category: "gadgets", subcategory: "cargadores",  label: "Cargadores Inteligentes", query: "smart GaN fast charger USB-C portable 65W",         tag: "oferta"     },
  { category: "gadgets", subcategory: "proyectores", label: "Proyectores Smart",       query: "smart mini projector wifi portable 1080p android",  tag: "destacado"  },
  { category: "gadgets", subcategory: "lamparas",    label: "Lámparas Inteligentes",   query: "smart LED desk lamp app dimmer wireless touch",     tag: "oferta"     },
  { category: "gadgets", subcategory: "accesorios",  label: "Accesorios Tech",         query: "smart tech gadget AI portable trending 2024",       tag: "nuevo"      },
  // AUDIO
  { category: "audio", subcategory: "auriculares", label: "Auriculares ANC/IA",      query: "ANC TWS earbuds AI noise cancelling 2024 hi-fi",    tag: "bestseller" },
  { category: "audio", subcategory: "parlantes",   label: "Parlantes Inteligentes",  query: "smart bluetooth speaker AI voice assistant",        tag: "destacado"  },
  { category: "audio", subcategory: "traductores", label: "Traductores en Tiempo Real", query: "AI real time translator earpiece device 2024",   tag: "nuevo"      },
  { category: "audio", subcategory: "micros",      label: "Micrófonos Smart",        query: "smart wireless microphone AI noise reduction",      tag: "destacado"  },
  // OFICINA
  { category: "oficina", subcategory: "teclados",      label: "Teclados & Ratones IA",    query: "smart ergonomic wireless keyboard AI backlit",      tag: "oferta"     },
  { category: "oficina", subcategory: "monitores-of",  label: "Monitores Smart",          query: "portable smart monitor USB-C display IPS touch",    tag: "destacado"  },
  { category: "oficina", subcategory: "webcams",       label: "Webcams con IA",            query: "AI webcam autofocus HD 1080p privacy smart",        tag: "nuevo"      },
  { category: "oficina", subcategory: "productividad", label: "Gadgets de Productividad", query: "smart digital notepad pen AI writing tablet",        tag: "nuevo"      },
  // JUGUETES
  { category: "juguetes", subcategory: "educativos",  label: "Juguetes Educativos IA", query: "AI educational toy kids smart learning interactive", tag: "nuevo"      },
  { category: "juguetes", subcategory: "bebes",       label: "Monitores de Bebé",      query: "smart baby monitor camera wifi AI breathing",       tag: "bestseller" },
  { category: "juguetes", subcategory: "robots-edu",  label: "Robots Educativos",      query: "programmable coding robot kids STEM AI 2024",       tag: "nuevo"      },
  { category: "juguetes", subcategory: "stem",        label: "STEM & Coding",          query: "STEM robot kit children coding AI learning",        tag: "destacado"  },
  // DEPORTES
  { category: "deportes", subcategory: "relojes-dep",  label: "Relojes Deportivos",        query: "GPS sport smart watch outdoor AI multisport 2024",  tag: "bestseller" },
  { category: "deportes", subcategory: "sensores-dep", label: "Sensores de Entrenamiento", query: "smart jump rope calorie sensor AI training",         tag: "oferta"     },
  { category: "deportes", subcategory: "ropa-smart",   label: "Ropa Inteligente",          query: "smart sport sensor fitness wearable AI",            tag: "nuevo"      },
  { category: "deportes", subcategory: "equipos-dep",  label: "Equipos con IA",            query: "smart fitness equipment AI training home gym",      tag: "destacado"  },
  // ELECTRONICA
  { category: "electronica", subcategory: "tablets",         label: "Tablets Smart",         query: "smart drawing tablet stylus pen AI digital art",   tag: "destacado"  },
  { category: "electronica", subcategory: "streaming",       label: "Streaming & Smart TV",  query: "smart TV stick 4K wifi streaming AI voice",         tag: "oferta"     },
  { category: "electronica", subcategory: "accesorios-elec", label: "Accesorios Smart",      query: "smart electronics accessory gadget AI 2024",        tag: "oferta"     },
  // TELEFONOS
  { category: "telefonos", subcategory: "smartphones",    label: "Smartphones IA",        query: "AI smartphone camera smart lens phone 2024",        tag: "destacado"  },
  { category: "telefonos", subcategory: "accesorios-tel", label: "Accesorios Smart",      query: "smart phone camera lens AI accessory",              tag: "oferta"     },
  { category: "telefonos", subcategory: "fundas",         label: "Fundas Inteligentes",   query: "smart battery phone case wireless charging AI",     tag: "oferta"     },
];

export type SeedProduct = {
  pid: string;
  name: string;
  image: string | null;
  price: number;
  original_price: number;
  category: string;
  subcategory: string;
  tag: string;
};

export type SeedGroup = {
  id: string;
  label: string;
  products: SeedProduct[];
};

// GET ?category=salud → preview sin insertar
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const category = req.nextUrl.searchParams.get("category");
  if (!category) {
    const cats = [...new Set(SEED_MAP.map((e) => e.category))];
    return Response.json({ categories: cats });
  }

  const entries = SEED_MAP.filter((e) => e.category === category);
  if (!entries.length) return Response.json({ error: "Categoría no encontrada" }, { status: 404 });

  const results = await Promise.allSettled(
    entries.map(async (entry) => {
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

      const filtered = list.filter((p) => p.marketPrice && p.marketPrice > 0 && p.sellPrice > 0);

      const products: SeedProduct[] = filtered.map((p) => {
        const price = Math.round(p.sellPrice * USD_CLP * 3 / 100) * 100;
        const marketCLP = Math.round((p.marketPrice ?? 0) * USD_CLP / 100) * 100;
        const original_price = marketCLP > price ? marketCLP : Math.round(price * 1.35 / 100) * 100;
        return {
          pid:            p.pid,
          name:           p.productNameEn,
          image:          p.productImage || null,
          price,
          original_price,
          category:       entry.category,
          subcategory:    entry.subcategory,
          tag:            entry.tag,
        };
      });

      return { id: entry.subcategory, label: entry.label, products } as SeedGroup;
    })
  );

  const groups: SeedGroup[] = results
    .filter((r): r is PromiseFulfilledResult<SeedGroup> => r.status === "fulfilled")
    .map((r) => r.value);

  const total = groups.reduce((acc, g) => acc + g.products.length, 0);
  return Response.json({ category, groups, total });
}

// POST { products: SeedProduct[] } → insertar aprobados
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { products } = await req.json() as { products: SeedProduct[] };
  if (!Array.isArray(products) || !products.length) {
    return Response.json({ error: "Sin productos" }, { status: 400 });
  }

  const admin = createAdminClient();
  const rows = products.map((p) => ({
    name:          p.name,
    description:   p.name,
    price:         p.price,
    original_price: p.original_price,
    category:      p.category,
    subcategory:   p.subcategory,
    tag:           p.tag || null,
    image:         p.image || null,
    icon:          "📦",
    cj_pid:        p.pid,
    stock:         999,
    rating:        0,
    review_count:  0,
  }));

  const { data, error } = await admin.from("products").insert(rows).select("id");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, inserted: data?.length ?? 0 });
}
