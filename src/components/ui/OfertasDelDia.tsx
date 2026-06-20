"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export type OfertaProduct = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string | null;
  icon: string | null;
};

const PER_PAGE = 3;
const SUPER_CYCLE_HOURS = 6;

function clp(n: number) {
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

function discountPct(p: OfertaProduct): number {
  if (p.original_price && p.original_price > p.price) {
    return Math.round((1 - p.price / p.original_price) * 100);
  }
  return 0;
}

function getRemainingMs() {
  const cycleMs = SUPER_CYCLE_HOURS * 3_600_000;
  const now = Date.now();
  const next = Math.ceil(now / cycleMs) * cycleMs;
  return next - now;
}

// ── Tarjeta compacta de producto ──
// onPrev/onNext se pasan solo a la primera (izquierda) y última (derecha) tarjeta,
// para colocar la flecha en la esquina inferior DE LA IMAGEN.
function DealCard({
  p, onPrev, onNext,
}: {
  p: OfertaProduct;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const pct = discountPct(p);
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <Link href={`/productos/${p.id}`} className="group">
        <div className="relative w-full aspect-square rounded-lg bg-gray-50 overflow-hidden mb-1.5">
          {p.image ? (
            <Image src={p.image} alt={p.name} fill sizes="120px" className="object-contain p-1 group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">{p.icon ?? "🛍"}</div>
          )}

          {/* Flecha en la esquina inferior IZQUIERDA de la imagen */}
          {onPrev && (
            <button
              onClick={(e) => { e.preventDefault(); onPrev(); }}
              aria-label="Anterior"
              className="absolute left-0 bottom-0 z-20 w-8 h-8 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-lg leading-none transition-colors"
            >
              ‹
            </button>
          )}

          {/* Flecha en la esquina inferior DERECHA de la imagen */}
          {onNext && (
            <button
              onClick={(e) => { e.preventDefault(); onNext(); }}
              aria-label="Siguiente"
              className="absolute right-0 bottom-0 z-20 w-8 h-8 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-lg leading-none transition-colors"
            >
              ›
            </button>
          )}
        </div>
        <p className="text-[10px] text-[var(--text)] leading-tight line-clamp-2 min-h-[26px]">{p.name}</p>
      </Link>
      <div className="flex items-baseline gap-1 flex-wrap mt-0.5">
        <span className="text-xs font-black text-red-600">{clp(p.price)}</span>
        {p.original_price && p.original_price > p.price && (
          <span className="text-[9px] text-gray-400 line-through">{clp(p.original_price)}</span>
        )}
      </div>
      {pct > 0 && (
        <span className="self-start text-[9px] font-black text-white bg-red-500 px-1 py-0.5 rounded mt-0.5">-{pct}%</span>
      )}
    </div>
  );
}

// ── Bloque con carrusel de 3 en 3 ──
function DealBlock({
  title, pill, pillTimer, products,
}: {
  title: string;
  pill: React.ReactNode;
  pillTimer?: boolean;
  products: OfertaProduct[];
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const start = page * PER_PAGE;
  const visible = products.slice(start, start + PER_PAGE);

  function prev() { setPage((p) => (p - 1 + totalPages) % totalPages); }
  function next() { setPage((p) => (p + 1) % totalPages); }

  const hasNav = totalPages > 1;

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Header centrado */}
      <div className="flex flex-col items-center gap-2 mb-3">
        <h3 className="text-base font-black text-[var(--text)]">{title}</h3>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full ${
          pillTimer ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        }`}>
          {pill}
        </span>
      </div>

      {/* Productos. La flecha izquierda va en la 1ª tarjeta, la derecha en la última. */}
      <div className="flex gap-2">
        {visible.map((p, i) => (
          <DealCard
            key={p.id}
            p={p}
            onPrev={hasNav && i === 0 ? prev : undefined}
            onNext={hasNav && i === visible.length - 1 ? next : undefined}
          />
        ))}
        {visible.length < PER_PAGE &&
          Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1" />
          ))}
      </div>

      {/* Indicador de página */}
      {hasNav && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === page ? "w-4 bg-indigo-500" : "w-1.5 bg-gray-300"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OfertasDelDia({ products }: { products: OfertaProduct[] }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(getRemainingMs());
    const t = setInterval(() => setRemaining(getRemainingMs()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = remaining != null ? String(Math.floor(remaining / 3_600_000)).padStart(2, "0") : "--";
  const mm = remaining != null ? String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, "0") : "--";
  const ss = remaining != null ? String(Math.floor((remaining % 60_000) / 1_000)).padStart(2, "0") : "--";

  const withDiscount = products.filter((p) => p.original_price && p.original_price > p.price);

  const byDiscount = [...withDiscount].sort((a, b) => discountPct(b) - discountPct(a));
  const comboProducts = byDiscount.slice(0, 12);

  const comboIds = new Set(comboProducts.map((p) => p.id));
  const superProducts = [...withDiscount]
    .filter((p) => !comboIds.has(p.id))
    .sort((a, b) => b.price - a.price)
    .slice(0, 12);

  if (withDiscount.length === 0) return null;

  return (
    <section className="py-6 md:py-10" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h2 className="text-xl md:text-2xl font-black text-center text-[var(--text)] mb-5">
          Ofertas de hoy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DealBlock
            title="Combo Ahorro"
            pill={<>🛍 Hasta -{comboProducts[0] ? discountPct(comboProducts[0]) : 0}% dto. ›</>}
            products={comboProducts}
          />
          <DealBlock
            title="SuperOfertas"
            pill={<>⏱ Acaba en: {hh}:{mm}:{ss} ›</>}
            pillTimer
            products={superProducts}
          />
        </div>
      </div>
    </section>
  );
}
