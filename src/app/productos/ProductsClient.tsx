"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";

const categories: { value: Category; label: string; icon: string }[] = [
  { value: "salud",       label: "Salud",            icon: "❤️" },
  { value: "belleza",     label: "Belleza Tech",      icon: "✨" },
  { value: "hogar",       label: "Hogar Inteligente", icon: "🏠" },
  { value: "wearables",   label: "Wearables",         icon: "⌚" },
  { value: "mascotas",    label: "Mascotas",          icon: "🐾" },
  { value: "gadgets",     label: "Gadgets",           icon: "🤖" },
  { value: "audio",       label: "Audio",             icon: "🎧" },
  { value: "oficina",     label: "Oficina Tech",      icon: "💼" },
  { value: "juguetes",    label: "Juguetes & Bebés",  icon: "🧸" },
  { value: "deportes",    label: "Deportes",          icon: "⚽" },
  { value: "electronica", label: "Electrónica",       icon: "🔌" },
  { value: "telefonos",   label: "Teléfonos",         icon: "📱" },
];

const SUBCATEGORIES: Record<Category, { id: string; label: string }[]> = {
  salud: [
    { id: "ecg",        label: "Relojes & ECG" },
    { id: "tension",    label: "Tensiómetros Smart" },
    { id: "sueno",      label: "Sueño & Descanso" },
    { id: "glucometro", label: "Glucómetros" },
    { id: "termometro", label: "Termómetros Smart" },
    { id: "oximetro",   label: "Oxímetros" },
    { id: "masaje",     label: "Masajeadores" },
  ],
  belleza: [
    { id: "piel",    label: "Cuidado de Piel IA" },
    { id: "ipl",     label: "Depilación IPL" },
    { id: "facial",  label: "Masaje Facial Smart" },
    { id: "espejo",  label: "Espejos Inteligentes" },
    { id: "cepillo", label: "Cepillos Sónicos" },
  ],
  hogar: [
    { id: "iluminacion", label: "Iluminación Smart" },
    { id: "enchufes",    label: "Enchufes & Energía" },
    { id: "seguridad",   label: "Cámaras & Seguridad" },
    { id: "robots",      label: "Robots del Hogar" },
    { id: "clima",       label: "Termostatos & Clima" },
    { id: "cerraduras",  label: "Cerraduras Smart" },
  ],
  wearables: [
    { id: "smartwatch", label: "Smartwatches" },
    { id: "anillos",    label: "Smart Rings" },
    { id: "fitness",    label: "Fitness Trackers" },
    { id: "gafas",      label: "Gafas Smart" },
  ],
  mascotas: [
    { id: "gps-pet",      label: "GPS & Rastreo" },
    { id: "comedero",     label: "Comederos Automáticos" },
    { id: "camara-pet",   label: "Cámaras para Mascotas" },
    { id: "salud-pet",    label: "Monitores de Salud" },
    { id: "juguetes-pet", label: "Juguetes Interactivos" },
  ],
  gadgets: [
    { id: "cargadores",  label: "Cargadores Inteligentes" },
    { id: "proyectores", label: "Proyectores Smart" },
    { id: "lamparas",    label: "Lámparas Inteligentes" },
    { id: "accesorios",  label: "Accesorios Tech" },
  ],
  audio: [
    { id: "auriculares", label: "Auriculares ANC/IA" },
    { id: "parlantes",   label: "Parlantes Inteligentes" },
    { id: "traductores", label: "Traductores en Tiempo Real" },
    { id: "micros",      label: "Micrófonos Smart" },
  ],
  oficina: [
    { id: "teclados",      label: "Teclados & Ratones IA" },
    { id: "monitores-of",  label: "Monitores Smart" },
    { id: "webcams",       label: "Webcams con IA" },
    { id: "productividad", label: "Gadgets de Productividad" },
  ],
  juguetes: [
    { id: "educativos", label: "Juguetes Educativos IA" },
    { id: "bebes",      label: "Monitores de Bebé" },
    { id: "robots-edu", label: "Robots Educativos" },
    { id: "stem",       label: "STEM & Coding" },
  ],
  deportes: [
    { id: "relojes-dep",  label: "Relojes Deportivos" },
    { id: "sensores-dep", label: "Sensores de Entrenamiento" },
    { id: "ropa-smart",   label: "Ropa Inteligente" },
    { id: "equipos-dep",  label: "Equipos con IA" },
  ],
  electronica: [
    { id: "tablets",         label: "Tablets Smart" },
    { id: "streaming",       label: "Streaming & Smart TV" },
    { id: "accesorios-elec", label: "Accesorios Smart" },
  ],
  telefonos: [
    { id: "smartphones",    label: "Smartphones IA" },
    { id: "accesorios-tel", label: "Accesorios Smart" },
    { id: "fundas",         label: "Fundas Inteligentes" },
  ],
};

const priceRanges = [
  { value: "low",  label: "Menos de $100", short: "< $100" },
  { value: "mid",  label: "$100 – $400",   short: "$100–$400" },
  { value: "high", label: "Más de $400",   short: "> $400" },
];

type SortOption = "relevance" | "price_asc" | "price_desc" | "rating";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "relevance",  label: "Más relevantes" },
  { value: "price_asc",  label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "rating",     label: "Mejor calificados" },
];

interface Props {
  products: Product[];
  initialCategory: Category | null;
}

export default function ProductsClient({ products, initialCategory }: Props) {
  const [panelHoveredCat, setPanelHoveredCat]   = useState<Category | null>(null);
  const [drillCategory, setDrillCategory]         = useState<Category | null>(initialCategory ?? null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [previewSubcategory, setPreviewSubcategory] = useState<string | null>(null);
  const [activePrices, setActivePrices]           = useState<string[]>([]);
  const [activeTags, setActiveTags]               = useState<string[]>([]);
  const [sortBy, setSortBy]                       = useState<SortOption>("relevance");
  const [isMobile, setIsMobile]                   = useState(false);
  const [filterSheetOpen, setFilterSheetOpen]     = useState(false);
  const [sortSheetOpen, setSortSheetOpen]         = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Col 2 displays subcategories of this category (defaults to first if nothing active)
  const col2Cat: Category = panelHoveredCat || drillCategory || categories[0].value;
  const col2CatMeta = categories.find((c) => c.value === col2Cat)!;

  // Effective filters — hover takes priority over permanent selection
  const filterCat    = panelHoveredCat || drillCategory;
  const filterSubcat = previewSubcategory || activeSubcategory;

  // First product image per subcategory → circular thumbnails in col 2
  const subcatImages = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const cat of categories) {
      for (const sub of SUBCATEGORIES[cat.value]) {
        const p = products.find((pr) => pr.subcategory === sub.id && pr.image);
        map[sub.id] = p?.image ?? undefined;
      }
    }
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (filterCat    && p.category    !== filterCat)    return false;
      if (filterSubcat && p.subcategory !== filterSubcat) return false;
      if (activePrices.length > 0) {
        const inRange =
          (activePrices.includes("low")  && p.price < 100) ||
          (activePrices.includes("mid")  && p.price >= 100 && p.price <= 400) ||
          (activePrices.includes("high") && p.price > 400);
        if (!inRange) return false;
      }
      if (activeTags.length > 0 && (!p.tag || !activeTags.includes(p.tag))) return false;
      return true;
    });
    if (sortBy === "price_asc")  result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "rating")     result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return result;
  }, [products, panelHoveredCat, drillCategory, previewSubcategory, activeSubcategory, activePrices, activeTags, sortBy]);

  const grouped = useMemo(() => {
    return categories
      .map((cat) => ({ ...cat, items: filtered.filter((p) => p.category === cat.value) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [drillCategory, activeSubcategory]);

  function handleCatClick(val: Category) {
    if (drillCategory === val) {
      setDrillCategory(null);
      setActiveSubcategory(null);
    } else {
      setDrillCategory(val);
      setActiveSubcategory(null);
    }
  }

  function handleSubcatClick(catVal: Category, subId: string) {
    if (activeSubcategory === subId && drillCategory === catVal) {
      setActiveSubcategory(null);
      setDrillCategory(null);
    } else {
      setActiveSubcategory(subId);
      setDrillCategory(catVal);
    }
  }

  function togglePrice(val: string) {
    setActivePrices((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  }

  function toggleTag(val: string) {
    setActiveTags((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  }

  function clearFilters() {
    setDrillCategory(null);
    setActiveSubcategory(null);
    setActivePrices([]);
    setActiveTags([]);
  }

  const activeFilterCount = activePrices.length + activeTags.length;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ══ DESKTOP: Left panel (Col 1 + Col 2) ══ */}
      <div
        className="hidden md:flex flex-shrink-0"
        onMouseLeave={() => {
          setPanelHoveredCat(null);
          setPreviewSubcategory(null);
        }}
      >
        {/* Col 1 — Category list */}
        <div
          className="w-36 flex-shrink-0 overflow-y-auto flex flex-col py-2"
          style={{ background: "var(--surface)" }}
        >
          <p className="text-[9px] font-black tracking-widest text-[var(--text-muted)] uppercase px-4 pb-2 pt-1">
            Categorías
          </p>
          {categories.map((c) => {
            const isHighlighted = col2Cat === c.value;
            const isActive      = drillCategory === c.value;
            return (
              <button
                key={c.value}
                onMouseEnter={() => setPanelHoveredCat(c.value)}
                onClick={() => handleCatClick(c.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  isHighlighted
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                }`}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm leading-none flex-shrink-0">{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </span>
                <span className={`text-xs flex-shrink-0 ml-1 ${isActive ? "text-indigo-400" : "text-[var(--text-muted)]"}`}>›</span>
              </button>
            );
          })}
        </div>

        {/* Col 2 — Subcategory grid with circular images */}
        <div
          className="w-64 flex-shrink-0 overflow-y-auto pt-2 px-4 pb-4"
          style={{ background: "var(--bg)", boxShadow: "1px 0 0 var(--border)" }}
        >
          <p className="text-[9px] font-black tracking-widest text-[var(--text-muted)] uppercase pb-2 pt-1">
            {col2CatMeta.label}
          </p>
          <div className="grid grid-cols-3 gap-x-1 gap-y-4">
            {SUBCATEGORIES[col2Cat].map((sub) => {
              const img      = subcatImages[sub.id];
              const count    = products.filter((p) => p.category === col2Cat && p.subcategory === sub.id).length;
              const isActive = activeSubcategory === sub.id && drillCategory === col2Cat;
              const isPrev   = previewSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onMouseEnter={() => setPreviewSubcategory(sub.id)}
                  onClick={() => handleSubcatClick(col2Cat, sub.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-150 ${
                    isActive
                      ? "border-indigo-500 shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
                      : isPrev
                        ? "border-indigo-300 scale-105"
                        : "border-[var(--border)] group-hover:border-indigo-300 group-hover:scale-105"
                  }`}>
                    {img ? (
                      <img src={img} alt={sub.label} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ background: "var(--surface-alt)" }}
                      />
                    )}
                  </div>
                  <span className={`text-[9px] text-center leading-tight transition-colors px-0.5 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text)]"
                  }`}>
                    {sub.label}
                  </span>
                  {count > 0 && (
                    <span className="text-[8px] text-[var(--text-muted)]">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ Col 3 (desktop) / Main area (mobile) ══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Mobile top bar ── */}
        <div
          className="md:hidden flex flex-col border-b"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="flex gap-2 overflow-x-auto px-3 pt-2.5 pb-1.5"
            style={{ scrollbarWidth: "none" } as React.CSSProperties}
          >
            <button
              onClick={clearFilters}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
                !drillCategory
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
              style={drillCategory ? { background: "var(--bg)" } : {}}
            >
              Todo
            </button>
            {categories.map((c) => {
              const active = drillCategory === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => handleCatClick(c.value)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                  style={!active ? { background: "var(--bg)" } : {}}
                >
                  <span className="text-sm leading-none">{c.icon}</span>
                  {c.label}
                </button>
              );
            })}
          </div>

          {drillCategory && (
            <div
              className="flex gap-2 overflow-x-auto px-3 pb-1.5"
              style={{ scrollbarWidth: "none" } as React.CSSProperties}
            >
              {SUBCATEGORIES[drillCategory].map((sub) => {
                const active = activeSubcategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubcategory(active ? null : sub.id)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                      active
                        ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700"
                        : "border-[var(--border)] text-[var(--text-muted)]"
                    }`}
                    style={!active ? { background: "var(--bg)" } : {}}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-2 px-3 pb-2.5 pt-1">
            <button
              onClick={() => setSortSheetOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold border"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              ↕ Ordenar
              {sortBy !== "relevance" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />}
            </button>
            <button
              onClick={() => setFilterSheetOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold border"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              ⚙️ Filtros
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full font-black leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Product grid */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 md:p-4"
          style={{ background: "var(--bg)" }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
              <span className="text-5xl">🔍</span>
              <p className="text-sm font-semibold">Sin resultados</p>
              <button onClick={clearFilters} className="text-indigo-500 text-xs font-bold">
                Limpiar filtros
              </button>
            </div>
          ) : filterCat ? (
            /* Category selected/hovered → flat grid */
            <div
              className="grid gap-3 auto-rows-fr"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))" }}
            >
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            /* No category → flat grid */
            <div
              className="grid gap-3 auto-rows-fr"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))" }}
            >
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Sheet: Filtros (móvil) ── */}
      {filterSheetOpen && isMobile && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setFilterSheetOpen(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[85vh] flex flex-col"
            style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
            </div>
            <div className="overflow-y-auto px-5 pb-8 pt-2">
              <h3 className="text-base font-black text-[var(--text)] mb-5">Filtros</h3>
              <p className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase mb-3">Precio</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {priceRanges.map((r) => {
                  const active = activePrices.includes(r.value);
                  return (
                    <button
                      key={r.value}
                      onClick={() => togglePrice(r.value)}
                      className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-colors ${
                        active ? "bg-indigo-600 text-white border-indigo-600" : "border-[var(--border)] text-[var(--text-muted)]"
                      }`}
                      style={!active ? { background: "var(--surface)" } : {}}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase mb-3">Destacados</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { value: "bestseller", label: "⭐ Bestseller" },
                  { value: "nuevo",      label: "🆕 Nuevo" },
                  { value: "descuento",  label: "💲 Descuento" },
                ].map((tag) => {
                  const active = activeTags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-colors ${
                        active ? "bg-indigo-600 text-white border-indigo-600" : "border-[var(--border)] text-[var(--text-muted)]"
                      }`}
                      style={!active ? { background: "var(--surface)" } : {}}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { clearFilters(); setFilterSheetOpen(false); }}
                  className="flex-1 py-3 rounded-2xl border text-sm font-bold"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setFilterSheetOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold"
                >
                  Aplicar{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Bottom Sheet: Ordenar (móvil) ── */}
      {sortSheetOpen && isMobile && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSortSheetOpen(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
            style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
            </div>
            <div className="px-5 pt-2 pb-10">
              <h3 className="text-base font-black text-[var(--text)] mb-4">Ordenar por</h3>
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setSortSheetOpen(false); }}
                  className="w-full flex items-center justify-between py-4 border-b text-sm font-medium last:border-0 transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    color: sortBy === opt.value ? "#6366f1" : "var(--text)",
                  }}
                >
                  {opt.label}
                  {sortBy === opt.value && <span className="text-indigo-600 font-black text-base">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
