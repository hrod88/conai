"use client";

// SubcategoryClient.tsx
// ─────────────────────────────────────────────────────────────────────────
// Componente cliente para la página de subcategoría.
// Diseño: breadcrumb + título + sidebar filtros + grid de tarjetas.
// ─────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string; name: string; price: number; original_price?: number | null;
  image?: string | null; icon?: string | null; rating?: number | null;
  review_count?: number | null; stock?: number | null; tag?: string | null;
  category: string; subcategory?: string | null;
};

type CatMeta = {
  label: string; color: string; bg: string; gradient: string;
  subcats: Record<string, string>;
};

interface Props {
  products: Product[];
  allCatProducts: { id: string; subcategory?: string | null; price: number; original_price?: number | null; rating?: number | null; stock?: number | null }[];
  categoria: string;
  subcategoria: string;
  catMeta: CatMeta;
  subcatLabel: string;
}

type SortOption = "relevance" | "price_asc" | "price_desc" | "rating";

function clp(n: number) { return `$${Math.round(n).toLocaleString("es-CL")}`; }
function discPct(price: number, orig: number) { return Math.round((1 - price / orig) * 100); }

export default function SubcategoryClient({
  products, allCatProducts, categoria, subcategoria, catMeta, subcatLabel,
}: Props) {
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [minDisc, setMinDisc] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const priceRanges = [
    { value: "0-20000",      label: "Menos de $20.000" },
    { value: "20000-50000",  label: "$20.000 – $50.000" },
    { value: "50000-100000", label: "$50.000 – $100.000" },
    { value: "100000+",      label: "Más de $100.000" },
  ];

  // Contar productos por subcategoría para el sidebar
  const subcatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allCatProducts) {
      if (p.subcategory) counts[p.subcategory] = (counts[p.subcategory] ?? 0) + 1;
    }
    return counts;
  }, [allCatProducts]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      if (priceRange.endsWith("+")) {
        result = result.filter(p => p.price >= 100000);
      } else {
        result = result.filter(p => p.price >= min && p.price <= max);
      }
    }

    if (minDisc !== null) {
      result = result.filter(p => {
        if (!p.original_price) return false;
        return discPct(p.price, p.original_price) >= minDisc;
      });
    }

    if (minRating !== null) {
      result = result.filter(p => (p.rating ?? 0) >= minRating);
    }

    if (onlyInStock) {
      result = result.filter(p => (p.stock ?? 1) > 0);
    }

    if (sortBy === "price_asc")  result.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    if (sortBy === "rating")     result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return result;
  }, [products, priceRange, minDisc, minRating, onlyInStock, sortBy]);

  function clearFilters() {
    setPriceRange(null);
    setMinDisc(null);
    setMinRating(null);
    setOnlyInStock(false);
    setSortBy("relevance");
  }

  const hasFilters = priceRange || minDisc !== null || minRating !== null || onlyInStock;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] mb-4" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:text-indigo-500 transition-colors">Inicio</Link>
          <span>›</span>
          <Link href="/productos" className="hover:text-indigo-500 transition-colors capitalize">
  {catMeta.label}
</Link>
          <span>›</span>
          <span style={{ color: catMeta.color, fontWeight: 700 }}>{subcatLabel}</span>
        </nav>

        {/* Título */}
        <h1 className="text-2xl font-black mb-1" style={{ color: "var(--text)" }}>{subcatLabel}</h1>
        <p className="text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>
          Mostrando <span className="font-bold" style={{ color: catMeta.color }}>
            solo {subcatLabel}
          </span> · {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="flex gap-6 items-start">

          {/* ── SIDEBAR ── */}
          <aside className="hidden md:flex flex-col gap-0 flex-shrink-0 rounded-2xl overflow-hidden border"
            style={{ width: "230px", background: "var(--surface)", borderColor: "var(--border)" }}>

            {/* Otras subcategorías de la misma categoría */}
            {Object.keys(catMeta.subcats).filter(s => s !== subcategoria).length > 0 && (
              <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-[11px] font-black tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                  También en {catMeta.label}
                </p>
                <div className="flex flex-col gap-1">
                  {Object.entries(catMeta.subcats)
                    .filter(([slug]) => slug !== subcategoria)
                    .map(([slug, label]) => (
                      <Link
                        key={slug}
                        href={`/${categoria}/${slug}`}
                        className="flex items-center justify-between py-1.5 text-[12px] font-semibold rounded-lg px-2 transition-colors hover:bg-[var(--surface-alt)]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span>{label}</span>
                        {subcatCounts[slug] > 0 && (
                          <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
                            {subcatCounts[slug]}
                          </span>
                        )}
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Precio */}
            <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-[11px] font-black tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                💰 Precio
              </p>
              <div className="flex flex-col gap-1.5">
                {priceRanges.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setPriceRange(priceRange === r.value ? null : r.value)}
                    className="text-left text-[12px] py-2 px-3 rounded-xl border transition-all font-semibold"
                    style={{
                      borderColor: priceRange === r.value ? catMeta.color : "var(--border)",
                      background: priceRange === r.value ? catMeta.bg : "var(--surface)",
                      color: priceRange === r.value ? catMeta.color : "var(--text-muted)",
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Descuento */}
            <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-[11px] font-black tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                🔥 Descuento
              </p>
              <div className="flex flex-col gap-1.5">
                {[20, 30, 40].map(pct => (
                  <label key={pct} className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={minDisc === pct}
                      onChange={() => setMinDisc(minDisc === pct ? null : pct)}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <span className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>
                      <span className="font-black" style={{ color: "#dc2626" }}>−{pct}%</span> o más
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Valoración */}
            <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-[11px] font-black tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                ⭐ Valoración
              </p>
              <div className="flex flex-col gap-1.5">
                {[4, 3].map(stars => (
                  <label key={stars} className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={minRating === stars}
                      onChange={() => setMinRating(minRating === stars ? null : stars)}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <span className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>
                      {"★".repeat(stars)}{"☆".repeat(5 - stars)} y más
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-[11px] font-black tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                📦 Disponibilidad
              </p>
              <label className="flex items-center gap-2.5 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={() => setOnlyInStock(v => !v)}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>
                  Solo en stock
                </span>
              </label>
            </div>

            {/* Próximamente */}
            <div className="p-4">
              <p className="text-[11px] font-black tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                🚚 Tiempo de envío <span className="text-[9px] font-black bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded ml-1">PRÓXIMAMENTE</span>
              </p>
              <div className="flex flex-col gap-1.5 opacity-40 pointer-events-none">
                <label className="flex items-center gap-2.5 py-1">
                  <input type="checkbox" disabled className="w-4 h-4 rounded" />
                  <span className="text-[12.5px]">Express (3-7 días)</span>
                </label>
                <label className="flex items-center gap-2.5 py-1">
                  <input type="checkbox" disabled className="w-4 h-4 rounded" />
                  <span className="text-[12.5px]">Estándar (15 días)</span>
                </label>
              </div>
            </div>

            {/* Limpiar */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-3 text-[12px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors border-t"
                style={{ borderColor: "var(--border)" }}
              >
                ✕ Limpiar filtros
              </button>
            )}
          </aside>

          {/* ── COLUMNA DERECHA ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[12px] font-semibold hidden md:block" style={{ color: "var(--text-muted)" }}>
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="text-[12.5px] font-bold py-2 px-3 rounded-xl border outline-none cursor-pointer"
                  style={{
                    background: "var(--surface)", borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                >
                  <option value="relevance">Más relevantes</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                  <option value="rating">Mejor calificados</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="text-5xl">🔍</span>
                <p className="font-bold text-[15px]" style={{ color: "var(--text)" }}>
                  Sin resultados con estos filtros
                </p>
                <button
                  onClick={clearFilters}
                  className="text-indigo-500 font-bold text-[13px] hover:text-indigo-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map(p => {
                  const hasDisc = p.original_price && p.original_price > p.price;
                  const pct = hasDisc ? discPct(p.price, p.original_price!) : 0;
                  return (
                    <Link
                      key={p.id}
                      href={`/productos/${p.id}`}
                      className="group rounded-2xl border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      {/* Imagen */}
                      <div className="relative aspect-square" style={{ background: "var(--surface-alt)" }}>
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill sizes="240px" className="object-contain p-3" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            {p.icon ?? "📦"}
                          </div>
                        )}
                        {hasDisc && pct > 0 && (
                          <span className="absolute top-2 right-2 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md"
                            style={{ background: "#dc2626" }}>
                            −{pct}%
                          </span>
                        )}
                        {p.tag === "nuevo" && (
                          <span className="absolute top-2 left-2 font-black text-[9px] px-1.5 py-0.5 rounded-md"
                            style={{ background: "#d1fae5", color: "#065f46" }}>
                            NUEVO
                          </span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <p className="text-[12.5px] font-semibold leading-snug line-clamp-2 mb-2"
                          style={{ color: "var(--text)" }}>
                          {p.name}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[16px] font-black" style={{ color: catMeta.color }}>
                            {clp(p.price)}
                          </span>
                          {hasDisc && (
                            <span className="text-[11px] line-through" style={{ color: "var(--text-muted)" }}>
                              {clp(p.original_price!)}
                            </span>
                          )}
                        </div>
                        {p.rating && p.rating > 0 && (
                          <p className="text-[10.5px] mt-1" style={{ color: "var(--text-muted)" }}>
                            ⭐ {p.rating.toFixed(1)}
                            {p.review_count && p.review_count > 0 ? ` · ${p.review_count} reseñas` : ""}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}