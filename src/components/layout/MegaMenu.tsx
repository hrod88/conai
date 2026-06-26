"use client";

// MegaMenu.tsx — v4 DEFINITIVO
// ──────────────────────────────────────────────────────────────────────────
// Estructura dividida en 2 componentes que comparten estado via React Context:
//   - MegaMenu.Subnav: barra inferior del navbar con el botón "Todas las
//                      categorías" y los links rápidos. Va DENTRO del header
//                      sticky.
//   - MegaMenu.Panel:  el panel desplegable + overlay oscuro. Va FUERA del
//                      header sticky, a nivel raíz, para que su
//                      position:fixed funcione correctamente contra el
//                      viewport (no contra el contenedor sticky padre).
//
// Apertura: por HOVER automático sobre el botón. Cierra al sacar el cursor.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback, createContext, useContext, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

type SubCat = { em: string; name: string; slug: string };
type MiniProduct = {
  id: string; em: string; name: string;
  price: number; originalPrice: number; image?: string;
};
type Category = {
  id: string; em: string; name: string; count: number;
  color: string; bg: string;
  subcats: SubCat[]; products: MiniProduct[]; bannerText: string;
};

const CATS: Category[] = [
  { id:"wearables",em:"⌚",name:"Wearables",count:8,color:"#6366f1",bg:"linear-gradient(135deg,#6366f1,#38bdf8)",
    subcats:[{em:"⌚",name:"Smartwatches",slug:"smartwatches"},{em:"💪",name:"Pulseras fitness",slug:"pulseras-fitness"},{em:"💍",name:"Anillos inteligentes",slug:"anillos"},{em:"👓",name:"Gafas inteligentes",slug:"gafas"},{em:"📊",name:"Monitores de salud",slug:"monitores"}],
    products:[{id:"632f87da-802a-4f1e-9990-44fc65898559",em:"⌚",name:"Fitbit Charge 6 con ECG",price:390000,originalPrice:526500,image:"https://mzobwuzjdaqbyuadmtpw.supabase.co/storage/v1/object/public/product-images/ae-1781410127580-fbin3i.webp"},{id:"w002",em:"💍",name:"Anillo Monitor Salud R12M",price:30700,originalPrice:41400},{id:"w003",em:"📱",name:"Smartwatch F600 Glucómetro",price:89300,originalPrice:120600},{id:"w004",em:"👓",name:"Gafas Inteligentes con Cámara",price:114000,originalPrice:153900}],
    bannerText:"Wearables desde $30.700" },
  { id:"salud",em:"❤️",name:"Salud & Bienestar",count:14,color:"#dc2626",bg:"linear-gradient(135deg,#dc2626,#f97316)",
    subcats:[{em:"🩺",name:"Tensiómetros",slug:"tensiometros"},{em:"💊",name:"Oxímetros",slug:"oximetros"},{em:"💆",name:"Masajeadores",slug:"masajeadores"},{em:"🏃",name:"Caminadoras",slug:"caminadoras"},{em:"⚡",name:"EMS & TENS",slug:"ems"},{em:"📊",name:"Básculas smart",slug:"basculas"}],
    products:[{id:"s001",em:"🩺",name:"Tensiómetro Brazo Digital",price:59900,originalPrice:80900},{id:"s002",em:"💊",name:"Oxímetro de Dedo SpO2",price:26100,originalPrice:35200},{id:"s003",em:"💆",name:"Masajeador Shiatsu Cuello",price:85200,originalPrice:115000},{id:"s004",em:"🏃",name:"Caminadora Plegable 2en1",price:375000,originalPrice:506300}],
    bannerText:"Salud desde $26.100" },
  { id:"belleza",em:"✨",name:"Belleza Tech",count:9,color:"#a855f7",bg:"linear-gradient(135deg,#a855f7,#ec4899)",
    subcats:[{em:"💆",name:"Masajes faciales",slug:"masajes-faciales"},{em:"💡",name:"Terapia LED",slug:"led"},{em:"⚡",name:"RF y EMS facial",slug:"rf-ems"},{em:"💧",name:"Hidratación ultra",slug:"hidratacion"},{em:"🪒",name:"Depilación IPL",slug:"ipl"}],
    products:[{id:"b001",em:"💆",name:"Equipo Facial RF con EMS",price:51000,originalPrice:68900},{id:"b002",em:"💡",name:"Mascarilla LED Terapia",price:41000,originalPrice:55400},{id:"b003",em:"⚡",name:"EMS Facial Lifting",price:41100,originalPrice:55500},{id:"b004",em:"💧",name:"Equipo Belleza Plasma EMS",price:51000,originalPrice:68900}],
    bannerText:"Belleza Tech desde $41.000" },
  { id:"hogar",em:"🏠",name:"Hogar Inteligente",count:8,color:"#10b981",bg:"linear-gradient(135deg,#10b981,#0ea5e9)",
    subcats:[{em:"🤖",name:"Robots aspiradores",slug:"robots"},{em:"🍽️",name:"Comederos auto",slug:"comederos"},{em:"💡",name:"Iluminación smart",slug:"iluminacion"},{em:"🌱",name:"Jardín tech",slug:"jardin"}],
    products:[{id:"h001",em:"🤖",name:"Robot Aspirador 3 en 1",price:60500,originalPrice:81700},{id:"h002",em:"🍽️",name:"Comedero Automático 4L",price:189000,originalPrice:255200},{id:"h003",em:"💡",name:"Bombilla Smart LED WiFi",price:12000,originalPrice:16200},{id:"h004",em:"🔒",name:"Cerradura Smart Bluetooth",price:45000,originalPrice:60800}],
    bannerText:"Hogar smart desde $12.000" },
  { id:"mascotas",em:"🐾",name:"Mascotas Tech",count:5,color:"#0ea5e9",bg:"linear-gradient(135deg,#0ea5e9,#22c55e)",
    subcats:[{em:"🍽️",name:"Comederos auto",slug:"comederos-mascotas"},{em:"📹",name:"Cámaras pet",slug:"camaras-pet"},{em:"🎾",name:"Juguetes interactivos",slug:"juguetes-mascotas"},{em:"🏥",name:"Salud mascota",slug:"salud-mascotas"}],
    products:[{id:"m001",em:"🍽️",name:"Comedero Automático 4L",price:189000,originalPrice:255200},{id:"m002",em:"📹",name:"Cámara Pet Monitor WiFi",price:45000,originalPrice:60800},{id:"m003",em:"🎾",name:"Juguete Interactivo Laser",price:18500,originalPrice:25000},{id:"m004",em:"🏥",name:"Monitor Salud Mascota",price:35000,originalPrice:47300}],
    bannerText:"Tech para mascotas desde $18.500" },
  { id:"gadgets",em:"⚙️",name:"Gadgets",count:6,color:"#64748b",bg:"linear-gradient(135deg,#475569,#334155)",
    subcats:[{em:"🎥",name:"Cámaras termales",slug:"camaras-termales"},{em:"🔋",name:"Baterías & energía",slug:"baterias"},{em:"📡",name:"Conectividad",slug:"conectividad"},{em:"💻",name:"Accesorios PC",slug:"accesorios-pc"}],
    products:[{id:"g001",em:"🎥",name:"Cámara Térmica Android iOS",price:404500,originalPrice:546100},{id:"g002",em:"💻",name:"Hub USB-C Multipuerto HDMI",price:15000,originalPrice:20300},{id:"g003",em:"🔋",name:"Batería Solar 20000mAh",price:28000,originalPrice:37800},{id:"g004",em:"📡",name:"Repetidor WiFi Mesh Dual",price:22000,originalPrice:29700}],
    bannerText:"Gadgets desde $15.000" },
  { id:"audio",em:"🎧",name:"Audio",count:2,color:"#f97316",bg:"linear-gradient(135deg,#f97316,#fbbf24)",
    subcats:[{em:"🎧",name:"Audífonos BT",slug:"audifonos"},{em:"🌍",name:"Traductores",slug:"traductores"},{em:"🔊",name:"Parlantes",slug:"parlantes"}],
    products:[{id:"a001",em:"🎧",name:"Audífonos Traductores 144 Idiomas",price:61600,originalPrice:83200},{id:"a002",em:"🎧",name:"Audífonos Traductores 114 Idiomas",price:11490,originalPrice:15500}],
    bannerText:"Audio tech desde $11.490" },
  { id:"oficina",em:"💼",name:"Oficina",count:4,color:"#8b5cf6",bg:"linear-gradient(135deg,#8b5cf6,#6366f1)",
    subcats:[{em:"📱",name:"Soportes & stands",slug:"soportes"},{em:"💡",name:"Iluminación desk",slug:"iluminacion-desk"},{em:"⌨️",name:"Periféricos",slug:"perifericos"}],
    products:[{id:"o001",em:"📱",name:"Soporte Escritorio Celular",price:17000,originalPrice:22900},{id:"o002",em:"📱",name:"Soporte Auto Carga 15W",price:16000,originalPrice:21600},{id:"o003",em:"💡",name:"Lámpara LED Escritorio",price:18000,originalPrice:24300},{id:"o004",em:"⌨️",name:"Mouse Ergonómico Inalámbrico",price:12500,originalPrice:16900}],
    bannerText:"Oficina smart desde $12.500" },
  { id:"deportes",em:"🏃",name:"Deportes",count:5,color:"#22c55e",bg:"linear-gradient(135deg,#22c55e,#16a34a)",
    subcats:[{em:"🏃",name:"Caminadoras",slug:"caminadoras-deporte"},{em:"💪",name:"Gym en casa",slug:"gym"},{em:"📊",name:"Medidores",slug:"medidores-deporte"},{em:"🧘",name:"Yoga & stretch",slug:"yoga"}],
    products:[{id:"d001",em:"🏃",name:"Caminadora Plegable con Barra",price:369900,originalPrice:499400},{id:"d002",em:"🏃",name:"Caminadora 2 en 1 Escritorio",price:375000,originalPrice:506300},{id:"d003",em:"💪",name:"Banda Resistencia Smart",price:15000,originalPrice:20300},{id:"d004",em:"📊",name:"Báscula Composición Corporal",price:25000,originalPrice:33800}],
    bannerText:"Deportes desde $15.000" },
  { id:"juguetes",em:"🎮",name:"Juguetes Tech",count:3,color:"#f43f5e",bg:"linear-gradient(135deg,#f43f5e,#f97316)",
    subcats:[{em:"🤖",name:"Robots educativos",slug:"robots-educativos"},{em:"🎮",name:"Drones",slug:"drones"},{em:"🎯",name:"Kits STEM",slug:"stem"}],
    products:[{id:"j001",em:"🤖",name:"Robot Educativo Programable",price:45000,originalPrice:60800},{id:"j002",em:"🎮",name:"Drone Mini con Cámara HD",price:38000,originalPrice:51400},{id:"j003",em:"🎯",name:"Kit STEM Electrónica Junior",price:22000,originalPrice:29700}],
    bannerText:"Tech para niños desde $22.000" },
  { id:"telefonos",em:"📱",name:"Teléfonos",count:4,color:"#0ea5e9",bg:"linear-gradient(135deg,#0ea5e9,#6366f1)",
    subcats:[{em:"📱",name:"Fundas & cases",slug:"fundas"},{em:"🔋",name:"Cargadores",slug:"cargadores"},{em:"📸",name:"Accesorios cámara",slug:"accesorios-camara"}],
    products:[{id:"t001",em:"📱",name:"Funda iPhone 16 Pro Max Circuito",price:7500,originalPrice:10100},{id:"t002",em:"📱",name:"Soporte Auto Carga 15W MagSafe",price:16000,originalPrice:21600},{id:"t003",em:"🔋",name:"Cargador Rápido 65W GaN",price:12000,originalPrice:16200},{id:"t004",em:"📱",name:"Funda Plateada con Lunares",price:10000,originalPrice:13500}],
    bannerText:"Accesorios desde $7.500" },
  { id:"electronica",em:"💻",name:"Electrónica",count:6,color:"#475569",bg:"linear-gradient(135deg,#334155,#6366f1)",
    subcats:[{em:"💻",name:"Hubs & adaptadores",slug:"hubs"},{em:"📷",name:"Webcams",slug:"webcams"},{em:"🔊",name:"Parlantes",slug:"parlantes-elec"},{em:"⌨️",name:"Teclados",slug:"teclados"}],
    products:[{id:"e001",em:"💻",name:"Hub USB-C 5 en 1 HDMI 4K",price:15000,originalPrice:20300},{id:"e002",em:"📷",name:"Webcam Full HD 1080p con Mic",price:18500,originalPrice:25000},{id:"e003",em:"🔊",name:"Parlante Bluetooth 20W IPX5",price:22000,originalPrice:29700},{id:"e004",em:"⌨️",name:"Teclado Mecánico RGB TKL",price:35000,originalPrice:47300}],
    bannerText:"Electrónica desde $15.000" },
];

function clp(n: number) { return `$${Math.round(n).toLocaleString("es-CL")}`; }
function disc(p: number, o: number) { return Math.round((1 - p / o) * 100); }

// ── Estado compartido entre Subnav y Panel ────────────────────────────
// Como ambos componentes están en lugares distintos del árbol pero deben
// compartir el mismo estado de apertura/categoría activa, los conectamos
// con un singleton fuera de React (más simple que Context para este caso).

type Listener = () => void;
const state = {
  open: false,
  activeId: CATS[0].id,
  listeners: new Set<Listener>(),
  closeTimer: null as ReturnType<typeof setTimeout> | null,
};

function notify() { state.listeners.forEach(l => l()); }

function useMegaMenuState() {
  const [, force] = useState({});
  useEffect(() => {
    const l = () => force({});
    state.listeners.add(l);
    return () => { state.listeners.delete(l); };
  }, []);

  const openNow = useCallback(() => {
    if (state.closeTimer) { clearTimeout(state.closeTimer); state.closeTimer = null; }
    if (!state.open) { state.open = true; notify(); }
  }, []);
  const scheduleClose = useCallback(() => {
    if (state.closeTimer) clearTimeout(state.closeTimer);
    state.closeTimer = setTimeout(() => {
      state.open = false;
      notify();
    }, 180);
  }, []);
  const closeNow = useCallback(() => {
    if (state.closeTimer) { clearTimeout(state.closeTimer); state.closeTimer = null; }
    state.open = false;
    notify();
  }, []);
  const setActive = useCallback((id: string) => {
    state.activeId = id;
    notify();
  }, []);

  return {
    open: state.open,
    activeId: state.activeId,
    openNow,
    scheduleClose,
    closeNow,
    setActive,
  };
}

// Alturas: navbar (64) + subnav (40) + bordes (~2). Total: ~106px.
const TOP_OFFSET_PX = 106;

// ══════════════════════════════════════════════════════════════════════
// COMPONENTE 1: Subnav (la barra con el botón "Todas las categorías")
// Va dentro del <header> sticky.
// ══════════════════════════════════════════════════════════════════════
function Subnav() {
  const { open, openNow, scheduleClose } = useMegaMenuState();
  const [hovered, setHovered] = useState(false);
  const active = open || hovered;

  return (
    <div className="hidden md:block border-t" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-stretch h-10">
        <button
          onMouseEnter={() => { setHovered(true); openNow(); }}
          onMouseLeave={() => { setHovered(false); scheduleClose(); }}
          className="flex items-center gap-2 pr-4 font-extrabold text-[12.5px] flex-shrink-0 border-r transition-colors"
          style={{
            borderColor: "var(--border)",
            color: active ? "#6366f1" : "var(--text)",
          }}
        >
          <span className="flex flex-col gap-[3px]">
            <span className="block w-[15px] h-[2px] rounded" style={{ background: active ? "#6366f1" : "var(--text)" }} />
            <span className="block w-[15px] h-[2px] rounded" style={{ background: active ? "#6366f1" : "var(--text)" }} />
            <span className="block w-[15px] h-[2px] rounded" style={{ background: active ? "#6366f1" : "var(--text)" }} />
          </span>
          Todas las categorías
        </button>

        <div className="flex items-center gap-0 px-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            { label:"⚡ Flash Sale",       href:"/productos?tag=descuento",      hot:true  },
            { label:"Lo que está volando", href:"/productos?tag=bestseller",     hot:false },
            { label:"Recién llegados",     href:"/productos?tag=nuevo",          hot:false },
            { label:"Wearables",           href:"/productos?category=wearables", hot:false },
            { label:"Salud",               href:"/productos?category=salud",     hot:false },
            { label:"Gadgets",             href:"/productos?category=gadgets",   hot:false },
          ].map(l => (
            <Link
              key={l.href} href={l.href}
              className="px-3 h-full flex items-center text-[12px] whitespace-nowrap transition-colors hover:text-indigo-500 border-b-2 border-transparent hover:border-indigo-400"
              style={{ color: l.hot ? "#dc2626" : "var(--text-muted)", fontWeight: l.hot ? 800 : 600 }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// COMPONENTE 2: Panel (overlay oscuro + panel desplegable)
// Va FUERA del <header> sticky, a nivel raíz, para que su
// position:fixed funcione contra el viewport correctamente.
// ══════════════════════════════════════════════════════════════════════
function Panel() {
  const { open, activeId, openNow, scheduleClose, closeNow, setActive } = useMegaMenuState();

  // Escape para cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeNow(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeNow]);

  if (!open) return null;

  const activeCat = CATS.find(c => c.id === activeId) ?? CATS[0];

  return (
    <>
      {/* OVERLAY: mismo color que el panel (var(--bg)) para verse uniforme */}
      <div
        className="fixed left-0 right-0 bottom-0 hidden md:block"
        style={{
          top: `${TOP_OFFSET_PX}px`,
          background: "#ffffff",
          zIndex: 40,
        }}
        onMouseEnter={scheduleClose}
        onClick={closeNow}
      />

      {/* PANEL: max-w-6xl centrado, llega hasta el fondo */}
      <div
        className="fixed hidden md:flex"
        style={{
          top: `${TOP_OFFSET_PX}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "72rem", // = max-w-6xl = 1152px
          height: `calc(100vh - ${TOP_OFFSET_PX}px)`,
          zIndex: 50,
          background: "var(--bg)",
          boxShadow: "0 2px 8px rgba(0,0,0,.04)",
          borderTop: "none",
        }}
        onMouseEnter={openNow}
        onMouseLeave={scheduleClose}
      >
        {/* Columna izquierda */}
        <div
          className="flex-shrink-0 overflow-y-auto"
          style={{ width: "220px", background: "#ffffff", borderRight: "none" }}
        >
          {CATS.map(cat => (
            <button
              key={cat.id}
              onMouseEnter={() => setActive(cat.id)}
              onClick={closeNow}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all"
              style={{
                background: "transparent",
              }}
            >
              <span style={{ fontSize: "16px", width: "20px", textAlign: "center", flexShrink: 0 }}>
                {cat.em}
              </span>
              <span
                className="text-[12px] flex-1 text-left"
                style={{ color: cat.id === activeId ? "#6366f1" : "var(--text)", fontWeight: cat.id === activeId ? 700 : 600 }}
              >
                {cat.name}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{cat.count}</span>
              <span className="text-[10px]" style={{ color: cat.id === activeId ? "#6366f1" : "var(--text-muted)" }}>›</span>
            </button>
          ))}
        </div>

        {/* Columna derecha */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold" style={{ color: "var(--text)" }}>
                {activeCat.em} Subcategorías de {activeCat.name}
              </span>
              <Link
                href={`/productos?category=${activeCat.id}`}
                onClick={closeNow}
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700"
              >
                Ver todos ({activeCat.count}) →
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeCat.subcats.map(s => (
                <Link
                  key={s.slug}
                  href={`/productos?category=${activeCat.id}&subcategory=${s.slug}`}
                  onClick={closeNow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
                  style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--surface)" }}
                >
                  <span style={{ fontSize: "12px" }}>{s.em}</span>
                  {s.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-extrabold mb-2.5" style={{ color: "var(--text)" }}>
              ⭐ Más vendidos en {activeCat.name}
            </p>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              {activeCat.products.map(p => (
                <Link
                  key={p.id}
                  href={`/productos/${p.id}`}
                  onClick={closeNow}
                  className="rounded-xl overflow-hidden border transition-all hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <div className="aspect-square flex items-center justify-center relative" style={{ background: "var(--surface-alt)" }}>
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="120px" className="object-contain p-2" />
                    ) : (
                      <span style={{ fontSize: "28px" }}>{p.em}</span>
                    )}
                    <span
                      className="absolute top-1.5 right-1.5 text-white font-extrabold rounded"
                      style={{ background: "#dc2626", fontSize: "8.5px", padding: "2px 5px" }}
                    >
                      −{disc(p.price, p.originalPrice)}%
                    </span>
                  </div>
                  <div className="p-1.5">
                    <p
                      className="font-semibold leading-tight overflow-hidden"
                      style={{ fontSize: "9.5px", color: "var(--text)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}
                    >
                      {p.name}
                    </p>
                    <p className="font-extrabold mt-1" style={{ fontSize: "11.5px", color: "#dc2626" }}>
                      {clp(p.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-4 text-white flex items-center justify-between"
            style={{ background: activeCat.bg }}
          >
            <div>
              <p className="font-extrabold text-[10px] opacity-90 tracking-widest uppercase mb-1">⚡ CYBER SEMANA</p>
              <p className="font-extrabold text-[15px] leading-tight">{activeCat.bannerText}</p>
              <p className="text-[10px] opacity-85 mt-0.5">Hasta −26% · Envío gratis sobre $30.000</p>
            </div>
            <Link
              href={`/productos?category=${activeCat.id}`}
              onClick={closeNow}
              className="flex-shrink-0 bg-white font-extrabold rounded-full px-4 py-2 text-[11px] hover:opacity-90 transition-opacity"
              style={{ color: activeCat.color }}
            >
              Ver ofertas →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Export del namespace: MegaMenu.Subnav y MegaMenu.Panel.
// El export default es por compatibilidad (renderiza ambos juntos),
// pero en Navbar.tsx usamos los dos por separado.
// ──────────────────────────────────────────────────────────────────────
const MegaMenu = {
  Subnav,
  Panel,
};

export default MegaMenu;