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
  // SALUD — keywords compuestos estrictos para evitar falsos positivos
  { category: "salud", subcategory: "ecg",       label: "Relojes & ECG",        query: "smart watch ECG heart rate",          tag: "bestseller", keywords: ["ecg watch","ekg watch","smart watch","smartwatch","heart rate watch","health watch","fitness watch","sport watch","wristband tracker"] },
  { category: "salud", subcategory: "tension",    label: "Tensiómetros Smart",   query: "blood pressure monitor wrist",        tag: "destacado",  keywords: ["blood pressure","pressure monitor","sphygmomanometer","bp monitor","blood pressure cuff","wrist blood pressure"] },
  { category: "salud", subcategory: "sueno",      label: "Sueño & Descanso",     query: "sleep tracker wearable smart",        tag: "nuevo",      keywords: ["sleep tracker","sleep monitor","sleep quality","sleep apnea","snore stopper","snoring device","smart sleep","sleep band"] },
  { category: "salud", subcategory: "glucometro", label: "Glucómetros",          query: "glucose monitor blood sugar",         tag: "destacado",  keywords: ["glucose","glucometer","blood sugar","blood glucose","cgm","diabetes monitor","glycemia"] },
  { category: "salud", subcategory: "termometro", label: "Termómetros Smart",    query: "digital thermometer forehead",        tag: "oferta",     keywords: ["thermometer","fever","forehead thermometer","ear thermometer","temperature gun","digital thermometer","infrared thermometer"] },
  { category: "salud", subcategory: "oximetro",   label: "Oxímetros",            query: "pulse oximeter fingertip spo2",       tag: "oferta",     keywords: ["oximeter","spo2","pulse oximeter","fingertip oximeter","oxygen saturation","blood oxygen"] },
  { category: "salud", subcategory: "masaje",     label: "Masajeadores",         query: "massage gun percussion deep tissue",  tag: "bestseller", keywords: ["massage gun","percussion gun","fascia gun","deep tissue massager","muscle gun","therapy gun","gun massager","electric massager","percussion massager"] },
  // BELLEZA
  { category: "belleza", subcategory: "piel",    label: "Cuidado de Piel IA",   query: "skin analyzer facial beauty device",  tag: "nuevo",      keywords: ["skin analyzer","facial device","face device","pore cleaner","skin care device","beauty device","skin tester","face cleaner","blackhead remover"] },
  { category: "belleza", subcategory: "ipl",     label: "Depilación IPL",       query: "IPL laser hair removal device",       tag: "bestseller", keywords: ["ipl","laser hair removal","hair removal device","epilator laser","photoepilation","permanent hair removal","depilation device"] },
  { category: "belleza", subcategory: "facial",  label: "Masaje Facial Smart",  query: "EMS microcurrent face lift device",   tag: "destacado",  keywords: ["ems","microcurrent","face lift","face massager","led mask","rf beauty","face lifting device","facial toning","anti-aging device","beauty instrument"] },
  { category: "belleza", subcategory: "espejo",  label: "Espejos Inteligentes", query: "LED lighted makeup mirror vanity",    tag: "oferta",     keywords: ["makeup mirror","led mirror","vanity mirror","lighted mirror","illuminated mirror","smart mirror","beauty mirror"] },
  { category: "belleza", subcategory: "cepillo", label: "Cepillos Sónicos",     query: "sonic electric toothbrush smart",     tag: "oferta",     keywords: ["electric toothbrush","sonic toothbrush","ultrasonic toothbrush","teeth whitening device","water flosser","oral irrigator"] },
  // HOGAR
  { category: "hogar", subcategory: "iluminacion", label: "Iluminación Smart",   query: "smart LED bulb wifi rgb",             tag: "oferta",     keywords: ["smart bulb","wifi bulb","rgb bulb","smart light","led strip","light strip","color bulb","smart lamp","wifi lamp","smart rgb"] },
  { category: "hogar", subcategory: "enchufes",    label: "Enchufes & Energía",  query: "smart plug wifi power monitor",       tag: "oferta",     keywords: ["smart plug","wifi plug","smart outlet","smart socket","smart power strip","energy monitor plug","timer plug","wifi socket"] },
  { category: "hogar", subcategory: "seguridad",   label: "Cámaras & Seguridad", query: "wifi security camera outdoor",        tag: "bestseller", keywords: ["security camera","wifi camera","ip camera","outdoor camera","surveillance camera","cctv camera","doorbell camera","smart camera","night vision camera"] },
  { category: "hogar", subcategory: "robots",      label: "Robots del Hogar",    query: "robot vacuum cleaner automatic",      tag: "bestseller", keywords: ["robot vacuum","robotic vacuum","sweeping robot","mopping robot","vacuum robot","floor robot","robot cleaner","auto vacuum"] },
  { category: "hogar", subcategory: "clima",       label: "Termostatos & Clima", query: "smart thermostat wifi temperature",   tag: "destacado",  keywords: ["smart thermostat","wifi thermostat","air purifier","smart fan","smart heater","dehumidifier","humidity sensor","smart climate","temperature controller"] },
  { category: "hogar", subcategory: "cerraduras",  label: "Cerraduras Smart",    query: "smart door lock fingerprint keypad",  tag: "nuevo",      keywords: ["smart lock","door lock","fingerprint lock","keypad lock","biometric lock","deadbolt smart","smart deadbolt","wifi lock","access control lock"] },
  // WEARABLES
  { category: "wearables", subcategory: "smartwatch", label: "Smartwatches",      query: "smartwatch fitness GPS health",       tag: "bestseller", keywords: ["smartwatch","smart watch","fitness watch","gps watch","sport watch","health watch","step counter watch","calorie watch","running watch"] },
  { category: "wearables", subcategory: "anillos",    label: "Smart Rings",       query: "smart ring health tracker NFC",       tag: "nuevo",      keywords: ["smart ring","health ring","fitness ring","nfc ring","oura ring","ring tracker","sleep ring"] },
  { category: "wearables", subcategory: "fitness",    label: "Fitness Trackers",  query: "fitness tracker band heart rate",     tag: "destacado",  keywords: ["fitness tracker","activity tracker","fitness band","heart rate band","smart band","step tracker","calorie tracker","sport band"] },
  { category: "wearables", subcategory: "gafas",      label: "Gafas Smart",       query: "smart glasses bluetooth audio",       tag: "nuevo",      keywords: ["smart glasses","bluetooth glasses","audio glasses","ar glasses","open ear glasses","vr glasses","ar headset"] },
  // MASCOTAS
  { category: "mascotas", subcategory: "gps-pet",      label: "GPS & Rastreo",          query: "pet GPS tracker collar",              tag: "bestseller", keywords: ["pet tracker","dog tracker","cat tracker","gps pet","pet gps","pet locator","collar tracker","real time pet","pet tracking"] },
  { category: "mascotas", subcategory: "comedero",     label: "Comederos Automáticos",  query: "automatic pet feeder wifi",           tag: "destacado",  keywords: ["automatic feeder","pet feeder","pet food dispenser","smart feeder","timed feeder","automatic pet","wifi feeder","cat feeder","dog feeder"] },
  { category: "mascotas", subcategory: "camara-pet",   label: "Cámaras para Mascotas",  query: "pet camera treat dispenser wifi",     tag: "nuevo",      keywords: ["pet camera","dog camera","cat camera","treat dispenser","pet monitor camera","interactive pet cam","pet cam wifi"] },
  { category: "mascotas", subcategory: "salud-pet",    label: "Monitores de Salud",     query: "pet health activity monitor smart",   tag: "oferta",     keywords: ["pet health monitor","pet activity monitor","health collar","pet vital","smart pet collar","pet fitness","dog health tracker"] },
  { category: "mascotas", subcategory: "juguetes-pet", label: "Juguetes Interactivos",  query: "interactive automatic cat toy laser",  tag: "oferta",     keywords: ["interactive cat toy","automatic cat toy","laser cat toy","robot cat toy","automatic dog toy","cat laser","interactive pet toy","ball launcher pet"] },
  // GADGETS
  { category: "gadgets", subcategory: "cargadores",  label: "Cargadores Inteligentes", query: "GaN fast charger USB-C power bank",   tag: "oferta",     keywords: ["gan charger","fast charger","quick charger","wireless charger","power bank","pd charger","usb-c charger","charging station","fast charging"] },
  { category: "gadgets", subcategory: "proyectores", label: "Proyectores Smart",       query: "mini projector portable wifi android", tag: "destacado",  keywords: ["mini projector","portable projector","pocket projector","smart projector","wifi projector","android projector","pico projector","home projector"] },
  { category: "gadgets", subcategory: "lamparas",    label: "Lámparas Inteligentes",   query: "smart LED desk lamp touch dimmer",    tag: "oferta",     keywords: ["smart lamp","led desk lamp","touch lamp","dimmable lamp","desk lamp smart","smart desk lamp","rgb desk lamp","gaming lamp","bedside smart lamp"] },
  { category: "gadgets", subcategory: "accesorios",  label: "Accesorios Tech",         query: "USB hub docking station type-c",      tag: "nuevo",      keywords: ["usb hub","usb-c hub","docking station","type-c hub","card reader hub","multiport hub","usb splitter","hdmi hub","laptop hub"] },
  // AUDIO
  { category: "audio", subcategory: "auriculares", label: "Auriculares ANC/IA",         query: "wireless earbuds noise cancelling ANC", tag: "bestseller", keywords: ["wireless earbuds","tws earbuds","noise cancelling earbuds","anc earbuds","bluetooth earbuds","in-ear wireless","headphones wireless","noise cancel headphone","bluetooth headphone"] },
  { category: "audio", subcategory: "parlantes",   label: "Parlantes Inteligentes",     query: "bluetooth speaker portable waterproof", tag: "destacado",  keywords: ["bluetooth speaker","portable speaker","wireless speaker","outdoor speaker","waterproof speaker","smart speaker","soundbar","bass speaker","speaker box"] },
  { category: "audio", subcategory: "traductores", label: "Traductores en Tiempo Real", query: "voice language translator device real time", tag: "nuevo",  keywords: ["voice translator","language translator","translation device","instant translator","real time translator","multilingual translator","portable translator"] },
  { category: "audio", subcategory: "micros",      label: "Micrófonos Smart",           query: "wireless lavalier microphone recording",tag: "destacado",  keywords: ["wireless microphone","lavalier mic","lapel microphone","wireless mic","collar microphone","clip mic","mini wireless mic","condenser wireless mic"] },
  // OFICINA
  { category: "oficina", subcategory: "teclados",      label: "Teclados & Ratones IA",    query: "wireless keyboard mouse bluetooth ergonomic", tag: "oferta",  keywords: ["wireless keyboard","bluetooth keyboard","mechanical keyboard","ergonomic keyboard","wireless mouse","bluetooth mouse","gaming keyboard","trackpad"] },
  { category: "oficina", subcategory: "monitores-of",  label: "Monitores Smart",          query: "portable monitor USB-C second screen", tag: "destacado",  keywords: ["portable monitor","usb-c monitor","second screen","external monitor","laptop monitor","travel monitor","ips portable","hdmi portable monitor"] },
  { category: "oficina", subcategory: "webcams",       label: "Webcams con IA",            query: "webcam 1080p autofocus USB",           tag: "nuevo",      keywords: ["webcam","web camera","pc camera","usb webcam","hd webcam","autofocus webcam","conference webcam","streaming webcam","1080p camera"] },
  { category: "oficina", subcategory: "productividad", label: "Gadgets de Productividad", query: "drawing tablet stylus digital pen",    tag: "nuevo",      keywords: ["drawing tablet","graphics tablet","digital pen","stylus tablet","writing tablet","smart pen","e-writer","pen tablet","wacom"] },
  // JUGUETES
  { category: "juguetes", subcategory: "educativos",  label: "Juguetes Educativos IA", query: "educational learning toy kids smart",  tag: "nuevo",      keywords: ["educational toy","learning toy","smart toy","interactive learning","stem toy","educational robot","kids coding","alphabet toy","learning machine","smart learning"] },
  { category: "juguetes", subcategory: "bebes",       label: "Monitores de Bebé",      query: "baby monitor camera wifi night vision", tag: "bestseller", keywords: ["baby monitor","baby camera","infant monitor","baby cam","nursery camera","wifi baby monitor","night vision baby","crib monitor"] },
  { category: "juguetes", subcategory: "robots-edu",  label: "Robots Educativos",      query: "programmable coding robot kids STEM",  tag: "nuevo",      keywords: ["coding robot","programmable robot","stem robot","educational robot","diy robot","robot kit","building robot","robot toy programmable"] },
  { category: "juguetes", subcategory: "stem",        label: "STEM & Coding",          query: "STEM electronics kit children coding", tag: "destacado",  keywords: ["stem kit","coding kit","electronics kit","robot kit","science kit","circuit kit","programming kit","stem learning","diy electronics"] },
  // DEPORTES
  { category: "deportes", subcategory: "relojes-dep",  label: "Relojes Deportivos",        query: "sports GPS watch running multisport",  tag: "bestseller", keywords: ["sports watch","gps watch","running watch","multisport watch","outdoor watch","swimming watch","triathlon watch","cycling watch","trail watch"] },
  { category: "deportes", subcategory: "sensores-dep", label: "Sensores de Entrenamiento", query: "smart jump rope speed sensor calorie",  tag: "oferta",     keywords: ["smart jump rope","smart skipping rope","speed jump rope","calorie jump rope","smart rope counter","heart rate sensor","cadence sensor","fitness sensor"] },
  { category: "deportes", subcategory: "ropa-smart",   label: "Ropa Inteligente",          query: "electric heated jacket vest gloves",   tag: "nuevo",      keywords: ["heated jacket","electric heated","heated vest","heated gloves","heated socks","heating jacket","usb heated","electric heating vest","smart heated"] },
  { category: "deportes", subcategory: "equipos-dep",  label: "Equipos con IA",            query: "smart exercise bike treadmill training",tag: "destacado",  keywords: ["smart treadmill","smart exercise bike","smart rowing","smart gym","smart trainer","connected bike","fitness machine","workout machine","smart elliptical"] },
  // ELECTRONICA
  { category: "electronica", subcategory: "tablets",         label: "Tablets Smart",         query: "graphics drawing tablet stylus pen",  tag: "destacado",  keywords: ["drawing tablet","graphics tablet","pen tablet","stylus tablet","digital drawing","display tablet","wacom","digital art tablet"] },
  { category: "electronica", subcategory: "streaming",       label: "Streaming & Smart TV",  query: "android tv stick streaming 4K hdmi",  tag: "oferta",     keywords: ["tv stick","android tv stick","streaming stick","4k tv stick","hdmi stick","media player stick","smart tv stick","fire stick","tv dongle"] },
  { category: "electronica", subcategory: "accesorios-elec", label: "Accesorios Smart",      query: "USB-C hub docking station multi-port", tag: "oferta",     keywords: ["usb-c hub","type-c hub","docking station","multiport hub","usb hub","hdmi hub","laptop hub","usb c adapter hub"] },
  // TELEFONOS
  { category: "telefonos", subcategory: "smartphones",    label: "Smartphones IA",       query: "android smartphone 5G unlocked camera", tag: "destacado",  keywords: ["android smartphone","unlocked smartphone","5g smartphone","android phone","unlocked phone","4g smartphone","dual sim phone","android mobile"] },
  { category: "telefonos", subcategory: "accesorios-tel", label: "Accesorios Smart",     query: "magnetic phone holder car mount",      tag: "oferta",     keywords: ["phone holder","car phone mount","magnetic phone mount","dashboard holder","phone stand car","vent phone mount","windshield mount","selfie stick"] },
  { category: "telefonos", subcategory: "fundas",         label: "Fundas Inteligentes",  query: "smart phone case wallet battery",      tag: "oferta",     keywords: ["smart case","battery case","wallet phone case","leather phone case","phone wallet case","charging case","rfid phone case","folio case"] },
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
        pageSize: "20",
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
