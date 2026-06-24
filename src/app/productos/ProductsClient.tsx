"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import {
  Heart, Sparkles, House, Watch, PawPrint, Bot, Headphones, Briefcase,
  ToyBrick, Dumbbell, Plug, Smartphone, Menu, type LucideIcon,
} from "lucide-react";

const categories: { value: Category; label: string; icon: LucideIcon }[] = [
  { value: "salud",       label: "Salud",            icon: Heart },
  { value: "belleza",     label: "Belleza Tech",      icon: Sparkles },
  { value: "hogar",       label: "Hogar Inteligente", icon: House },
  { value: "wearables",   label: "Wearables",         icon: Watch },
  { value: "mascotas",    label: "Mascotas",          icon: PawPrint },
  { value: "gadgets",     label: "Gadgets",           icon: Bot },
  { value: "audio",       label: "Audio",             icon: Headphones },
  { value: "oficina",     label: "Oficina Tech",      icon: Briefcase },
  { value: "juguetes",    label: "Juguetes & Bebés",  icon: ToyBrick },
  { value: "deportes",    label: "Deportes",          icon: Dumbbell },
  { value: "electronica", label: "Electrónica",       icon: Plug },
  { value: "telefonos",   label: "Teléfonos",         icon: Smartphone },
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
  const [drillCategory, setDrillCategory]         = useState<Category | null>(initialCategory ?? null);
  // Categoría sobre la que está el cursor (hover). Solo desktop.
  // Si hay hover, manda el hover; si no, manda lo elegido por clic (drillCategory).
  const [hoverCategory, setHoverCategory]         = useState<Category | null>(null);
  // Si el mega-menú (sidebar) está desplegado. Arranca cerrado y se abre
  // al pasar el cursor por el botón hamburguesa o por el propio sidebar.
  const [menuOpen, setMenuOpen]                   = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  // Subcategoría sobre la que está el cursor (hover). Si hay, manda sobre la fijada.
  const [hoverSubcategory, setHoverSubcategory]   = useState<string | null>(null);
  const [activePrices, setActivePrices]           = useState<string[]>([]);
  const [activeTags, setActiveTags]               = useState<string[]>([]);
  const [sortBy, setSortBy]                       = useState<SortOption>("relevance");
  const [isMobile, setIsMobile]                   = useState(false);
  const [filterSheetOpen, setFilterSheetOpen]     = useState(false);
  const [sortSheetOpen, setSortSheetOpen]         = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Temporizador para cerrar el menú con un pequeño retardo (evita cierres bruscos
  // al cruzar el huequito entre el botón y el sidebar).
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Categoría efectiva: el hover tiene prioridad sobre la selección por clic.
  // Esta es la que se usa para mostrar la barra de subcategorías y filtrar.
  const filterCat    = hoverCategory ?? drillCategory;
  // El hover de subcategoría tiene prioridad sobre la fijada por clic.
  const filterSubcat = hoverSubcategory ?? activeSubcategory;

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
  }, [products, filterCat, filterSubcat, activePrices, activeTags, sortBy]);

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

  // Abrir / cerrar el mega-menú con retardo al cerrar.
  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  }
  function scheduleCloseMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setMenuOpen(false);
      setHoverCategory(null);
    }, 140);
  }

  function handleCatClick(val: Category) {
    if (drillCategory === val) {
      setDrillCategory(null);
      setActiveSubcategory(null);
    } else {
      setDrillCategory(val);
      setActiveSubcategory(null);
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

  // Categoría cuyas subcategorías se muestran en la barra horizontal (desktop).
  // Igual que filterCat: hover manda, si no, lo fijado por clic.
  const barCategory = hoverCategory ?? drillCategory;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">

      {/* ══ DESKTOP: Franja superior — botón (izq) + barra de subcategorías (der), misma altura h-12 ══ */}
      <div
        className="hidden md:flex items-stretch h-12 flex-shrink-0"
        style={{ background: "var(--bg)" }}
      >
        {/* Botón "Todas las categorías" — minimizado (solo ☰) cuando el rail está contraído,
            completo (☰ + texto) al expandir. Su ancho acompaña al del rail para quedar alineado. */}
        <button
          onMouseEnter={openMenu}
          onMouseLeave={scheduleCloseMenu}
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex items-center h-full text-[13px] font-bold whitespace-nowrap flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-out rounded-lg hover:bg-[var(--surface-alt)] ${
            menuOpen ? "w-44 gap-2.5 px-4 justify-start" : "w-14 gap-0 px-0 justify-center"
          }`}
          style={{ background: "transparent", color: "var(--text)" }}
          aria-label="Todas las categorías"
        >
          <Menu size={18} strokeWidth={2} className="flex-shrink-0" />
          {menuOpen && <span>Todas las categorías</span>}
        </button>

        {/* Barra de subcategorías. NO abre el sidebar (eso es solo del botón ☰). */}
        {barCategory ? (
          <div
            className="flex-1 flex items-center gap-2 px-4 overflow-x-auto"
            style={{ scrollbarWidth: "none" } as React.CSSProperties}
          >
            <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase flex-shrink-0 mr-1">
              {categories.find((c) => c.value === barCategory)?.label} ›
            </span>
            <button
              // "Todas" fija la categoría por clic y limpia la subcategoría.
              onClick={() => { setDrillCategory(barCategory); setActiveSubcategory(null); }}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
                !activeSubcategory
                  ? "text-white border-transparent"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-300"
              }`}
              style={!activeSubcategory ? { background: "linear-gradient(135deg, #6366f1, #38bdf8)" } : { background: "var(--surface)" }}
            >
              Todas
            </button>
            {SUBCATEGORIES[barCategory].map((sub) => {
              const count    = products.filter((p) => p.category === barCategory && p.subcategory === sub.id).length;
              const isActive = activeSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  // Al hacer clic en una subcategoría, fijamos la categoría por clic
                  // (drillCategory) para que el filtro persista al sacar el cursor.
                  onClick={() => {
                    setDrillCategory(barCategory);
                    setActiveSubcategory(isActive ? null : sub.id);
                  }}
                  // Al pasar el cursor, la grilla muestra esta subcategoría al vuelo.
                  onMouseEnter={() => setHoverSubcategory(sub.id)}
                  onMouseLeave={() => setHoverSubcategory(null)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
                    isActive
                      ? "text-white border-transparent"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-300"
                  }`}
                  style={isActive ? { background: "linear-gradient(135deg, #6366f1, #38bdf8)" } : { background: "var(--surface)" }}
                >
                  {sub.label}
                  {count > 0 && (
                    <span className={`text-[10px] ${isActive ? "opacity-80" : "text-[var(--text-muted)]"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center px-4 text-[12px] text-[var(--text-muted)]">
            Pasa el cursor sobre “Todas las categorías” para explorar.
          </div>
        )}
      </div>

      {/* ══ Cuerpo: sidebar (colapsa su ANCHO al ocultarse) + área principal ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── DESKTOP: Sidebar RAIL. Contraído (w-14) muestra solo íconos; al pasar el
            cursor se expande (w-44) mostrando los nombres. Empuja la grilla al expandir. ── */}
        <div
          className="hidden md:flex flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-out"
          style={{
            width: menuOpen ? "11rem" : "3.5rem",
            background: "var(--bg)",
          }}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleCloseMenu}
        >
          <div
            className="flex-shrink-0 overflow-y-auto overflow-x-hidden flex flex-col py-2 transition-[width] duration-200 ease-out"
            style={{ width: menuOpen ? "11rem" : "3.5rem" }}
          >
            {categories.map((c) => {
              // Resaltado: activo si está fijado por clic O si el cursor está encima.
              const isActive = (hoverCategory ?? drillCategory) === c.value;
              const Icon = c.icon;
              return (
                <button
                  key={c.value}
                  onClick={() => handleCatClick(c.value)}
                  // Al pasar el cursor, se actualiza la categoría de hover →
                  // la barra de subcategorías de arriba cambia sola, sin clic.
                  onMouseEnter={() => setHoverCategory(c.value)}
                  title={c.label}
                  className={`flex items-center justify-between py-2.5 mx-2 rounded-xl text-[12.5px] font-medium transition-colors ${
                    menuOpen ? "px-3" : "px-0 justify-center"
                  } ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]"
                  }`}
                >
                  <span className={`flex items-center min-w-0 ${menuOpen ? "gap-2" : "gap-0 justify-center w-full"}`}>
                    <Icon size={18} strokeWidth={1.5} className="flex-shrink-0" style={isActive ? { color: "#6366f1" } : undefined} />
                    {menuOpen && <span className="truncate">{c.label}</span>}
                  </span>
                  {menuOpen && (
                    <span className={`text-xs flex-shrink-0 ml-1 ${isActive ? "text-indigo-400" : "text-[var(--text-muted)]"}`}>›</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ Área principal (grilla + barra móvil) ══ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

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
                    <c.icon size={17} strokeWidth={2} className="flex-shrink-0" />
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
            ) : (
              /* Grilla. Sidebar oculto → 6 columnas (usa todo el ancho).
                 Sidebar visible → 5 columnas (cede espacio al sidebar). */
              <div className={`grid gap-3 auto-rows-fr grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${menuOpen ? "lg:grid-cols-4 xl:grid-cols-5" : "lg:grid-cols-5 xl:grid-cols-6"}`}>
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
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