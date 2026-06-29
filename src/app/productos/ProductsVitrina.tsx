"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ProductCount = {
  id: string;
  category: string;
  subcategory: string | null;
};

interface Props {
  products: ProductCount[];
}

const CAT_META: Record<string, {
  label: string; icon: string; bg: string; color: string; desc: string;
  subcats: Record<string, { label: string; icon: string }>;
}> = {
  salud: {
    label: "Salud & Bienestar", icon: "🏥", bg: "#fff5f5", color: "#dc2626",
    desc: "Tensiómetros, oxímetros, masajeadores y más",
    subcats: {
      tension:    { label: "Tensiómetros Smart",      icon: "🩺" },
      oximetro:   { label: "Oxímetros",               icon: "💊" },
      masaje:     { label: "Masajeadores",             icon: "💆" },
      glucometro: { label: "Glucómetros",              icon: "🩸" },
      ecg:        { label: "Relojes & ECG",            icon: "❤️" },
    },
  },
  belleza: {
    label: "Belleza Tech", icon: "✨", bg: "#fdf4ff", color: "#a855f7",
    desc: "Masaje facial, depilación IPL y cuidado de piel",
    subcats: {
      facial: { label: "Masaje Facial Smart", icon: "💆" },
      ipl:    { label: "Depilación IPL",      icon: "🪒" },
    },
  },
  telefonos: {
    label: "Teléfonos", icon: "📱", bg: "#f0f9ff", color: "#0ea5e9",
    desc: "Smartphones, fundas inteligentes y accesorios",
    subcats: {
      smartphones:    { label: "Smartphones IA",      icon: "📱" },
      fundas:         { label: "Fundas Inteligentes",  icon: "📱" },
      "accesorios-tel": { label: "Accesorios Smart",  icon: "🔌" },
    },
  },
  wearables: {
    label: "Wearables", icon: "⌚", bg: "#eef2ff", color: "#6366f1",
    desc: "Gafas smart, smartwatches y fitness trackers",
    subcats: {
      gafas: { label: "Gafas Smart", icon: "👓" },
    },
  },
  deportes: {
    label: "Deportes", icon: "⚽", bg: "#f0fdf4", color: "#22c55e",
    desc: "Relojes deportivos y equipos con IA",
    subcats: {
      "relojes-dep": { label: "Relojes Deportivos", icon: "⌚" },
      "equipos-dep": { label: "Equipos con IA",     icon: "🏋️" },
    },
  },
  hogar: {
    label: "Hogar Inteligente", icon: "🏠", bg: "#f0fdf4", color: "#10b981",
    desc: "Robots aspiradores y dispositivos smart",
    subcats: {
      robots: { label: "Robots del Hogar", icon: "🤖" },
    },
  },
  audio: {
    label: "Audio", icon: "🎧", bg: "#fff7ed", color: "#f97316",
    desc: "Traductores en tiempo real y auriculares",
    subcats: {
      traductores: { label: "Traductores en Tiempo Real", icon: "🌍" },
    },
  },
  mascotas: {
    label: "Mascotas Tech", icon: "🐾", bg: "#f0f9ff", color: "#0ea5e9",
    desc: "Comederos automáticos y gadgets para mascotas",
    subcats: {
      comedero: { label: "Comederos Automáticos", icon: "🍽️" },
    },
  },
  gadgets: {
    label: "Gadgets", icon: "🤖", bg: "#f8fafc", color: "#64748b",
    desc: "Accesorios tech y gadgets inteligentes",
    subcats: {
      accesorios: { label: "Accesorios Tech", icon: "🔌" },
    },
  },
  electronica: {
    label: "Electrónica", icon: "🔌", bg: "#f8fafc", color: "#475569",
    desc: "Accesorios electrónicos inteligentes",
    subcats: {
      "accesorios-elec": { label: "Accesorios Smart", icon: "🔌" },
    },
  },
  oficina: {
    label: "Oficina", icon: "💼", bg: "#f5f3ff", color: "#8b5cf6",
    desc: "Gadgets de productividad y accesorios de oficina",
    subcats: {},
  },
  juguetes: {
    label: "Juguetes Tech", icon: "🧸", bg: "#fff1f2", color: "#f43f5e",
    desc: "Juguetes educativos y robots para niños",
    subcats: {},
  },
};

export default function ProductsVitrina({ products }: Props) {
  const searchParams = useSearchParams();
  const [activeCat, setActiveCat] = useState<string | null>(
    searchParams.get("category") ?? searchParams.get("cat") ?? null
  );

  // Actualizar cuando cambia la URL
  useEffect(() => {
    const cat = searchParams.get("category") ?? searchParams.get("cat") ?? null;
    setActiveCat(cat);
  }, [searchParams]);

  // Conteos por categoría y subcategoría
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const subcatCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    for (const p of products) {
      if (!p.subcategory) continue;
      if (!counts[p.category]) counts[p.category] = {};
      counts[p.category][p.subcategory] = (counts[p.category][p.subcategory] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  // Solo mostrar categorías que tienen productos
  const activeCats = Object.entries(CAT_META).filter(([key]) => (catCounts[key] ?? 0) > 0);
  const selectedCat = activeCat ? CAT_META[activeCat] : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:text-indigo-500 transition-colors">Inicio</Link>
          <span>›</span>
          {activeCat && selectedCat ? (
            <>
              <button onClick={() => setActiveCat(null)} className="hover:text-indigo-500 transition-colors">
                Productos
              </button>
              <span>›</span>
              <span style={{ color: selectedCat.color, fontWeight: 700 }}>{selectedCat.label}</span>
            </>
          ) : (
            <span style={{ color: "var(--text)", fontWeight: 700 }}>Productos</span>
          )}
        </nav>

        {/* Vista: Categorías */}
        {!activeCat && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: "var(--text)" }}>
                Todos los productos
              </h1>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                {products.length} productos · Elige una categoría para explorar
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeCats.map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setActiveCat(key)}
                  className="rounded-2xl border p-5 flex flex-col gap-3 text-left transition-all hover:-translate-y-1 hover:shadow-md group"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: meta.bg }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="text-[14px] font-black leading-tight" style={{ color: "var(--text)" }}>
                      {meta.label}
                    </h3>
                    <p className="text-[11.5px] leading-snug" style={{ color: "var(--text-muted)" }}>
                      {meta.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>
                      {catCounts[key]} producto{catCounts[key] !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[12px] font-black transition-transform group-hover:translate-x-1" style={{ color: meta.color }}>
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Vista: Subcategorías */}
        {activeCat && selectedCat && (
          <>
            {/* Back button */}
            <button
              onClick={() => setActiveCat(null)}
              className="flex items-center gap-2 text-[13px] font-bold mb-6 transition-colors hover:text-indigo-600"
              style={{ color: "var(--text-muted)" }}
            >
              ← Volver a todas las categorías
            </button>

            {/* Header categoría */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: selectedCat.bg }}
              >
                {selectedCat.icon}
              </div>
              <div>
                <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>
                  {selectedCat.label}
                </h2>
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                  {catCounts[activeCat]} productos · {Object.keys(subcatCounts[activeCat] ?? {}).length} subcategorías
                </p>
              </div>
            </div>

            {/* Grid subcategorías */}
            {Object.keys(selectedCat.subcats).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(selectedCat.subcats)
                  .filter(([slug]) => (subcatCounts[activeCat]?.[slug] ?? 0) > 0)
                  .map(([slug, subMeta]) => {
                    const count = subcatCounts[activeCat]?.[slug] ?? 0;
                    return (
                      <Link
                        key={slug}
                        href={`/${activeCat}/${slug}`}
                        className="rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md group"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: selectedCat.bg }}
                          >
                            {subMeta.icon}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold" style={{ color: "var(--text)" }}>
                              {subMeta.label}
                            </p>
                            <p className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                              {count} producto{count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <span
                          className="text-[16px] font-black flex-shrink-0 transition-transform group-hover:translate-x-1"
                          style={{ color: selectedCat.color }}
                        >
                          →
                        </span>
                      </Link>
                    );
                  })}
              </div>
            ) : (
              /* Categoría sin subcategorías definidas → ver todos los productos */
              <div className="text-center py-16">
                <p className="text-[14px] font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
                  Esta categoría no tiene subcategorías aún.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}