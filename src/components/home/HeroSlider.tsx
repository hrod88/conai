"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import type { Product } from "@/types";

type FeaturedProduct = Pick<Product, "id" | "name" | "price" | "icon" | "tag">;

const slides = [
  {
    cat: "salud",
    catLabel: "❤️ Salud & Wearables · 50 productos",
    catColor: "#ef4444",
    line1: "Tecnología",
    line2: "para tu",
    accent: "salud",
    accentFrom: "#3b82f6",
    accentTo: "#6366f1",
    desc: "Smartwatches, anillos y sensores que monitorean tu cuerpo 24/7 con inteligencia artificial.",
    stats: [
      { n: "300+", label: "Productos" },
      { n: "6", label: "Categorías" },
      { n: "30", label: "Días Garantía" },
    ],
    badges: [
      { text: "🚚 Envío gratis", color: "#065f46", bg: "#d1fae5" },
      { text: "★ 4.8 · 2,400+ clientes", color: "#4338ca", bg: "#e0e7ff" },
      { text: "Desde $89.990", color: "#92400e", bg: "#fef3c7" },
    ],
    ctaLabel: "Ver Salud",
    ctaFrom: "#3b82f6",
    ctaTo: "#6366f1",
    hubIcon: "❤️",
    products: [
      { name: "Oura Ring Gen 3", price: "$299.990", icon: "💍", discount: null, bg: "#f0f9ff" },
      { name: "Apple Watch Ultra", price: "$799.990", icon: "⌚", discount: "-15%", bg: "#faf5ff" },
      { name: "Withings ScanWatch", price: "$349.990", icon: "❤️", discount: null, bg: "#fff1f2" },
      { name: "Dexcom G7", price: "$89.990", icon: "🩺", discount: null, bg: "#f0fdf4" },
    ],
  },
  {
    cat: "belleza",
    catLabel: "✨ Belleza Tech · 50 productos",
    catColor: "#a855f7",
    line1: "Belleza",
    line2: "con",
    accent: "inteligencia",
    accentFrom: "#a855f7",
    accentTo: "#ec4899",
    desc: "Dispositivos con IA que transforman tu rutina de belleza en una experiencia de lujo.",
    stats: [
      { n: "50", label: "Productos" },
      { n: "6", label: "Marcas" },
      { n: "30", label: "Días Garantía" },
    ],
    badges: [
      { text: "🚚 Envío gratis", color: "#065f46", bg: "#d1fae5" },
      { text: "★ 4.7 · 1,800+ clientas", color: "#6d28d9", bg: "#ede9fe" },
      { text: "Desde $79.990", color: "#92400e", bg: "#fef3c7" },
    ],
    ctaLabel: "Ver Belleza",
    ctaFrom: "#a855f7",
    ctaTo: "#ec4899",
    hubIcon: "✨",
    products: [
      { name: "LED Face Mask", price: "$199.990", icon: "✨", discount: "-10%", bg: "#fdf4ff" },
      { name: "HiMirror Mini X", price: "$399.990", icon: "🪞", discount: null, bg: "#fdf2f8" },
      { name: "Foreo Luna 4", price: "$149.990", icon: "💆", discount: null, bg: "#fff0fb" },
      { name: "NuFace Mini", price: "$249.990", icon: "💅", discount: "-20%", bg: "#fce7f3" },
    ],
  },
  {
    cat: "hogar",
    catLabel: "🏠 Hogar Inteligente · 50 productos",
    catColor: "#3b82f6",
    line1: "Tu hogar",
    line2: "que",
    accent: "piensa",
    accentFrom: "#3b82f6",
    accentTo: "#10b981",
    desc: "Robots, cámaras y termostatos con IA que automatizan tu hogar completamente.",
    stats: [
      { n: "50", label: "Productos" },
      { n: "8", label: "Marcas" },
      { n: "30", label: "Días Garantía" },
    ],
    badges: [
      { text: "🚚 Envío gratis", color: "#065f46", bg: "#d1fae5" },
      { text: "★ 4.9 · 3,100+ clientes", color: "#1d4ed8", bg: "#dbeafe" },
      { text: "Desde $39.990", color: "#92400e", bg: "#fef3c7" },
    ],
    ctaLabel: "Ver Hogar",
    ctaFrom: "#3b82f6",
    ctaTo: "#10b981",
    hubIcon: "🏠",
    products: [
      { name: "Robot Aspirador", price: "$299.990", icon: "🤖", discount: "-25%", bg: "#eff6ff" },
      { name: "Cámara 4K IA", price: "$79.990", icon: "📹", discount: null, bg: "#f0fdf4" },
      { name: "Termostato Smart", price: "$249.990", icon: "🌡️", discount: null, bg: "#fff7ed" },
      { name: "Smart Hub", price: "$49.990", icon: "🔌", discount: null, bg: "#f5f3ff" },
    ],
  },
  {
    cat: "gadgets",
    catLabel: "🤖 Gadgets & Tech · 50 productos",
    catColor: "#10b981",
    line1: "Tecnología",
    line2: "que",
    accent: "sorprende",
    accentFrom: "#10b981",
    accentTo: "#0ea5e9",
    desc: "Drones, impresoras 3D, proyectores portátiles y lo último en innovación tecnológica.",
    stats: [
      { n: "50", label: "Productos" },
      { n: "10", label: "Marcas" },
      { n: "30", label: "Días Garantía" },
    ],
    badges: [
      { text: "🚚 Envío gratis", color: "#065f46", bg: "#d1fae5" },
      { text: "★ 4.8 · 5,200+ clientes", color: "#0369a1", bg: "#e0f2fe" },
      { text: "Desde $49.990", color: "#92400e", bg: "#fef3c7" },
    ],
    ctaLabel: "Ver Gadgets",
    ctaFrom: "#10b981",
    ctaTo: "#0ea5e9",
    hubIcon: "🤖",
    products: [
      { name: "Drone 4K Pro", price: "$499.990", icon: "🚁", discount: null, bg: "#ecfdf5" },
      { name: "Impresora 3D", price: "$399.990", icon: "🖨️", discount: "-10%", bg: "#f0f9ff" },
      { name: "Proyector Smart", price: "$299.990", icon: "📽️", discount: null, bg: "#fefce8" },
      { name: "Audífonos IA", price: "$199.990", icon: "🎧", discount: null, bg: "#fff1f2" },
    ],
  },
];

type SlideProduct = {
  id?: string;
  name: string;
  price: string;
  icon: string;
  discount: string | null;
  bg: string;
};

type Slide = Omit<typeof slides[0], "products"> & { products: SlideProduct[] };

const INTERVAL = 5000;

/* ── Salud: Orbit 3D ─────────────────────────────────── */
function OrbitScene({ slide, onHover }: { slide: Slide; onHover: (h: boolean) => void }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{ perspective: "600px" }}
    >
      {/* Hub central */}
      <div className="relative z-10 flex flex-col items-center gap-1 pointer-events-none">
        <span className="text-7xl animate-float-slow">{slide.hubIcon}</span>
        <span className="text-[10px] font-black tracking-widest uppercase opacity-50"
          style={{ color: slide.catColor }}>conAI</span>
      </div>

      {/* Tarjetas orbitando */}
      <div className="absolute inset-0 flex items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}>
        {slide.products.map((p, i) => (
          <div
            key={p.name}
            className="absolute"
            style={{
              transformStyle: "preserve-3d",
              animation: `orbit 10s linear infinite`,
              animationDelay: `${i * -2.5}s`,
              animationPlayState: hoveredIdx === i ? "paused" : "running",
            }}
          >
            <Link
              href={p.id ? `/productos/${p.id}` : `/productos?cat=${slide.cat}`}
              className="block rounded-2xl shadow-xl p-3 w-28 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                background: p.bg,
                transform: `translate(-50%, -50%) scale(${hoveredIdx === i ? 1.12 : 1})`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: hoveredIdx === i ? "0 12px 32px rgba(0,0,0,0.18)" : undefined,
              }}
              onMouseEnter={() => { setHoveredIdx(i); onHover(true); }}
              onMouseLeave={() => { setHoveredIdx(null); onHover(false); }}
            >
              <span className="text-3xl block mb-1">{p.icon}</span>
              <p className="text-[11px] font-bold text-gray-700 truncate">{p.name}</p>
              <p className="text-[12px] font-black mt-0.5" style={{ color: slide.accentFrom }}>{p.price}</p>
              {p.discount && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white mt-1 inline-block">
                  {p.discount}
                </span>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Belleza: Tilt interactivo ───────────────────────── */
function TiltScene({ slide, onHover }: { slide: Slide; onHover: (h: boolean) => void }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hoveredMain, setHoveredMain] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<number | null>(null);

  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ perspective: "900px" }}>
      <Link
        href={slide.products[0]?.id ? `/productos/${slide.products[0].id}` : `/productos?cat=${slide.cat}`}
        className="relative w-64 h-80 rounded-3xl shadow-2xl overflow-hidden cursor-pointer block"
        style={{
          background: `linear-gradient(135deg, ${slide.accentFrom}18, ${slide.accentTo}25)`,
          border: `2px solid ${slide.accentFrom}30`,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hoveredMain ? 1.06 : 1})`,
          transition: "transform 0.12s ease, box-shadow 0.2s ease",
          transformStyle: "preserve-3d",
          boxShadow: hoveredMain ? `0 20px 48px ${slide.accentFrom}44` : undefined,
        }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setTilt({
            x: ((e.clientY - r.top) / r.height - 0.5) * 28,
            y: ((e.clientX - r.left) / r.width - 0.5) * -28,
          });
        }}
        onMouseEnter={() => { setHoveredMain(true); onHover(true); }}
        onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHoveredMain(false); onHover(false); }}
      >
        {/* Producto principal */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ transform: "translateZ(30px)" }}>
          <span className="text-8xl select-none">{slide.products[0].icon}</span>
          <div className="text-center">
            <p className="font-black text-base" style={{ color: "var(--text)" }}>
              {slide.products[0].name}
            </p>
            <p className="font-black text-2xl mt-0.5" style={{ color: slide.accentFrom }}>
              {slide.products[0].price}
            </p>
          </div>
          {slide.products[0].discount && (
            <span className="text-sm font-black px-3 py-1 rounded-full bg-red-500 text-white">
              {slide.products[0].discount}
            </span>
          )}
        </div>

        {/* Íconos flotantes en las esquinas */}
        {slide.products.slice(1).map((p, i) => (
          <span
            key={p.name}
            className="absolute text-3xl select-none"
            style={{
              top: i === 0 ? "8%" : i === 1 ? "72%" : "60%",
              left: i === 0 ? "8%" : i === 1 ? "76%" : "76%",
              transform: "translateZ(50px)",
              animation: `floatSlow ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 1.2}s`,
              opacity: 0.75,
            }}
          >
            {p.icon}
          </span>
        ))}

        {/* Reflejo de luz con el tilt */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${50 + tilt.y}% ${50 - tilt.x}%, ${slide.accentFrom}22 0%, transparent 70%)`,
            transition: "background 0.12s ease",
          }}
        />
      </Link>

      {/* Grid pequeño de los otros 3 productos al lado */}
      <div className="hidden xl:flex flex-col gap-2 ml-4">
        {slide.products.slice(1).map((p, i) => (
          <Link
            key={p.name}
            href={p.id ? `/productos/${p.id}` : `/productos?cat=${slide.cat}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm w-36 cursor-pointer"
            style={{
              background: p.bg,
              transform: `scale(${hoveredSide === i ? 1.08 : 1})`,
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              boxShadow: hoveredSide === i ? "0 6px 20px rgba(0,0,0,0.13)" : undefined,
            }}
            onMouseEnter={() => { setHoveredSide(i); onHover(true); }}
            onMouseLeave={() => { setHoveredSide(null); onHover(false); }}
          >
            <span className="text-xl">{p.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold truncate text-gray-700">{p.name}</p>
              <p className="text-[11px] font-black" style={{ color: slide.accentFrom }}>{p.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Hogar: Stack 3D ─────────────────────────────────── */
function StackScene({ slide, visible, onHover }: { slide: Slide; visible: boolean; onHover: (h: boolean) => void }) {
  const [ready, setReady] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) { setReady(false); return; }
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ perspective: "1000px" }}>
      <div className="relative w-56 h-60" style={{ transformStyle: "preserve-3d" }}>
        {slide.products.map((p, i) => (
          <Link
            key={p.name}
            href={p.id ? `/productos/${p.id}` : `/productos?cat=${slide.cat}`}
            className="absolute inset-0 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer"
            style={{
              background: p.bg,
              zIndex: hoveredIdx === i ? 10 : slide.products.length - i,
              transform: ready
                ? hoveredIdx === i
                  ? `translateZ(${-i * 16}px) translateY(${i * 10}px) scale(${1 - i * 0.045 + 0.08})`
                  : `translateZ(${-i * 16}px) translateY(${i * 10}px) scale(${1 - i * 0.045})`
                : `translateZ(-100px) translateY(30px) scale(0.85)`,
              opacity: ready ? 1 : 0,
              transition: `transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease ${i * 0.13}s, box-shadow 0.2s ease`,
              boxShadow: hoveredIdx === i ? "0 16px 40px rgba(0,0,0,0.18)" : undefined,
            }}
            onMouseEnter={() => { setHoveredIdx(i); onHover(true); }}
            onMouseLeave={() => { setHoveredIdx(null); onHover(false); }}
          >
            <span className="text-5xl select-none">{p.icon}</span>
            <p className="font-bold text-sm text-center px-4 text-gray-700">{p.name}</p>
            <p className="font-black text-lg" style={{ color: slide.accentFrom }}>{p.price}</p>
            {p.discount && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white">
                {p.discount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Gadgets: Ticker vertical + blob ─────────────────── */
function TickerScene({ slide, onHover }: { slide: Slide; onHover: (h: boolean) => void }) {
  const [tickerPaused, setTickerPaused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const items = [...slide.products, ...slide.products, ...slide.products];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Morphing blob de fondo */}
      <div
        className="absolute w-72 h-72 opacity-20 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${slide.accentFrom}, ${slide.accentTo})`,
          animation: "morphBlob 8s ease-in-out infinite",
        }}
      />

      {/* Ticker */}
      <div className="relative z-10 w-52 overflow-hidden h-[360px]" style={{ maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)" }}>
        <div style={{ animation: "tickerV 14s linear infinite", animationPlayState: tickerPaused ? "paused" : "running" }}>
          {items.map((p, i) => (
            <Link
              key={i}
              href={p.id ? `/productos/${p.id}` : `/productos?cat=${slide.cat}`}
              className="mb-3 rounded-xl shadow-md flex items-center gap-3 p-3 cursor-pointer block"
              style={{
                background: p.bg,
                transform: `scale(${hoveredIdx === i ? 1.07 : 1})`,
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                boxShadow: hoveredIdx === i ? "0 6px 20px rgba(0,0,0,0.13)" : undefined,
              }}
              onMouseEnter={() => { setTickerPaused(true); setHoveredIdx(i); onHover(true); }}
              onMouseLeave={() => { setTickerPaused(false); setHoveredIdx(null); onHover(false); }}
            >
              <span className="text-3xl flex-shrink-0 select-none">{p.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate text-gray-700">{p.name}</p>
                <p className="font-black text-base" style={{ color: slide.accentFrom }}>{p.price}</p>
              </div>
              {p.discount && (
                <span className="flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white">
                  {p.discount}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Selector de visual por slide ────────────────────── */
function SlideVisual({ slide, current, index, onHover }: { slide: Slide; current: number; index: number; onHover: (h: boolean) => void }) {
  const visible = current === index;
  switch (slide.cat) {
    case "salud":   return <OrbitScene slide={slide} onHover={onHover} />;
    case "belleza": return <TiltScene slide={slide} onHover={onHover} />;
    case "hogar":   return <StackScene slide={slide} visible={visible} onHover={onHover} />;
    case "gadgets": return <TickerScene slide={slide} onHover={onHover} />;
    default:        return null;
  }
}

const catBgs = ["#f0f9ff", "#fdf4ff", "#fff1f2", "#f0fdf4"];

function resolveFeatured(
  slide: (typeof slides)[0],
  featured: Record<string, FeaturedProduct[]>
): SlideProduct[] {
  const real = featured[slide.cat];
  if (!real || real.length === 0) return slide.products.map((p) => ({ ...p, id: undefined }));
  return real.map((p, i) => ({
    id: p.id,
    name: p.name,
    price: `$${Number(p.price).toLocaleString("es-CL")}`,
    icon: p.icon,
    discount: p.tag === "descuento" ? "Desc." : null,
    bg: slide.products[i]?.bg ?? catBgs[i % catBgs.length],
  }));
}

/* ── HeroSlider principal ────────────────────────────── */
export default function HeroSlider({ featured = {} }: { featured?: Record<string, FeaturedProduct[]> }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const pausedRef = useRef(false);

  const resolvedSlides = useMemo(
    () => slides.map((s) => ({ ...s, products: resolveFeatured(s, featured) })),
    [featured]
  );

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 220);
  }, [animating]);

  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) {
        goTo((current + 1) % resolvedSlides.length);
      }
    }, INTERVAL);
    return () => clearInterval(t);
  }, [current, goTo, resolvedSlides.length]);

  const slide = resolvedSlides[current];

  return (
    <section
      className="relative overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 64px)", background: "var(--bg)" }}
    >
      {/* Contenido principal */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 grid md:grid-cols-[55%_45%] gap-8 items-center">

        {/* Columna izquierda */}
        <div
          className="flex flex-col gap-5"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(10px)" : "translateY(0)",
            transition: "all 0.35s ease",
          }}
        >
          <span
            className="text-[11px] font-black tracking-widest uppercase w-fit"
            style={{ color: slide.catColor }}
          >
            {slide.catLabel}
          </span>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] text-[var(--text)]">
            {slide.line1}
            <br />
            {slide.line2}{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, ${slide.accentFrom}, ${slide.accentTo})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block",
              }}
            >
              {slide.accent}
            </span>
          </h1>

          <p className="text-[var(--text-muted)] text-sm md:text-base max-w-sm leading-relaxed">
            {slide.desc}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {slide.stats.map((s) => (
              <div key={s.label}
                className="flex flex-col items-center px-4 py-2 rounded-xl border text-center"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <span className="text-base font-black" style={{ color: slide.accentFrom }}>{s.n}</span>
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {slide.badges.map((b) => (
              <span key={b.text}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                style={{ color: b.color, background: b.bg }}>
                {b.text}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <Link
              href={`/productos?cat=${slide.cat}`}
              className="px-6 py-3 text-white font-black rounded-full text-sm transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${slide.ctaFrom}, ${slide.ctaTo})`,
                boxShadow: `0 6px 20px ${slide.ctaFrom}44`,
              }}
            >
              {slide.ctaLabel} →
            </Link>
            <Link href="/productos"
              className="px-6 py-3 font-bold rounded-full text-sm border transition-all hover:border-indigo-400 text-[var(--text-muted)]"
              style={{ borderColor: "var(--border)" }}>
              Ver todos
            </Link>
          </div>
        </div>

        {/* Columna derecha — animación por slide */}
        <div
          className="hidden md:flex h-[420px] items-center justify-center"
          style={{
            opacity: animating ? 0 : 1,
            transition: "opacity 0.35s ease",
          }}
        >
          {resolvedSlides.map((s, i) => (
            <div
              key={s.cat}
              className="absolute w-full max-w-[45%] h-[420px]"
              style={{ display: current === i ? "flex" : "none", alignItems: "center", justifyContent: "center" }}
            >
              <SlideVisual
                slide={s}
                current={current}
                index={i}
                onHover={(h) => { pausedRef.current = h; }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="relative h-8 flex items-center justify-center gap-2 pb-1">
        {resolvedSlides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? "24px" : "6px",
              height: "6px",
              background: i === current
                ? `linear-gradient(90deg, ${slide.ctaFrom}, ${slide.ctaTo})`
                : "var(--border)",
            }}
          />
        ))}
      </div>

      {/* Barra de progreso */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "var(--border)" }}>
        <div
          key={current}
          className="h-full"
          style={{
            background: `linear-gradient(90deg, ${slide.ctaFrom}, ${slide.ctaTo})`,
            animation: `slideProgress ${INTERVAL}ms linear`,
          }}
        />
      </div>
    </section>
  );
}
