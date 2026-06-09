"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/products/ProductCard";

const categories: { value: Category; label: string; icon: string }[] = [
  { value: "salud", label: "Salud", icon: "❤️" },
  { value: "belleza", label: "Belleza Tech", icon: "✨" },
  { value: "hogar", label: "Hogar Inteligente", icon: "🏠" },
  { value: "wearables", label: "Wearables", icon: "⌚" },
  { value: "mascotas", label: "Mascotas", icon: "🐾" },
  { value: "gadgets", label: "Gadgets", icon: "🤖" },
];

const priceRanges = [
  { value: "low", label: "Menos de $100" },
  { value: "mid", label: "$100 – $400" },
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
  const [activePrices, setActivePrices] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [scrollCat, setScrollCat] = useState<Category | null>(initialCategory);
  const [catProgress, setCatProgress] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isMounted = useRef(false);

  // Filtra y ordena
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (activeCategories.length > 0 && !activeCategories.includes(p.category as Category)) return false;
      if (activePrices.length > 0) {
        const inRange =
          (activePrices.includes("low") && p.price < 100) ||
          (activePrices.includes("mid") && p.price >= 100 && p.price <= 400) ||
          (activePrices.includes("high") && p.price > 400);
        if (!inRange) return false;
      }
      if (activeTags.length > 0 && (!p.tag || !activeTags.includes(p.tag))) return false;
      return true;
    });
    if (sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "rating") result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return result;
  }, [products, activeCategories, activePrices, activeTags, sort]);

  // Agrupa por categoría
  const grouped = useMemo(() => {
    return categories
      .map((cat) => ({
        ...cat,
        items: filtered.filter((p) => p.category === cat.value),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  // Scroll al top cuando cambia el filtro de categoría (no en el mount inicial)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeCategories]);

  // Scroll al montar si hay categoría inicial
  useEffect(() => {
    if (!initialCategory) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [initialCategory]);

  // Detecta qué categoría está visible y calcula el progreso
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    function onScroll() {
      const scrollTop = container!.scrollTop;
      const containerHeight = container!.clientHeight;

      // Busca la última sección cuyo tope ya pasó el scroll actual
      let activeCat: Category | null = null;
      for (const cat of categories) {
        const el = sectionRefs.current[cat.value];
        if (!el) continue;
        if (el.offsetTop - 80 <= scrollTop) {
          activeCat = cat.value;
        }
      }

      setScrollCat(activeCat);

      const activeEl = activeCat ? sectionRefs.current[activeCat] : null;
      if (activeEl) {
        const top = activeEl.offsetTop;
        const height = activeEl.offsetHeight;
        const scrollable = Math.max(1, height - containerHeight + 80);
        const progress = Math.max(0, Math.min(100, ((scrollTop - top + 80) / scrollable) * 100));
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

  function toggleCategory(val: Category) {
    setActiveCategories((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
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
  }

  const scrollCatIndex = scrollCat ? categories.findIndex((c) => c.value === scrollCat) : -1;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar filtros */}
      <aside
        className="w-44 flex-shrink-0 border-r overflow-y-auto p-3 flex flex-col gap-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Categorías — ahora son atajos de scroll */}
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-2">
            Categorías
          </p>
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.value).length;
            const active = activeCategories.includes(c.value);
            return (
              <label
                key={c.value}
                className="flex items-center justify-between mb-1.5 cursor-pointer group"
              >
                <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] font-medium group-hover:text-indigo-500">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleCategory(c.value)}
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
            );
          })}
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        {/* Precio */}
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-2">
            Precio
          </p>
          {priceRanges.map((r) => (
            <label key={r.value} className="flex items-center gap-1.5 mb-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={activePrices.includes(r.value)}
                onChange={() => togglePrice(r.value)}
                className="accent-indigo-600 w-3 h-3"
              />
              <span className="text-[12px] text-[var(--text-muted)] font-medium">
                {r.label}
              </span>
            </label>
          ))}
        </div>

        <hr style={{ borderColor: "var(--border)" }} />

        {/* Destacados */}
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-2">
            Destacados
          </p>
          {["bestseller", "nuevo", "descuento"].map((tag) => (
            <label key={tag} className="flex items-center gap-1.5 mb-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={activeTags.includes(tag)}
                onChange={() => toggleTag(tag)}
                className="accent-indigo-600 w-3 h-3"
              />
              <span className="text-[12px] text-[var(--text-muted)] capitalize font-medium">
                {tag}
              </span>
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

      {/* Grid principal */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Pills + barra de progreso */}
        <div
          className="flex flex-col"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3 px-4 pt-2 pb-1">
            <div className="overflow-x-auto flex-1">
              <div className="flex items-center justify-center gap-6 min-w-full w-max mx-auto">
                {categories.map((c) => {
                  const active = activeCategories.includes(c.value);
                  return (
                    <button
                      key={c.value}
                      onClick={() => {
                        if (active) {
                          setActiveCategories([]);
                        } else {
                          setActiveCategories([c.value]);
                        }
                      }}
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
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="flex-shrink-0 text-[11px] font-bold px-2 py-1.5 rounded-lg border outline-none cursor-pointer"
              style={{ background: "var(--surface-alt)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <option value="default">Relevancia</option>
              <option value="price-asc">Precio: menor</option>
              <option value="price-desc">Precio: mayor</option>
              <option value="rating">Mejor puntuados</option>
            </select>
          </div>

          {/* Barra de progreso por categoría */}
          <div className="flex h-[3px]">
            {categories.map((c, i) => {
              const isPast = i < scrollCatIndex;
              const isCurrent = c.value === scrollCat;
              return (
                <button
                  key={c.value}
                  onClick={() => scrollToCategory(c.value)}
                  className="flex-1 relative overflow-hidden"
                  style={{ background: "var(--border)" }}
                >
                  {isPast && (
                    <div className="absolute inset-0 bg-indigo-500" />
                  )}
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

        {/* Productos en scroll continuo agrupados por categoría */}
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
                <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
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
