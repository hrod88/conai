"use client";

// MegaMenu.tsx — v7 (clic en categoría navega a /[categoria])

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Watch, Heart, Sparkles, Home, PawPrint, Cpu, Headphones,
  Briefcase, Dumbbell, Gamepad2, Smartphone, Monitor,
  type LucideIcon,
} from "lucide-react";

type SubCat = { em: string; name: string; slug: string };
type MiniProduct = {
  id: string; em: string; name: string;
  price: number; originalPrice: number; image?: string;
};
type Category = {
  id: string; em: string; name: string; count: number;
  color: string; bg: string; Icon: LucideIcon;
  subcats: SubCat[]; products: MiniProduct[]; bannerText: string;
};

const CATS: Category[] = [
  { id:"wearables",em:"⌚",name:"Wearables",count:8,color:"#6366f1",bg:"linear-gradient(135deg,#6366f1,#38bdf8)",Icon:Watch,
    subcats:[{em:"👓",name:"Gafas Smart",slug:"gafas"}],
    products:[{id:"632f87da-802a-4f1e-9990-44fc65898559",em:"⌚",name:"Fitbit Charge 6 con ECG",price:390000,originalPrice:526500,image:"https://mzobwuzjdaqbyuadmtpw.supabase.co/storage/v1/object/public/product-images/ae-1781410127580-fbin3i.webp"},{id:"w002",em:"💍",name:"Anillo Monitor Salud R12M",price:30700,originalPrice:41400},{id:"w003",em:"📱",name:"Smartwatch F600 Glucómetro",price:89300,originalPrice:120600},{id:"w004",em:"👓",name:"Gafas Inteligentes con Cámara",price:114000,originalPrice:153900}],
    bannerText:"Wearables desde $30.700" },
  { id:"salud",em:"❤️",name:"Salud & Bienestar",count:14,color:"#dc2626",bg:"linear-gradient(135deg,#dc2626,#f97316)",Icon:Heart,
    subcats:[{em:"🩺",name:"Tensiómetros Smart",slug:"tension"},{em:"💊",name:"Oxímetros",slug:"oximetro"},{em:"💆",name:"Masajeadores",slug:"masaje"},{em:"🩸",name:"Glucómetros",slug:"glucometro"},{em:"❤️",name:"Relojes & ECG",slug:"ecg"}],
    products:[{id:"s001",em:"🩺",name:"Tensiómetro Brazo Digital",price:59900,originalPrice:80900},{id:"s002",em:"💊",name:"Oxímetro de Dedo SpO2",price:26100,originalPrice:35200},{id:"s003",em:"💆",name:"Masajeador Shiatsu Cuello",price:85200,originalPrice:115000},{id:"s004",em:"🏃",name:"Caminadora Plegable 2en1",price:375000,originalPrice:506300}],
    bannerText:"Salud desde $26.100" },
  { id:"belleza",em:"✨",name:"Belleza Tech",count:9,color:"#a855f7",bg:"linear-gradient(135deg,#a855f7,#ec4899)",Icon:Sparkles,
    subcats:[{em:"💆",name:"Masaje Facial Smart",slug:"facial"},{em:"🪒",name:"Depilación IPL",slug:"ipl"}],
    products:[{id:"b001",em:"💆",name:"Equipo Facial RF con EMS",price:51000,originalPrice:68900},{id:"b002",em:"💡",name:"Mascarilla LED Terapia",price:41000,originalPrice:55400},{id:"b003",em:"⚡",name:"EMS Facial Lifting",price:41100,originalPrice:55500},{id:"b004",em:"💧",name:"Equipo Belleza Plasma EMS",price:51000,originalPrice:68900}],
    bannerText:"Belleza Tech desde $41.000" },
  { id:"hogar",em:"🏠",name:"Hogar Inteligente",count:8,color:"#10b981",bg:"linear-gradient(135deg,#10b981,#0ea5e9)",Icon:Home,
    subcats:[{em:"🤖",name:"Robots del Hogar",slug:"robots"}],
    products:[{id:"h001",em:"🤖",name:"Robot Aspirador 3 en 1",price:60500,originalPrice:81700},{id:"h002",em:"🍽️",name:"Comedero Automático 4L",price:189000,originalPrice:255200},{id:"h003",em:"💡",name:"Bombilla Smart LED WiFi",price:12000,originalPrice:16200},{id:"h004",em:"🔒",name:"Cerradura Smart Bluetooth",price:45000,originalPrice:60800}],
    bannerText:"Hogar smart desde $12.000" },
  { id:"mascotas",em:"🐾",name:"Mascotas Tech",count:5,color:"#0ea5e9",bg:"linear-gradient(135deg,#0ea5e9,#22c55e)",Icon:PawPrint,
    subcats:[{em:"🍽️",name:"Comederos Automáticos",slug:"comedero"}],
    products:[{id:"m001",em:"🍽️",name:"Comedero Automático 4L",price:189000,originalPrice:255200},{id:"m002",em:"📹",name:"Cámara Pet Monitor WiFi",price:45000,originalPrice:60800},{id:"m003",em:"🎾",name:"Juguete Interactivo Laser",price:18500,originalPrice:25000},{id:"m004",em:"🏥",name:"Monitor Salud Mascota",price:35000,originalPrice:47300}],
    bannerText:"Tech para mascotas desde $18.500" },
  { id:"gadgets",em:"⚙️",name:"Gadgets",count:6,color:"#64748b",bg:"linear-gradient(135deg,#475569,#334155)",Icon:Cpu,
    subcats:[{em:"🔌",name:"Accesorios Tech",slug:"accesorios"}],
    products:[{id:"g001",em:"🎥",name:"Cámara Térmica Android iOS",price:404500,originalPrice:546100},{id:"g002",em:"💻",name:"Hub USB-C Multipuerto HDMI",price:15000,originalPrice:20300},{id:"g003",em:"🔋",name:"Batería Solar 20000mAh",price:28000,originalPrice:37800},{id:"g004",em:"📡",name:"Repetidor WiFi Mesh Dual",price:22000,originalPrice:29700}],
    bannerText:"Gadgets desde $15.000" },
  { id:"audio",em:"🎧",name:"Audio",count:2,color:"#f97316",bg:"linear-gradient(135deg,#f97316,#fbbf24)",Icon:Headphones,
    subcats:[{em:"🌍",name:"Traductores en Tiempo Real",slug:"traductores"}],
    products:[{id:"a001",em:"🎧",name:"Audífonos Traductores 144 Idiomas",price:61600,originalPrice:83200},{id:"a002",em:"🎧",name:"Audífonos Traductores 114 Idiomas",price:11490,originalPrice:15500}],
    bannerText:"Audio tech desde $11.490" },
  { id:"oficina",em:"💼",name:"Oficina",count:4,color:"#8b5cf6",bg:"linear-gradient(135deg,#8b5cf6,#6366f1)",Icon:Briefcase,
    subcats:[],
    products:[{id:"o001",em:"📱",name:"Soporte Escritorio Celular",price:17000,originalPrice:22900},{id:"o002",em:"📱",name:"Soporte Auto Carga 15W",price:16000,originalPrice:21600},{id:"o003",em:"💡",name:"Lámpara LED Escritorio",price:18000,originalPrice:24300},{id:"o004",em:"⌨️",name:"Mouse Ergonómico Inalámbrico",price:12500,originalPrice:16900}],
    bannerText:"Oficina smart desde $12.500" },
  { id:"deportes",em:"🏃",name:"Deportes",count:5,color:"#22c55e",bg:"linear-gradient(135deg,#22c55e,#16a34a)",Icon:Dumbbell,
    subcats:[{em:"⌚",name:"Relojes Deportivos",slug:"relojes-dep"},{em:"🏋️",name:"Equipos con IA",slug:"equipos-dep"}],
    products:[{id:"d001",em:"🏃",name:"Caminadora Plegable con Barra",price:369900,originalPrice:499400},{id:"d002",em:"🏃",name:"Caminadora 2 en 1 Escritorio",price:375000,originalPrice:506300},{id:"d003",em:"💪",name:"Banda Resistencia Smart",price:15000,originalPrice:20300},{id:"d004",em:"📊",name:"Báscula Composición Corporal",price:25000,originalPrice:33800}],
    bannerText:"Deportes desde $15.000" },
  { id:"juguetes",em:"🎮",name:"Juguetes Tech",count:3,color:"#f43f5e",bg:"linear-gradient(135deg,#f43f5e,#f97316)",Icon:Gamepad2,
    subcats:[],
    products:[{id:"j001",em:"🤖",name:"Robot Educativo Programable",price:45000,originalPrice:60800},{id:"j002",em:"🎮",name:"Drone Mini con Cámara HD",price:38000,originalPrice:51400},{id:"j003",em:"🎯",name:"Kit STEM Electrónica Junior",price:22000,originalPrice:29700}],
    bannerText:"Tech para niños desde $22.000" },
  { id:"telefonos",em:"📱",name:"Teléfonos",count:4,color:"#0ea5e9",bg:"linear-gradient(135deg,#0ea5e9,#6366f1)",Icon:Smartphone,
    subcats:[{em:"📱",name:"Smartphones IA",slug:"smartphones"},{em:"📱",name:"Fundas Inteligentes",slug:"fundas"},{em:"🔌",name:"Accesorios Smart",slug:"accesorios-tel"}],
    products:[{id:"t001",em:"📱",name:"Funda iPhone 16 Pro Max Circuito",price:7500,originalPrice:10100},{id:"t002",em:"📱",name:"Soporte Auto Carga 15W MagSafe",price:16000,originalPrice:21600},{id:"t003",em:"🔋",name:"Cargador Rápido 65W GaN",price:12000,originalPrice:16200},{id:"t004",em:"📱",name:"Funda Plateada con Lunares",price:10000,originalPrice:13500}],
    bannerText:"Accesorios desde $7.500" },
  { id:"electronica",em:"💻",name:"Electrónica",count:6,color:"#475569",bg:"linear-gradient(135deg,#334155,#6366f1)",Icon:Monitor,
    subcats:[{em:"🔌",name:"Accesorios Smart",slug:"accesorios-elec"}],
    products:[{id:"e001",em:"💻",name:"Hub USB-C 5 en 1 HDMI 4K",price:15000,originalPrice:20300},{id:"e002",em:"📷",name:"Webcam Full HD 1080p con Mic",price:18500,originalPrice:25000},{id:"e003",em:"🔊",name:"Parlante Bluetooth 20W IPX5",price:22000,originalPrice:29700},{id:"e004",em:"⌨️",name:"Teclado Mecánico RGB TKL",price:35000,originalPrice:47300}],
    bannerText:"Electrónica desde $15.000" },
];

function clp(n: number) { return `$${Math.round(n).toLocaleString("es-CL")}`; }
function disc(p: number, o: number) { return Math.round((1 - p / o) * 100); }

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

  return { open: state.open, activeId: state.activeId, openNow, scheduleClose, closeNow, setActive };
}

const TOP_OFFSET_PX = 104;

function Subnav() {
  const { open, openNow, scheduleClose } = useMegaMenuState();
  const [hovered, setHovered] = useState(false);
  const active = open || hovered;

  return (
    <div className="hidden md:block" style={{ borderBottom: "none" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-stretch h-10">
        <button
          onMouseEnter={() => { setHovered(true); openNow(); }}
          onMouseLeave={() => { setHovered(false); scheduleClose(); }}
          className="flex items-center gap-2 pr-4 font-extrabold text-[12.5px] flex-shrink-0 transition-colors"
          style={{ color: active ? "#6366f1" : "var(--text)" }}
        >
          <span className="flex flex-col gap-[3px]">
            <span className="block w-[15px] h-[2px] rounded" style={{ background: active ? "#6366f1" : "var(--text)" }} />
            <span className="block w-[15px] h-[2px] rounded" style={{ background: active ? "#6366f1" : "var(--text)" }} />
            <span className="block w-[15px] h-[2px] rounded" style={{ background: active ? "#6366f1" : "var(--text)" }} />
          </span>
          Todas las categorías
        </button>

        <div className="flex items-center gap-0 pl-8 pr-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            { label:"⚡ Flash Sale",       href:"/productos?tag=descuento",  hot:true  },
            { label:"Lo que está volando", href:"/productos?tag=bestseller", hot:false },
            { label:"Recién llegados",     href:"/productos?tag=nuevo",      hot:false },
            { label:"Wearables",           href:"/wearables",                hot:false },
            { label:"Salud",               href:"/salud",                    hot:false },
            { label:"Gadgets",             href:"/gadgets",                  hot:false },
          ].map(l => (
            <Link
              key={l.href} href={l.href}
              className="px-3 my-1.5 rounded-full flex items-center text-[12px] whitespace-nowrap transition-colors hover:bg-black/[0.04]"
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

function Panel() {
  const { open, activeId, openNow, scheduleClose, closeNow, setActive } = useMegaMenuState();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeNow(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeNow]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  if (!open) return null;

  const activeCat = CATS.find(c => c.id === activeId) ?? CATS[0];

  return (
    <>
      <div
        className="fixed left-0 right-0 bottom-0 hidden md:block"
        style={{ top: `${TOP_OFFSET_PX - 1}px`, background: "#ffffff", zIndex: 40 }}
        onMouseEnter={scheduleClose}
        onClick={closeNow}
      />

      <div
        className="fixed left-0 right-0 hidden md:block"
        style={{ top: `${TOP_OFFSET_PX}px`, height: `calc(100vh - ${TOP_OFFSET_PX}px)`, zIndex: 50, pointerEvents: "none" }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-full">
          <div
            className="flex h-full"
            style={{ pointerEvents: "auto", background: "var(--bg)", boxShadow: "0 2px 8px rgba(0,0,0,.04)", borderTop: "none" }}
            onMouseEnter={openNow}
            onMouseLeave={scheduleClose}
          >
            {/* ── Columna izquierda: lista de categorías ── */}
            <div
              className="flex-shrink-0 overflow-y-auto"
              style={{ width: "220px", background: "#ffffff", overscrollBehavior: "contain" }}
            >
              {CATS.map(cat => {
                const isActive = cat.id === activeId;
                return (
                  <Link
                    key={cat.id}
                    href={`/${cat.id}`}
                    onMouseEnter={() => setActive(cat.id)}
                    onClick={closeNow}
                    className="w-full flex items-center gap-2.5 pr-4 py-2.5 transition-all"
                    style={{ background: "transparent" }}
                  >
                    <span style={{ width: "20px", display: "flex", alignItems: "center", justifyContent: "flex-start", flexShrink: 0 }}>
                      <cat.Icon size={17} strokeWidth={2} color={isActive ? "#6366f1" : "#475569"} />
                    </span>
                    <span
                      className="text-[12px] flex-1 text-left"
                      style={{ color: isActive ? "#6366f1" : "var(--text)", fontWeight: isActive ? 700 : 600 }}
                    >
                      {cat.name}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{cat.count}</span>
                    <span className="text-[10px]" style={{ color: isActive ? "#6366f1" : "var(--text-muted)" }}>›</span>
                  </Link>
                );
              })}
            </div>

            {/* ── Columna derecha: subcategorías + productos ── */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ overscrollBehavior: "contain" }}>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-extrabold flex items-center gap-1.5" style={{ color: "var(--text)" }}>
                    <activeCat.Icon size={14} strokeWidth={2} color={activeCat.color} />
                    Subcategorías de {activeCat.name}
                  </span>
                  <Link
                    href={`/${activeCat.id}`}
                    onClick={closeNow}
                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700"
                  >
                    Ver todos ({activeCat.count}) →
                  </Link>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeCat.subcats.length > 0 ? (
                    activeCat.subcats.map(s => (
                      <Link
                        key={s.slug}
                        href={`/${activeCat.id}/${s.slug}`}
                        onClick={closeNow}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
                        style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--surface)" }}
                      >
                        <span style={{ fontSize: "12px" }}>{s.em}</span>
                        {s.name}
                      </Link>
                    ))
                  ) : (
                    <Link
                      href={`/${activeCat.id}`}
                      onClick={closeNow}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
                      style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--surface)" }}
                    >
                      Ver todo {activeCat.name} →
                    </Link>
                  )}
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
                  href={`/${activeCat.id}`}
                  onClick={closeNow}
                  className="flex-shrink-0 bg-white font-extrabold rounded-full px-4 py-2 text-[11px] hover:opacity-90 transition-opacity"
                  style={{ color: activeCat.color }}
                >
                  Ver ofertas →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const MegaMenu = { Subnav, Panel };

export function useMegaMenuOpen() {
  const [isOpen, setIsOpen] = useState(state.open);
  useEffect(() => {
    const l = () => setIsOpen(state.open);
    state.listeners.add(l);
    return () => { state.listeners.delete(l); };
  }, []);
  return isOpen;
}

export default MegaMenu;