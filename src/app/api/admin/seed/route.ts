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
  // SALUD — queries cortos que CJ entiende, keywords amplios
  { category: "salud", subcategory: "ecg",       label: "Relojes & ECG",        query: "smart watch ECG heart",               tag: "bestseller", keywords: ["watch","ecg","ekg","heart","pulse","health","smart","blood","monitor","wristband"] },
  { category: "salud", subcategory: "tension",    label: "Tensiómetros Smart",   query: "blood pressure monitor",              tag: "destacado",  keywords: ["blood pressure","pressure monitor","sphygmomanometer","bp monitor","hypertension"] },
  { category: "salud", subcategory: "sueno",      label: "Sueño & Descanso",     query: "sleep monitor wearable",              tag: "nuevo",      keywords: ["sleep","snore","snoring","sleep tracker","rest","insomnia","sleep apnea"] },
  { category: "salud", subcategory: "glucometro", label: "Glucómetros",          query: "glucose monitor bluetooth",           tag: "destacado",  keywords: ["glucose","glucometer","blood sugar","cgm","diabetes","glycemia","blood glucose"] },
  { category: "salud", subcategory: "termometro", label: "Termómetros Smart",    query: "infrared thermometer digital",        tag: "oferta",     keywords: ["thermometer","temperature","fever","infrared","thermomet","temp meter"] },
  { category: "salud", subcategory: "oximetro",   label: "Oxímetros",            query: "pulse oximeter finger",               tag: "oferta",     keywords: ["oximeter","oxygen","spo2","pulse ox","saturation","fingertip oximeter"] },
  { category: "salud", subcategory: "masaje",     label: "Masajeadores",         query: "massage gun deep tissue",             tag: "bestseller", keywords: ["massage","massager","percussion","fascia","kneading","therapy gun","relaxation","muscle"] },
  // BELLEZA
  { category: "belleza", subcategory: "piel",    label: "Cuidado de Piel IA",   query: "skin analyzer beauty device",         tag: "nuevo",      keywords: ["skin","facial","face","pore","analyzer","acne","beauty device","skin care","serum","cleanse"] },
  { category: "belleza", subcategory: "ipl",     label: "Depilación IPL",       query: "IPL hair removal device",             tag: "bestseller", keywords: ["ipl","laser","hair removal","epilator","depilat","photoepilat","permanent"] },
  { category: "belleza", subcategory: "facial",  label: "Masaje Facial Smart",  query: "EMS microcurrent face lift",          tag: "destacado",  keywords: ["ems","microcurrent","face lift","facial massage","face massager","led mask","face device","beauty instrument","rf beauty"] },
  { category: "belleza", subcategory: "espejo",  label: "Espejos Inteligentes", query: "LED makeup mirror",                   tag: "oferta",     keywords: ["mirror","makeup mirror","led mirror","vanity mirror","illuminated mirror","lighted mirror"] },
  { category: "belleza", subcategory: "cepillo", label: "Cepillos Sónicos",     query: "sonic electric toothbrush",           tag: "oferta",     keywords: ["toothbrush","sonic","electric toothbrush","teeth whitening","oral","dental"] },
  // HOGAR
  { category: "hogar", subcategory: "iluminacion", label: "Iluminación Smart",   query: "smart LED bulb wifi",                 tag: "oferta",     keywords: ["led","bulb","light","rgb","smart light","lamp","strip light","light controller","color light"] },
  { category: "hogar", subcategory: "enchufes",    label: "Enchufes & Energía",  query: "smart plug wifi",                     tag: "oferta",     keywords: ["plug","outlet","socket","power strip","smart plug","energy monitor","power meter","timer plug"] },
  { category: "hogar", subcategory: "seguridad",   label: "Cámaras & Seguridad", query: "security camera wifi",                tag: "bestseller", keywords: ["camera","cctv","security","surveillance","doorbell","cam","monitor","ip camera","outdoor cam"] },
  { category: "hogar", subcategory: "robots",      label: "Robots del Hogar",    query: "robot vacuum cleaner",                tag: "bestseller", keywords: ["robot","vacuum","robotic","sweeping","mopping","cleaner robot","auto clean","floor clean"] },
  { category: "hogar", subcategory: "clima",       label: "Termostatos & Clima", query: "smart thermostat temperature",        tag: "destacado",  keywords: ["thermostat","temperature","humidity","air purifier","smart fan","heater","climate","dehumidifier"] },
  { category: "hogar", subcategory: "cerraduras",  label: "Cerraduras Smart",    query: "smart door lock fingerprint",         tag: "nuevo",      keywords: ["lock","door lock","fingerprint","keypad","smart lock","deadbolt","biometric lock","access control"] },
  // WEARABLES
  { category: "wearables", subcategory: "smartwatch", label: "Smartwatches",      query: "smart watch health GPS",              tag: "bestseller", keywords: ["smart watch","smartwatch","fitness watch","gps watch","sport watch","health watch","digital watch","step counter","calorie"] },
  { category: "wearables", subcategory: "anillos",    label: "Smart Rings",       query: "smart ring health tracker",           tag: "nuevo",      keywords: ["smart ring","ring health","nfc ring","health ring","oura ring","fitness ring"] },
  { category: "wearables", subcategory: "fitness",    label: "Fitness Trackers",  query: "fitness band activity tracker",       tag: "destacado",  keywords: ["band","tracker","fitness","wristband","activity tracker","step","calorie band","heart rate band"] },
  { category: "wearables", subcategory: "gafas",      label: "Gafas Smart",       query: "smart glasses bluetooth audio",       tag: "nuevo",      keywords: ["smart glasses","ar glasses","audio glasses","open ear glasses","bluetooth glasses","vr glasses","ar headset"] },
  // MASCOTAS
  { category: "mascotas", subcategory: "gps-pet",      label: "GPS & Rastreo",          query: "pet GPS tracker collar",              tag: "bestseller", keywords: ["gps","tracker","locator","pet tracker","dog tracker","cat tracker","collar tracker","real time tracking"] },
  { category: "mascotas", subcategory: "comedero",     label: "Comederos Automáticos",  query: "automatic pet feeder",                tag: "destacado",  keywords: ["feeder","automatic feeder","pet feeder","dispenser","food dispenser","pet bowl","water fountain","pet food"] },
  { category: "mascotas", subcategory: "camara-pet",   label: "Cámaras para Mascotas",  query: "pet camera treat wifi",               tag: "nuevo",      keywords: ["pet camera","treat dispenser","pet monitor","dog camera","cat camera","interactive pet","pet cam"] },
  { category: "mascotas", subcategory: "salud-pet",    label: "Monitores de Salud",     query: "pet health monitor smart",            tag: "oferta",     keywords: ["pet health","activity monitor","pet monitor","health collar","pet vital","dog health","cat health"] },
  { category: "mascotas", subcategory: "juguetes-pet", label: "Juguetes Interactivos",  query: "interactive cat toy laser",           tag: "oferta",     keywords: ["toy","laser","interactive toy","automatic toy","cat toy","dog toy","pet toy","feather","wand","ball launcher"] },
  // GADGETS
  { category: "gadgets", subcategory: "cargadores",  label: "Cargadores Inteligentes", query: "GaN fast charger USB-C",              tag: "oferta",     keywords: ["charger","gan","usb-c","power bank","fast charge","wireless charger","charging","quick charge","pd charger"] },
  { category: "gadgets", subcategory: "proyectores", label: "Proyectores Smart",       query: "mini projector portable wifi",        tag: "destacado",  keywords: ["projector","mini projector","portable projector","pocket projector","home projector","pico projector"] },
  { category: "gadgets", subcategory: "lamparas",    label: "Lámparas Inteligentes",   query: "LED desk lamp touch dimmer",          tag: "oferta",     keywords: ["lamp","desk lamp","led lamp","night light","reading lamp","touch lamp","bedside lamp","table lamp"] },
  { category: "gadgets", subcategory: "accesorios",  label: "Accesorios Tech",         query: "USB hub adapter wireless",            tag: "nuevo",      keywords: ["hub","dongle","adapter","card reader","usb hub","wireless","bluetooth","docking","type-c adapter"] },
  // AUDIO
  { category: "audio", subcategory: "auriculares", label: "Auriculares ANC/IA",         query: "wireless earbuds noise cancelling",    tag: "bestseller", keywords: ["earphone","earbuds","headphone","tws","wireless","anc","noise cancel","in-ear","over-ear","bluetooth audio"] },
  { category: "audio", subcategory: "parlantes",   label: "Parlantes Inteligentes",     query: "bluetooth speaker portable",           tag: "destacado",  keywords: ["speaker","bluetooth speaker","portable speaker","soundbar","wireless speaker","stereo","sound box"] },
  { category: "audio", subcategory: "traductores", label: "Traductores en Tiempo Real", query: "language translator device",           tag: "nuevo",      keywords: ["translator","translation","language","interpreter","translate","multilingual","voice translator"] },
  { category: "audio", subcategory: "micros",      label: "Micrófonos Smart",           query: "wireless microphone lavalier",         tag: "destacado",  keywords: ["microphone","mic","wireless mic","lavalier","lapel mic","collar mic","condenser mic","mini mic"] },
  // OFICINA
  { category: "oficina", subcategory: "teclados",      label: "Teclados & Ratones IA",    query: "wireless keyboard mouse",              tag: "oferta",     keywords: ["keyboard","mouse","trackpad","wireless keyboard","mechanical","ergonomic","bluetooth keyboard","gaming keyboard"] },
  { category: "oficina", subcategory: "monitores-of",  label: "Monitores Smart",          query: "portable monitor USB-C display",       tag: "destacado",  keywords: ["monitor","display","screen","portable monitor","usb-c monitor","second screen","ips display","external screen"] },
  { category: "oficina", subcategory: "webcams",       label: "Webcams con IA",            query: "webcam HD autofocus 1080p",            tag: "nuevo",      keywords: ["webcam","web cam","webcam","video call","conference camera","meeting camera","autofocus","hd camera","pc camera"] },
  { category: "oficina", subcategory: "productividad", label: "Gadgets de Productividad", query: "digital writing tablet stylus",        tag: "nuevo",      keywords: ["notepad","writing tablet","digital pen","stylus","smart pen","e-writer","drawing tablet","graphics tablet","note tablet"] },
  // JUGUETES
  { category: "juguetes", subcategory: "educativos",  label: "Juguetes Educativos IA", query: "educational toy kids interactive",      tag: "nuevo",      keywords: ["educational","learning toy","kids toy","children","interactive toy","stem toy","smart toy","teach","alphabet"] },
  { category: "juguetes", subcategory: "bebes",       label: "Monitores de Bebé",      query: "baby monitor camera wifi",             tag: "bestseller", keywords: ["baby monitor","baby camera","infant monitor","crib","nursery","baby","night vision baby"] },
  { category: "juguetes", subcategory: "robots-edu",  label: "Robots Educativos",      query: "coding robot kids programmable",        tag: "nuevo",      keywords: ["robot","coding","programmable","stem robot","educational robot","building robot","rc robot","DIY robot"] },
  { category: "juguetes", subcategory: "stem",        label: "STEM & Coding",          query: "STEM kit children coding",             tag: "destacado",  keywords: ["stem","coding","programming","robot kit","science kit","electronics kit","circuit","experiment"] },
  // DEPORTES
  { category: "deportes", subcategory: "relojes-dep",  label: "Relojes Deportivos",        query: "sports watch GPS running",             tag: "bestseller", keywords: ["sports watch","sport watch","gps watch","running watch","multisport","outdoor watch","swim watch","triathlon","cycling watch","fitness watch"] },
  { category: "deportes", subcategory: "sensores-dep", label: "Sensores de Entrenamiento", query: "smart jump rope calorie counter",       tag: "oferta",     keywords: ["jump rope","skipping rope","skip rope","calorie","speed sensor","cadence","heart rate sensor","fitness sensor","smart rope"] },
  { category: "deportes", subcategory: "ropa-smart",   label: "Ropa Inteligente",          query: "heated jacket vest smart electric",    tag: "nuevo",      keywords: ["heated","heating","heat vest","heated jacket","thermal jacket","electric heat","warm vest","heated glove","smart heat","heating pad"] },
  { category: "deportes", subcategory: "equipos-dep",  label: "Equipos con IA",            query: "exercise equipment gym training",       tag: "destacado",  keywords: ["treadmill","exercise bike","rowing","gym equipment","training equipment","dumbbell","resistance","kettlebell","pull","workout machine"] },
  // ELECTRONICA
  { category: "electronica", subcategory: "tablets",         label: "Tablets Smart",         query: "drawing tablet stylus digital art",    tag: "destacado",  keywords: ["tablet","drawing tablet","graphics tablet","stylus","digital art","wacom","pen tablet","display tablet"] },
  { category: "electronica", subcategory: "streaming",       label: "Streaming & Smart TV",  query: "TV stick streaming android 4K",        tag: "oferta",     keywords: ["tv stick","streaming","android tv","smart tv","tv box","media player","fire stick","4k player","hdmi stick"] },
  { category: "electronica", subcategory: "accesorios-elec", label: "Accesorios Smart",      query: "USB hub docking station type-c",       tag: "oferta",     keywords: ["hub","dongle","adapter","usb hub","card reader","docking station","hdmi","type-c","usb splitter"] },
  // TELEFONOS
  { category: "telefonos", subcategory: "smartphones",    label: "Smartphones IA",       query: "smartphone android camera 5G",         tag: "destacado",  keywords: ["phone","smartphone","android","mobile","5g","camera phone","unlock phone","cell phone"] },
  { category: "telefonos", subcategory: "accesorios-tel", label: "Accesorios Smart",     query: "phone holder mount camera lens",       tag: "oferta",     keywords: ["phone holder","selfie","lens","mount","car mount","phone stand","ring holder","pop socket","phone grip"] },
  { category: "telefonos", subcategory: "fundas",         label: "Fundas Inteligentes",  query: "phone case cover protective",          tag: "oferta",     keywords: ["case","cover","phone case","protective case","wallet case","battery case","clear case","leather case","shockproof"] },
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

  const results = await Promise.allSettled(
    entries.map(async (entry) => {
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
    warehouse:     p.warehouse,
    stock:         999,
    rating:        0,
    review_count:  0,
  }));

  const { data, error } = await admin.from("products").insert(rows).select("id");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, inserted: data?.length ?? 0 });
}
