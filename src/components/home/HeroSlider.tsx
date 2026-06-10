"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { Product } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────
type HeroProduct = Pick<Product, "id" | "name" | "price" | "icon" | "image" | "tag"> & {
  category: string;
};

export interface HeroData {
  bestsellers: HeroProduct[];
  discounts:   HeroProduct[];
  newProducts: HeroProduct[];
  featured:    HeroProduct[];
}

// ── Color maps ────────────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, { color: string; bg: string }> = {
  salud:       { color: "#3b82f6", bg: "#eff6ff" },
  belleza:     { color: "#a855f7", bg: "#fdf4ff" },
  hogar:       { color: "#10b981", bg: "#f0fdf4" },
  wearables:   { color: "#6366f1", bg: "#eef2ff" },
  mascotas:    { color: "#0ea5e9", bg: "#f0f9ff" },
  gadgets:     { color: "#10b981", bg: "#ecfdf5" },
  audio:       { color: "#f97316", bg: "#fff7ed" },
  oficina:     { color: "#8b5cf6", bg: "#f5f3ff" },
  juguetes:    { color: "#f43f5e", bg: "#fff1f2" },
  deportes:    { color: "#22c55e", bg: "#f0fdf4" },
  electronica: { color: "#64748b", bg: "#f8fafc" },
  telefonos:   { color: "#0ea5e9", bg: "#f0f9ff" },
};

const TAG_META: Record<string, { label: string; color: string; bg: string }> = {
  bestseller: { label: "⭐ Bestseller", color: "#92400e", bg: "#fef3c7" },
  nuevo:      { label: "🆕 Nuevo",      color: "#065f46", bg: "#d1fae5" },
  descuento:  { label: "🔥 Oferta",     color: "#991b1b", bg: "#fee2e2" },
};

// ── Slide configs (sin productos — vienen de la DB) ───────────────────────────
const SLIDE_CONFIGS = [
  {
    key:          "bestsellers" as keyof HeroData,
    eyebrow:      "⭐ MÁS VENDIDOS · ESTA SEMANA",
    eyebrowColor: "#f59e0b",
    line1:        "Lo que todos",
    line2:        "están",
    accent:       "comprando",
    accentFrom:   "#f59e0b",
    accentTo:     "#ef4444",
    desc:         "Los productos más populares de nuestra tienda, elegidos por miles de clientes en Chile.",
    stats: [
      { n: "4.8★", label: "Calificación" },
      { n: "12K+", label: "Clientes"     },
      { n: "30",   label: "Días gtía."   },
    ],
    badges: [
      { text: "🚚 Envío gratis", color: "#065f46", bg: "#d1fae5" },
      { text: "⭐ Top ventas",   color: "#92400e", bg: "#fef3c7" },
    ],
    cta: "Ver más vendidos",
  },
  {
    key:          "discounts" as keyof HeroData,
    eyebrow:      "🔥 EN OFERTA · TIEMPO LIMITADO",
    eyebrowColor: "#ef4444",
    line1:        "Precios",
    line2:        "que no",
    accent:       "duran",
    accentFrom:   "#ef4444",
    accentTo:     "#f97316",
    desc:         "Descuentos reales en productos premium. Aprovecha antes que se agoten.",
    stats: [
      { n: "−30%", label: "Desc. máx." },
      { n: "48h",  label: "Despacho"   },
      { n: "30",   label: "Días gtía." },
    ],
    badges: [
      { text: "🚚 Envío gratis",  color: "#065f46", bg: "#d1fae5" },
      { text: "🔥 Oferta activa", color: "#991b1b", bg: "#fee2e2" },
    ],
    cta: "Ver ofertas",
  },
  {
    key:          "newProducts" as keyof HeroData,
    eyebrow:      "🆕 RECIÉN LLEGADOS · NOVEDADES",
    eyebrowColor: "#10b981",
    line1:        "Tecnología",
    line2:        "que acaba",
    accent:       "de llegar",
    accentFrom:   "#10b981",
    accentTo:     "#0ea5e9",
    desc:         "Los últimos productos incorporados a nuestra tienda. Sé el primero en tenerlos.",
    stats: [
      { n: "Nuevo", label: "En stock"   },
      { n: "48h",   label: "Despacho"   },
      { n: "30",    label: "Días gtía." },
    ],
    badges: [
      { text: "🚚 Envío gratis",   color: "#065f46", bg: "#d1fae5" },
      { text: "🆕 Recién llegado", color: "#065f46", bg: "#d1fae5" },
    ],
    cta: "Ver novedades",
  },
  {
    key:          "featured" as keyof HeroData,
    eyebrow:      "✨ DESTACADOS · MEJOR CALIFICADOS",
    eyebrowColor: "#6366f1",
    line1:        "Productos",
    line2:        "con",
    accent:       "5 estrellas",
    accentFrom:   "#6366f1",
    accentTo:     "#a855f7",
    desc:         "Curados por nuestro equipo. Los productos con la mayor calificación de toda la tienda.",
    stats: [
      { n: "5★",   label: "Calificación" },
      { n: "100%", label: "Recomendados" },
      { n: "30",   label: "Días gtía."   },
    ],
    badges: [
      { text: "🚚 Envío gratis",     color: "#065f46", bg: "#d1fae5" },
      { text: "✨ Mejor calificado", color: "#4338ca", bg: "#eef2ff" },
    ],
    cta: "Ver destacados",
  },
] as const;

type SlideConfig = typeof SLIDE_CONFIGS[number];

const INTERVAL = 5000;

// ── BentoCard ─────────────────────────────────────────────────────────────────
interface BentoCardProps {
  product:    HeroProduct;
  size:       "large" | "medium" | "small";
  accentFrom: string;
  isHovered:  boolean;
  onEnter:    () => void;
  onLeave:    () => void;
}

function BentoCard({ product, size, accentFrom, isHovered, onEnter, onLeave }: BentoCardProps) {
  const cat   = CAT_COLORS[product.category] ?? { color: accentFrom, bg: "#f8fafc" };
  const tag   = product.tag ? TAG_META[product.tag] : null;
  const price = `$${Number(product.price).toLocaleString("es-CL")}`;

  return (
    <Link
      href={`/productos/${product.id}`}
      className="relative flex flex-col rounded-2xl border overflow-hidden h-full group"
      style={{
        background:  cat.bg,
        borderColor: `${cat.color}20`,
        transform:   isHovered ? "translateY(-4px) scale(1.025)" : "translateY(0) scale(1)",
        transition:  "transform 0.22s cubic-bezier(0.23,1,0.32,1), box-shadow 0.22s ease",
        boxShadow:   isHovered
          ? `0 14px 36px ${cat.color}30`
          : "0 2px 8px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Barra de color superior */}
      <div
        className="h-[3px] flex-shrink-0"
        style={{ background: `linear-gradient(90deg, ${cat.color}, ${cat.color}55)` }}
      />

      {size === "large" && (
        <div className="flex flex-col p-4 flex-1">
          {/* Imagen o ícono centrado verticalmente */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            {product.image ? (
              <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-5xl select-none">{product.icon}</span>
            )}
          </div>
          {/* Texto en la parte inferior */}
          <div className="flex flex-col gap-1 pt-2">
            {tag && (
              <span
                className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full w-fit"
                style={{ background: tag.bg, color: tag.color }}
              >
                {tag.label}
              </span>
            )}
            <p className="font-bold text-[13px] text-gray-800 leading-snug line-clamp-2">
              {product.name}
            </p>
            <p className="font-black text-xl leading-none" style={{ color: cat.color }}>
              {price}
            </p>
          </div>
          <span
            className="text-[10px] font-bold mt-1 transition-opacity duration-200"
            style={{ color: cat.color, opacity: isHovered ? 1 : 0 }}
          >
            Ver producto →
          </span>
        </div>
      )}

      {size === "medium" && (
        <div className="flex flex-col gap-1.5 p-3 flex-1">
          {product.image ? (
            <div className="w-full h-20 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
              <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain p-1" />
            </div>
          ) : (
            <span className="text-3xl select-none leading-none">{product.icon}</span>
          )}
          <p className="font-bold text-[11px] text-gray-800 leading-snug line-clamp-2 flex-1">
            {product.name}
          </p>
          <p className="font-black text-sm leading-none" style={{ color: cat.color }}>
            {price}
          </p>
          {tag && (
            <span
              className="inline-block text-[9px] font-black px-1.5 py-0.5 rounded-full w-fit"
              style={{ background: tag.bg, color: tag.color }}
            >
              {tag.label}
            </span>
          )}
        </div>
      )}

      {size === "small" && (
        <div className="flex items-center gap-2 p-2.5 flex-1">
          <span className="text-xl select-none flex-shrink-0 leading-none">{product.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[10px] text-gray-700 truncate leading-tight">
              {product.name}
            </p>
            <p
              className="font-black text-[11px] leading-tight mt-0.5"
              style={{ color: cat.color }}
            >
              {price}
            </p>
          </div>
        </div>
      )}
    </Link>
  );
}

// ── BentoScene ────────────────────────────────────────────────────────────────
function BentoScene({
  products,
  config,
  onHover,
}: {
  products: HeroProduct[];
  config:   SlideConfig;
  onHover:  (h: boolean) => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (products.length < 4) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
        Cargando productos...
      </div>
    );
  }

  const enter = (i: number) => { setHoveredIdx(i); onHover(true); };
  const leave = ()           => { setHoveredIdx(null); onHover(false); };

  return (
    <div className="relative w-full h-full p-1">
      {/* Blobs decorativos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div
          style={{
            position: "absolute", top: "-15%", right: "-5%",
            width: "260px", height: "260px",
            background: `radial-gradient(circle, ${config.accentFrom}1a, transparent 65%)`,
            filter: "blur(28px)",
            animation: "morphBlob 10s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: "-15%", left: "-5%",
            width: "200px", height: "200px",
            background: `radial-gradient(circle, ${config.accentTo}12, transparent 65%)`,
            filter: "blur(22px)",
            animation: "morphBlob 13s 3.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Grid bento: 3fr | 2fr, dos filas */}
      <div
        className="relative h-full grid gap-2.5"
        style={{ gridTemplateColumns: "3fr 2fr", gridTemplateRows: "1fr 1fr" }}
      >
        {/* Grande — ocupa ambas filas */}
        <div style={{ gridRow: "1 / 3" }}>
          <BentoCard
            product={products[0]} size="large"
            accentFrom={config.accentFrom}
            isHovered={hoveredIdx === 0}
            onEnter={() => enter(0)} onLeave={leave}
          />
        </div>

        {/* Mediano — fila superior derecha */}
        <BentoCard
          product={products[1]} size="medium"
          accentFrom={config.accentFrom}
          isHovered={hoveredIdx === 1}
          onEnter={() => enter(1)} onLeave={leave}
        />

        {/* Pequeños — fila inferior derecha, lado a lado */}
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <BentoCard
            product={products[2]} size="small"
            accentFrom={config.accentFrom}
            isHovered={hoveredIdx === 2}
            onEnter={() => enter(2)} onLeave={leave}
          />
          <BentoCard
            product={products[3]} size="small"
            accentFrom={config.accentFrom}
            isHovered={hoveredIdx === 3}
            onEnter={() => enter(3)} onLeave={leave}
          />
        </div>
      </div>
    </div>
  );
}

// ── HeroSlider ────────────────────────────────────────────────────────────────
export default function HeroSlider({ heroData }: { heroData?: HeroData }) {
  const [current, setCurrent]   = useState(0);
  const [animating, setAnimating] = useState(false);
  const pausedRef = useRef(false);

  const slides = SLIDE_CONFIGS.map((cfg) => ({
    config:   cfg,
    products: (heroData?.[cfg.key] ?? []) as HeroProduct[],
  }));

  const goTo = useCallback(
    (idx: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => { setCurrent(idx); setAnimating(false); }, 240);
    },
    [animating],
  );

  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) goTo((current + 1) % slides.length);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [current, goTo, slides.length]);

  const slide = slides[current];
  const cfg   = slide.config;

  return (
    <section
      className="relative overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 64px)", background: "var(--bg)" }}
    >
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 grid md:grid-cols-[50%_50%] gap-8 items-center min-h-0">

        {/* ── Columna izquierda ─────────────────────────────── */}
        <div
          className="flex flex-col gap-5"
          style={{
            opacity:    animating ? 0 : 1,
            transform:  animating ? "translateY(12px)" : "translateY(0)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <span
            className="text-[10px] font-black tracking-widest uppercase"
            style={{ color: cfg.eyebrowColor }}
          >
            {cfg.eyebrow}
          </span>

          <h1 className="text-5xl md:text-6xl font-black leading-[1.05] text-[var(--text)]">
            {cfg.line1}
            <br />
            {cfg.line2}{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, ${cfg.accentFrom}, ${cfg.accentTo})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {cfg.accent}
            </span>
          </h1>

          <p className="text-sm md:text-base text-[var(--text-muted)] max-w-sm leading-relaxed">
            {cfg.desc}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            {cfg.stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center px-4 py-2 rounded-xl border text-center"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <span className="text-sm font-black" style={{ color: cfg.accentFrom }}>
                  {s.n}
                </span>
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {cfg.badges.map((b) => (
              <span
                key={b.text}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                style={{ color: b.color, background: b.bg }}
              >
                {b.text}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 mt-1">
            <Link
              href="/productos"
              className="px-6 py-3 text-white font-black rounded-full text-sm transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${cfg.accentFrom}, ${cfg.accentTo})`,
                boxShadow:  `0 6px 20px ${cfg.accentFrom}40`,
              }}
            >
              {cfg.cta} →
            </Link>
            <Link
              href="/productos"
              className="px-6 py-3 font-bold rounded-full text-sm border transition-all hover:border-indigo-400 text-[var(--text-muted)]"
              style={{ borderColor: "var(--border)" }}
            >
              Ver todos
            </Link>
          </div>
        </div>

        {/* ── Columna derecha — BentoScene ─────────────────── */}
        <div
          className="hidden md:block h-[500px]"
          style={{
            opacity:    animating ? 0 : 1,
            transform:  animating ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <BentoScene
            key={current}
            products={slide.products}
            config={cfg}
            onHover={(h) => { pausedRef.current = h; }}
          />
        </div>
      </div>

      {/* ── Dots ─────────────────────────────────────────────── */}
      <div className="relative h-8 flex items-center justify-center gap-2 pb-1">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width:  i === current ? "24px" : "6px",
              height: "6px",
              background: i === current
                ? `linear-gradient(90deg, ${cfg.accentFrom}, ${cfg.accentTo})`
                : "var(--border)",
            }}
          />
        ))}
      </div>

      {/* ── Barra de progreso ────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: "var(--border)" }}
      >
        <div
          key={current}
          className="h-full"
          style={{
            background: `linear-gradient(90deg, ${cfg.accentFrom}, ${cfg.accentTo})`,
            animation:  `slideProgress ${INTERVAL}ms linear`,
          }}
        />
      </div>
    </section>
  );
}
