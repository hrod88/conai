"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";

const categories: { value: Category; label: string; icon: string }[] = [
  { value: "salud",      label: "Salud",            icon: "❤️" },
  { value: "belleza",    label: "Belleza Tech",      icon: "✨" },
  { value: "hogar",      label: "Hogar Inteligente", icon: "🏠" },
  { value: "wearables",  label: "Wearables",         icon: "⌚" },
  { value: "mascotas",   label: "Mascotas",          icon: "🐾" },
  { value: "gadgets",    label: "Gadgets",           icon: "🤖" },
  { value: "audio",      label: "Audio",             icon: "🎧" },
  { value: "oficina",    label: "Oficina Tech",      icon: "💼" },
  { value: "juguetes",   label: "Juguetes & Bebés",  icon: "🧸" },
  { value: "deportes",   label: "Deportes",          icon: "⚽" },
  { value: "electronica",label: "Electrónica",       icon: "🔌" },
  { value: "telefonos",  label: "Teléfonos",         icon: "📱" },
];

const SUBCATEGORIES: Record<Category, { id: string; label: string }[]> = {
  salud: [
    { id: "ecg",        label: "Relojes & ECG" },
    { id: "tension",    label: "Tensiómetros Smart" },
    { id: "sueno",      label: "Sueño & Descanso" },
    { id: "glucometro", label: "Glucómetros" },
    { id: "termometro", label: "Termómetros Smart" },
    { id: "oximetro",   label: "Oxímetros" },
    { id: "masaje",     label: "Masajeadores Terapéuticos" },
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
    { id: "gps-pet",     label: "GPS & Rastreo" },
    { id: "comedero",    label: "Comederos Automáticos" },
    { id: "camara-pet",  label: "Cámaras para Mascotas" },
    { id: "salud-pet",   label: "Monitores de Salud" },
    { id: "juguetes-pet",label: "Juguetes Interactivos" },
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
    { id: "teclados",       label: "Teclados & Ratones IA" },
    { id: "monitores-of",   label: "Monitores Smart" },
    { id: "webcams",        label: "Webcams con IA" },
    { id: "productividad",  label: "Gadgets de Productividad" },
  ],
  juguetes: [
    { id: "educativos",  label: "Juguetes Educativos IA" },
    { id: "bebes",       label: "Monitores de Bebé" },
    { id: "robots-edu",  label: "Robots Educativos" },
    { id: "stem",        label: "STEM & Coding" },
  ],
  deportes: [
    { id: "relojes-dep",  label: "Relojes Deportivos" },
    { id: "sensores-dep", label: "Sensores de Entrenamiento" },
    { id: "ropa-smart",   label: "Ropa Inteligente" },
    { id: "equipos-dep",  label: "Equipos con IA" },
  ],
  electronica: [
    { id: "tablets",          label: "Tablets Smart" },
    { id: "streaming",        label: "Streaming & Smart TV" },
    { id: "accesorios-elec",  label: "Accesorios Smart" },
  ],
  telefonos: [
    { id: "smartphones",    label: "Smartphones IA" },
    { id: "accesorios-tel", label: "Accesorios Smart" },
    { id: "fundas",         label: "Fundas Inteligentes" },
  ],
};

const priceRanges = [
  { value: "low",  label: "Menos de $100" },
  { value: "mid",  label: "$100 – $400" },
  { value: "high", label: "Más de $400" },
];

interface Props {
  products: Product[];
  initialCategory: Category | null;
}

export default function ProductsClient({ products, initialCategory }: Props) {
  const [activeCategories, setActiveCategories] = useState<Category[]>(
    initialCategory ? [initialCategory] : []
  );
  const [activePrices, setActivePrices]         = useState<string[]>([]);
  const [activeTags, setActiveTags]             = useState<string[]>([]);
  const [scrollCat, setScrollCat]               = useState<Category | null>(initialCategory);
  const [catProgress, setCatProgress]           = useState(0);
  const [drillCategory, setDrillCategory]       = useState<Category | null>(initialCategory ?? null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [catOpen, setCatOpen]                   = useState(true);
  const [priceOpen, setPriceOpen]               = useState(true);
  const [tagsOpen, setTagsOpen]                 = useState(true);
  const [expandedCats, setExpandedCats]         = useState<Set<Category>>(new Set());
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);

  const scrollRef         = useRef<HTMLDivElement>(null);
  const sectionRefs       = useRef<Record<string, HTMLDivElement | null>>({});
  const isMounted         = useRef(false);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const topBarRef         = useRef<HTMLDivElement>(null);
  const [toggleTopPx, setToggleTopPx] = useState<number>(9);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (activeCategories.length > 0 && !activeCategories.includes(p.category as Category)) return false;
      if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
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
    return result;
  }, [products, activeCategories, activePrices, activeTags, activeSubcategory]);

  const grouped = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        items: filtered.filter((p) => p.category === cat.value),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  useEffect(() => {
    const measure = () => {
      if (!topBarRef.current || !outerContainerRef.current) return;
      const barRect = topBarRef.current.getBoundingClientRect();
      const cRect   = outerContainerRef.current.getBoundingClientRect();
      const barBottom = Math.round(barRect.bottom - cRect.top);
      setToggleTopPx(barBottom - 12);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeCategories]);

  useEffect(() => {
    if (!initialCategory) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [initialCategory]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    function onScroll() {
      const scrollTop = container!.scrollTop;
      const containerHeight = container!.clientHeight;
      let activeCat: Category | null = null;
      for (const cat of categories) {
        const el = sectionRefs.current[cat.value];
        if (!el) continue;
        if (el.offsetTop - 80 <= scrollTop) activeCat = cat.value;
      }
      setScrollCat(activeCat);
      const activeEl = activeCat ? sectionRefs.current[activeCat] : null;
      if (activeEl) {
        const top      = activeEl.offsetTop;
        const height   = activeEl.offsetHeight;
        const scrollable = Math.max(1, height - containerHeight + 80);
        const progress   = Math.max(0, Math.min(100, ((scrollTop - top + 80) / scrollable) * 100));
        setCatProgress(progress);
      }
    }
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [grouped]);

  function scrollToCategory(catValue: Category) {
    const el = sectionRefs.current[catValue];
    const container = scrollRef.current;
    if (!el || !container) return;
    container.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
  }

  function handleCatClick(val: Category) {
    if (drillCategory === val) {
      setDrillCategory(null);
      setActiveCategories([]);
      setActiveSubcategory(null);
    } else {
      setDrillCategory(val);
      setActiveCategories([val]);
      setActiveSubcategory(null);
    }
  }

  function togglePrice(val: string) {
    setActivePrices((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  function toggleTag(val: string) {
    setActiveTags((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  function clearFilters() {
    setActiveCategories([]);
    setActivePrices([]);
    setActiveTags([]);
    setDrillCategory(null);
    setActiveSubcategory(null);
  }

  const drillCatMeta   = drillCategory ? categories.find((c) => c.value === drillCategory) : null;
  const scrollCatIndex = scrollCat ? categories.findIndex((c) => c.value === scrollCat) : -1;

  return (
    <div ref={outerContainerRef} className="flex h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Sidebar */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{ width: sidebarOpen ? "176px" : "0px", transition: "width 200ms ease" }}
      >
      <aside
        className="w-44 h-full border-r overflow-y-auto p-3 flex flex-col gap-2"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        onMouseLeave={() => setHoveredSubcategory(null)}
      >
        <div>
          <button
            onClick={() => setCatOpen((v) => !v)}
            className="flex items-center gap-1.5 w-full mb-2"
          >
            <span className="text-[var(--text-muted)] text-[18px] leading-none" style={{ transform: catOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 200ms" }}>›</span>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Categorías</p>
          </button>
          {catOpen && categories.map((c) => {
            const count      = products.filter((p) => p.category === c.value).length;
            const active     = activeCategories.includes(c.value);
            const isExpanded = expandedCats.has(c.value);
            return (
              <div key={c.value}>
                <div className="flex items-center gap-1 mb-1.5">
                  <button
                    onClick={() => {
                      const next = new Set(expandedCats);
                      if (next.has(c.value)) next.delete(c.value); else next.add(c.value);
                      setExpandedCats(next);
                    }}
                    className="flex-shrink-0 w-4 flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500"
                  >
                    <span
                      className="text-[14px] leading-none inline-block"
                      style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 200ms" }}
                    >›</span>
                  </button>
                  <label className="flex items-center justify-between flex-1 cursor-pointer group">
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] font-medium group-hover:text-indigo-500">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => {
                          if (active) {
                            setActiveCategories([]);
                            setDrillCategory(null);
                            setActiveSubcategory(null);
                          } else {
                            setActiveCategories([c.value]);
                            setDrillCategory(c.value);
                            setActiveSubcategory(null);
                            setExpandedCats((prev) => { const n = new Set(prev); n.add(c.value); return n; });
                          }
                        }}
                        className="accent-indigo-600 w-3 h-3"
                      />
                      {c.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active
                          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                          : "text-[var(--text-muted)]"
                      }`}
                      style={!active ? { background: "var(--surface-alt)" } : {}}
                    >
                      {count}
                    </span>
                  </label>
                </div>
                {isExpanded && (
                  <div className="ml-4 mb-1.5">
                    {SUBCATEGORIES[c.value].map((sub) => {
                      const subCount  = products.filter((p) => p.category === c.value && p.subcategory === sub.id).length;
                      const subActive = activeSubcategory === sub.id && drillCategory === c.value;
                      return (
                        <label key={sub.id} className="flex items-center justify-between mb-1 cursor-pointer group" onMouseEnter={() => setHoveredSubcategory(sub.id)}>
                          <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium group-hover:text-indigo-500">
                            <input
                              type="checkbox"
                              checked={subActive}
                              onChange={() => {
                                if (subActive) {
                                  setActiveSubcategory(null);
                                  setDrillCategory(null);
                                  setActiveCategories([]);
                                } else {
                                  setActiveSubcategory(sub.id);
                                  setDrillCategory(c.value);
                                  setActiveCategories([c.value]);
                                }
                              }}
                              className="accent-indigo-600 w-3 h-3"
                            />
                            {sub.label}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">{subCount}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        <div>
          <button
            onClick={() => setPriceOpen((v) => !v)}
            className="flex items-center gap-1.5 w-full mb-2"
          >
            <span className="text-[var(--text-muted)] text-[18px] leading-none" style={{ transform: priceOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 200ms" }}>›</span>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Precio</p>
          </button>
          {priceOpen && priceRanges.map((r) => (
            <label key={r.value} className="flex items-center gap-1.5 mb-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={activePrices.includes(r.value)}
                onChange={() => togglePrice(r.value)}
                className="accent-indigo-600 w-3 h-3"
              />
              <span className="text-[12px] text-[var(--text-muted)] font-medium">{r.label}</span>
            </label>
          ))}
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        <div>
          <button
            onClick={() => setTagsOpen((v) => !v)}
            className="flex items-center gap-1.5 w-full mb-2"
          >
            <span className="text-[var(--text-muted)] text-[18px] leading-none" style={{ transform: tagsOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 200ms" }}>›</span>
            <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Destacados</p>
          </button>
          {tagsOpen && ["bestseller", "nuevo", "descuento"].map((tag) => (
            <label key={tag} className="flex items-center gap-1.5 mb-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={activeTags.includes(tag)}
                onChange={() => toggleTag(tag)}
                className="accent-indigo-600 w-3 h-3"
              />
              <span className="text-[12px] text-[var(--text-muted)] capitalize font-medium">{tag}</span>
            </label>
          ))}
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        <button
          onClick={clearFilters}
          className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-indigo-500 border rounded-lg py-1.5 transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          Limpiar filtros
        </button>
      </aside>
      </div>

      {/* Toggle sidebar */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute z-20 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shadow-lg border-2 border-white dark:border-gray-900"
        style={{ left: sidebarOpen ? "164px" : "0px", top: `${toggleTopPx}px`, transition: "left 200ms ease" }}
      >
        {sidebarOpen ? "‹" : "›"}
      </button>

      {/* Grid principal */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Barra superior: categorías ↔ subcategorías animadas */}
        <div ref={topBarRef} className="flex flex-col" style={{ background: "var(--surface)" }}>
          <div className="flex items-center gap-3 px-4 pt-2 pb-1">

            {/* Contenedor animado */}
            <div className="relative overflow-hidden flex-1 h-8">

              {/* Capa 1 — Categorías */}
              <div
                className="absolute inset-0 flex items-center overflow-x-auto"
                style={{
                  opacity: drillCategory ? 0 : 1,
                  pointerEvents: drillCategory ? "none" : "auto",
                }}
              >
                <div className="flex items-center justify-center gap-6 min-w-full w-max mx-auto">
                  {categories.map((c) => {
                    const active = activeCategories.includes(c.value);
                    return (
                      <button
                        key={c.value}
                        onClick={() => handleCatClick(c.value)}
                        className={`flex-shrink-0 text-[13px] transition-colors ${
                          active
                            ? "font-bold text-indigo-600 dark:text-indigo-400"
                            : "font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capa 2 — Subcategorías */}
              <div
                className="absolute inset-0 flex items-center overflow-x-auto"
                style={{
                  opacity: drillCategory ? 1 : 0,
                  pointerEvents: drillCategory ? "auto" : "none",
                }}
              >
                <div className="flex items-center gap-5 w-max px-1">
                  <button
                    onClick={() => handleCatClick(drillCategory!)}
                    className="flex-shrink-0 text-[13px] font-bold text-white bg-indigo-600 dark:bg-indigo-500 px-2.5 py-0.5 rounded-full"
                  >
                    {drillCatMeta?.label}
                  </button>
                  {drillCategory && SUBCATEGORIES[drillCategory].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubcategory(sub.id)}
                      className={`flex-shrink-0 text-[13px] transition-colors ${
                        (hoveredSubcategory ?? activeSubcategory) === sub.id
                          ? "font-bold text-indigo-600 dark:text-indigo-400"
                          : "font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Barra de progreso por categoría */}
          <div className="flex h-[3px]">
            {categories.map((c, i) => {
              const isPast    = i < scrollCatIndex;
              const isCurrent = c.value === scrollCat;
              return (
                <button
                  key={c.value}
                  onClick={() => scrollToCategory(c.value)}
                  className="flex-1 relative overflow-hidden"
                  style={{ background: "var(--border)" }}
                >
                  {isPast && <div className="absolute inset-0 bg-indigo-500" />}
                  {isCurrent && (
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{
                        width: `${catProgress}%`,
                        background: "linear-gradient(90deg, #6366f1, #38bdf8)",
                        transition: "width 0.1s linear",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Productos */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3"
          style={{ background: "var(--bg)" }}
        >
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-muted)]">
              <span className="text-5xl">🔍</span>
              <p className="text-sm font-semibold">Sin resultados</p>
              <button onClick={clearFilters} className="text-indigo-500 text-xs font-bold">
                Limpiar filtros
              </button>
            </div>
          ) : (
            grouped.map((group) => (
              <div
                key={group.value}
                ref={(el) => { sectionRefs.current[group.value] = el; }}
                className="mb-8"
              >
                <div
                  className="flex items-center gap-2 mb-3 pb-2 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="text-lg">{group.icon}</span>
                  <h2 className="text-sm font-black text-[var(--text)] uppercase tracking-wide">
                    {group.label}
                  </h2>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "var(--surface-alt)", color: "var(--text-muted)" }}
                  >
                    {group.items.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 auto-rows-fr">
                  {group.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
