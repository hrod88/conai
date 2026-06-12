import { cjGet } from "@/lib/cj";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { NextRequest } from "next/server";

const USD_CLP = 950;

type SeedEntry = {
  category: string;
  subcategory: string;
  label: string;
  query: string;
  tag: string;
  keywords: string[]; // al menos uno debe aparecer en el nombre del producto
};

const SEED_MAP: SeedEntry[] = [
  // SALUD
  { category: "salud", subcategory: "ecg",       label: "Relojes & ECG",        query: "smart watch fitness",                 tag: "bestseller", keywords: ["smartwatch","smart watch","fitness watch","sport watch","health watch","ecg","ekg","heart rate monitor","wristband monitor"] },
  { category: "salud", subcategory: "tension",    label: "Tensiómetros Smart",   query: "blood pressure monitor",              tag: "bestseller",  keywords: ["blood pressure","pressure monitor","sphygmomanometer","bp monitor","pressure cuff"] },
  { category: "salud", subcategory: "sueno",      label: "Sueño & Descanso",     query: "sleep monitor smart device",          tag: "nuevo",      keywords: ["sleep tracker","sleep monitor","sleep apnea","snore","snoring","sleep quality","sleep aid device","white noise machine"] },
  { category: "salud", subcategory: "glucometro", label: "Glucómetros",          query: "glucose blood sugar monitor",         tag: "bestseller",  keywords: ["glucose","glucometer","blood sugar","blood glucose","cgm","glycemia","uric acid monitor"] },
  { category: "salud", subcategory: "termometro", label: "Termómetros Smart",    query: "thermometer forehead digital",        tag: "descuento",     keywords: ["thermometer","forehead thermometer","ear thermometer","digital thermometer","temperature gun","fever thermometer"] },
  { category: "salud", subcategory: "oximetro",   label: "Oxímetros",            query: "oximeter pulse spo2 fingertip",       tag: "descuento",     keywords: ["oximeter","spo2","oxygen saturation","blood oxygen","pulse oximeter","fingertip oximeter"] },
  { category: "salud", subcategory: "masaje",     label: "Masajeadores",         query: "massage gun muscle relaxer",          tag: "bestseller", keywords: ["massager","massage gun","percussion","fascia","deep tissue","therapy gun","muscle relaxer","electric massager","back massager","neck massager"] },
  // BELLEZA
  { category: "belleza", subcategory: "piel",    label: "Cuidado de Piel IA",   query: "facial skin care device",             tag: "nuevo",      keywords: ["skin analyzer","face device","facial device","pore cleaner","blackhead remover","face cleaner","skin care device","beauty device","face scrubber","facial cleanser device"] },
  { category: "belleza", subcategory: "ipl",     label: "Depilación IPL",       query: "IPL hair removal laser",              tag: "bestseller", keywords: ["ipl","laser hair removal","hair removal device","epilator","hair removal machine","depilation","photoepilat"] },
  { category: "belleza", subcategory: "facial",  label: "Masaje Facial Smart",  query: "EMS face lift microcurrent",          tag: "bestseller",  keywords: ["ems","microcurrent","face lift","face massager","led mask","rf beauty","facial toning","anti-aging","face lifting","beauty instrument","face sculptor"] },
  { category: "belleza", subcategory: "espejo",  label: "Espejos Inteligentes", query: "LED makeup mirror lighted",           tag: "descuento",     keywords: ["makeup mirror","led mirror","lighted mirror","vanity mirror","illuminated mirror","beauty mirror","smart mirror"] },
  { category: "belleza", subcategory: "cepillo", label: "Cepillos Sónicos",     query: "electric toothbrush sonic",           tag: "descuento",     keywords: ["electric toothbrush","sonic toothbrush","ultrasonic toothbrush","water flosser","oral irrigator","teeth whitening","toothbrush sonic"] },
  // HOGAR
  { category: "hogar", subcategory: "iluminacion", label: "Iluminación Smart",   query: "smart LED bulb wifi color",           tag: "descuento",     keywords: ["smart bulb","smart light","smart lamp","led bulb wifi","rgb bulb","color bulb","wifi bulb","led strip smart","smart rgb light"] },
  { category: "hogar", subcategory: "enchufes",    label: "Enchufes & Energía",  query: "smart plug wifi timer",               tag: "descuento",     keywords: ["smart plug","wifi plug","smart outlet","smart socket","smart power","timer plug","wifi switch","smart timer"] },
  { category: "hogar", subcategory: "seguridad",   label: "Cámaras & Seguridad", query: "wifi camera security outdoor",        tag: "bestseller", keywords: ["security camera","ip camera","wifi camera","outdoor camera","surveillance","doorbell camera","cctv","night vision camera","smart camera"] },
  { category: "hogar", subcategory: "robots",      label: "Robots del Hogar",    query: "robot vacuum sweeping mopping",       tag: "bestseller", keywords: ["robot vacuum","sweeping robot","mopping robot","robotic vacuum","robot cleaner","vacuum robot","auto vacuum","floor robot"] },
  { category: "hogar", subcategory: "clima",       label: "Termostatos & Clima", query: "smart thermostat air purifier",       tag: "bestseller",  keywords: ["thermostat","air purifier","smart fan","dehumidifier","humidity sensor","air quality","temperature controller","smart heater","humidifier smart"] },
  { category: "hogar", subcategory: "cerraduras",  label: "Cerraduras Smart",    query: "smart door lock fingerprint",         tag: "nuevo",      keywords: ["smart lock","fingerprint lock","keypad lock","door lock smart","biometric lock","digital lock","wifi lock","access control","deadbolt"] },
  // WEARABLES
  { category: "wearables", subcategory: "smartwatch", label: "Smartwatches",      query: "smartwatch health GPS sport",         tag: "bestseller", keywords: ["smartwatch","smart watch","fitness watch","gps watch","sport watch","health watch","running watch","step watch","calorie watch","activity watch"] },
  { category: "wearables", subcategory: "anillos",    label: "Smart Rings",       query: "smart ring health NFC",               tag: "nuevo",      keywords: ["smart ring","health ring","fitness ring","nfc ring","ring tracker","sleep ring","smart finger ring"] },
  { category: "wearables", subcategory: "fitness",    label: "Fitness Trackers",  query: "fitness band activity tracker",       tag: "bestseller",  keywords: ["fitness tracker","activity tracker","fitness band","smart band","heart rate band","sport band","step band","calorie band"] },
  { category: "wearables", subcategory: "gafas",      label: "Gafas Smart",       query: "smart glasses bluetooth",             tag: "nuevo",      keywords: ["smart glasses","bluetooth glasses","audio glasses","ar glasses","open ear glasses","vr glasses","ar headset","smart eyewear"] },
  // MASCOTAS
  { category: "mascotas", subcategory: "gps-pet",      label: "GPS & Rastreo",          query: "pet GPS tracker",                     tag: "bestseller", keywords: ["pet tracker","pet gps","dog tracker","cat tracker","gps collar","pet locator","animal tracker","gps pet"] },
  { category: "mascotas", subcategory: "comedero",     label: "Comederos Automáticos",  query: "automatic pet feeder",                tag: "bestseller",  keywords: ["pet feeder","automatic feeder","smart feeder","cat feeder","dog feeder","pet food dispenser","timed feeder","auto feeder"] },
  { category: "mascotas", subcategory: "camara-pet",   label: "Cámaras para Mascotas",  query: "pet camera wifi",                     tag: "nuevo",      keywords: ["pet camera","dog camera","cat camera","treat dispenser","pet cam","pet monitor camera"] },
  { category: "mascotas", subcategory: "salud-pet",    label: "Monitores de Salud",     query: "pet health monitor activity",         tag: "descuento",     keywords: ["pet health","health collar","pet vital","pet activity","smart collar","pet monitor","dog health","cat health"] },
  { category: "mascotas", subcategory: "juguetes-pet", label: "Juguetes Interactivos",  query: "cat toy automatic laser interactive", tag: "descuento",     keywords: ["cat toy","dog toy","interactive toy","automatic toy","laser toy","cat laser","feather toy","ball launcher","pet toy electric","robotic pet toy"] },
  // GADGETS
  { category: "gadgets", subcategory: "cargadores",  label: "Cargadores Inteligentes", query: "GaN charger USB-C fast charging",     tag: "descuento",     keywords: ["charger","gan","power bank","fast charge","wireless charger","quick charge","pd charger","charging hub","usb charger","multi charger"] },
  { category: "gadgets", subcategory: "proyectores", label: "Proyectores Smart",       query: "mini projector portable",             tag: "bestseller",  keywords: ["projector","mini projector","portable projector","pocket projector","smart projector","home projector","pico projector","led projector"] },
  { category: "gadgets", subcategory: "lamparas",    label: "Lámparas Inteligentes",   query: "LED desk lamp smart dimmer",          tag: "descuento",     keywords: ["desk lamp","led lamp","smart lamp","dimmable","touch lamp","rgb lamp","reading lamp smart","bedside lamp","table lamp led","gaming desk lamp"] },
  { category: "gadgets", subcategory: "accesorios",  label: "Accesorios Tech",         query: "USB hub type-c docking",              tag: "nuevo",      keywords: ["usb hub","usb-c hub","docking station","type-c hub","multiport","card reader","hdmi adapter","laptop hub","usb splitter"] },
  // AUDIO
  { category: "audio", subcategory: "auriculares", label: "Auriculares ANC/IA",         query: "wireless earbuds noise cancelling",    tag: "bestseller", keywords: ["earbuds","earphone","headphone","tws","wireless earphones","anc","noise cancel","bluetooth earphone","in-ear","over-ear bluetooth"] },
  { category: "audio", subcategory: "parlantes",   label: "Parlantes Inteligentes",     query: "bluetooth speaker portable",           tag: "bestseller",  keywords: ["bluetooth speaker","speaker bluetooth","portable speaker","wireless speaker","outdoor speaker","waterproof speaker","soundbar","smart speaker"] },
  { category: "audio", subcategory: "traductores", label: "Traductores en Tiempo Real", query: "language translator voice device",     tag: "nuevo",      keywords: ["translator","language translator","voice translator","translation device","instant translator","multilingual","real time translation"] },
  { category: "audio", subcategory: "micros",      label: "Micrófonos Smart",           query: "wireless microphone lavalier clip",    tag: "bestseller",  keywords: ["microphone","wireless mic","lavalier","lapel mic","clip microphone","condenser mic","recording mic","mini microphone"] },
  // OFICINA
  { category: "oficina", subcategory: "teclados",      label: "Teclados & Ratones IA",    query: "wireless keyboard mouse bluetooth",    tag: "descuento",     keywords: ["keyboard","wireless mouse","trackpad","mechanical","ergonomic keyboard","bluetooth keyboard","gaming keyboard","mouse pad","slim keyboard"] },
  { category: "oficina", subcategory: "monitores-of",  label: "Monitores Smart",          query: "portable monitor USB-C",               tag: "bestseller",  keywords: ["portable monitor","usb-c monitor","second screen","external monitor","laptop screen","ips portable","hdmi portable","travel monitor"] },
  { category: "oficina", subcategory: "webcams",       label: "Webcams con IA",            query: "webcam autofocus HD USB",              tag: "nuevo",      keywords: ["webcam","web cam","pc camera","usb webcam","conference camera","streaming webcam","autofocus cam","hd webcam","video camera pc"] },
  { category: "oficina", subcategory: "productividad", label: "Gadgets de Productividad", query: "drawing tablet stylus pen",            tag: "nuevo",      keywords: ["drawing tablet","graphics tablet","digital pen","stylus","pen tablet","writing tablet","smart pen","wacom","e-writer"] },
  // JUGUETES
  { category: "juguetes", subcategory: "educativos",  label: "Juguetes Educativos IA", query: "educational toy kids learning",        tag: "nuevo",      keywords: ["educational toy","learning toy","smart toy","stem toy","kids coding","alphabet toy","learning machine","interactive learning","educational robot","teaching toy"] },
  { category: "juguetes", subcategory: "bebes",       label: "Monitores de Bebé",      query: "baby monitor camera wifi",             tag: "bestseller", keywords: ["baby monitor","baby camera","infant monitor","nursery camera","baby cam","night vision baby","crib camera","baby video monitor"] },
  { category: "juguetes", subcategory: "robots-edu",  label: "Robots Educativos",      query: "coding robot programmable kids",       tag: "nuevo",      keywords: ["coding robot","programmable robot","stem robot","robot kit","building robot","diy robot","educational robot","arduino robot","robot toy"] },
  { category: "juguetes", subcategory: "stem",        label: "STEM & Coding",          query: "STEM kit electronics kids",            tag: "bestseller",  keywords: ["stem kit","coding kit","electronics kit","circuit kit","science kit","programming kit","diy kit","experiment kit","electronics learning"] },
  // DEPORTES
  { category: "deportes", subcategory: "relojes-dep",  label: "Relojes Deportivos",        query: "sport watch GPS running outdoor",      tag: "bestseller", keywords: ["sports watch","gps watch","running watch","outdoor watch","multisport watch","swimming watch","triathlon watch","cycling watch","trail watch","sport gps"] },
  { category: "deportes", subcategory: "sensores-dep", label: "Sensores de Entrenamiento", query: "jump rope smart counter calorie",       tag: "descuento",     keywords: ["jump rope","skipping rope","smart rope","speed rope","calorie rope","heart rate sensor","cadence sensor","running sensor","fitness sensor","sport sensor"] },
  { category: "deportes", subcategory: "ropa-smart",   label: "Ropa Inteligente",          query: "heated jacket electric vest gloves",   tag: "nuevo",      keywords: ["heated jacket","electric heated","heating jacket","heated vest","heated gloves","heated socks","usb heated","electric warming","heating pad wearable"] },
  { category: "deportes", subcategory: "equipos-dep",  label: "Equipos con IA",            query: "exercise bike treadmill fitness",       tag: "bestseller",  keywords: ["treadmill","exercise bike","rowing machine","fitness equipment","gym equipment","workout machine","elliptical","smart trainer","connected fitness"] },
  // ELECTRONICA
  { category: "electronica", subcategory: "tablets",         label: "Tablets Smart",         query: "drawing tablet pen digital",          tag: "bestseller",  keywords: ["drawing tablet","graphics tablet","pen tablet","digital drawing","display tablet","wacom","art tablet","stylus tablet","writing tablet"] },
  { category: "electronica", subcategory: "streaming",       label: "Streaming & Smart TV",  query: "TV stick android streaming 4K",       tag: "descuento",     keywords: ["tv stick","android tv","streaming stick","hdmi stick","media player","smart tv stick","4k stick","fire stick","tv dongle"] },
  { category: "electronica", subcategory: "accesorios-elec", label: "Accesorios Smart",      query: "USB-C hub docking station",           tag: "descuento",     keywords: ["usb hub","usb-c hub","docking station","multiport","hdmi hub","laptop hub","type-c adapter","card reader hub","usb splitter"] },
  // TELEFONOS
  { category: "telefonos", subcategory: "smartphones",    label: "Smartphones IA",       query: "android smartphone unlocked 5G",       tag: "bestseller",  keywords: ["smartphone","android phone","unlocked phone","5g phone","mobile phone","cell phone","dual sim","android mobile","4g phone"] },
  { category: "telefonos", subcategory: "accesorios-tel", label: "Accesorios Smart",     query: "phone holder mount magnetic car",      tag: "descuento",     keywords: ["phone holder","car mount","phone mount","magnetic holder","phone stand","vent mount","windshield mount","selfie stick","phone grip"] },
  { category: "telefonos", subcategory: "fundas",         label: "Fundas Inteligentes",  query: "phone case wallet leather battery",    tag: "descuento",     keywords: ["battery case","wallet case","phone wallet","leather case","charging case","rfid case","folio case","magnetic case","smart case"] },
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
  warehouse: string;
};

export type SeedGroup = {
  id: string;
  label: string;
  products: SeedProduct[];
};

function matchesKeywords(name: string, keywords: string[]): boolean {
  const lower = name.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

const WAREHOUSE_MULTIPLIER: Record<string, number> = {
  CN: 3.0,
  US: 3.5,
};

// GET ?category=salud&warehouse=CN → preview sin insertar
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const category  = req.nextUrl.searchParams.get("category");
  const warehouse = (req.nextUrl.searchParams.get("warehouse") ?? "CN").toUpperCase();

  if (!category) {
    const cats = [...new Set(SEED_MAP.map((e) => e.category))];
    return Response.json({ categories: cats });
  }

  const entries = SEED_MAP.filter((e) => e.category === category);
  if (!entries.length) return Response.json({ error: "Categoría no encontrada" }, { status: 404 });

  const multiplier = WAREHOUSE_MULTIPLIER[warehouse] ?? 3.0;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const groups: SeedGroup[] = [];
  for (const entry of entries) {
    try {
      const data = await cjGet("/product/list", {
        productNameEn: entry.query,
        pageNum: "1",
        pageSize: "50",
        sort: "BESTSELLING",
        warehouseCountryCode: warehouse,
      });

      const list: {
        pid: string;
        productNameEn: string;
        productImage: string;
        sellPrice: number;
        marketPrice?: number;
      }[] = data?.data?.list ?? [];

      const filtered = list.filter(
        (p) => p.sellPrice >= 5 && matchesKeywords(p.productNameEn ?? "", entry.keywords)
      );

      const products: SeedProduct[] = filtered.map((p) => {
        const price = Math.round(p.sellPrice * USD_CLP * multiplier / 100) * 100;
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
          warehouse:      warehouse,
        };
      });

      groups.push({ id: entry.subcategory, label: entry.label, products });
    } catch {
      groups.push({ id: entry.subcategory, label: entry.label, products: [] });
    }
    await sleep(1200);
  }

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
    warehouse:     p.warehouse,
    stock:         999,
    rating:        0,
    review_count:  0,
  }));

  const { data, error } = await admin.from("products").insert(rows).select("id");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, inserted: data?.length ?? 0 });
}
