import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

const CAT_META: Record<string, {
  label: string; icon: string; bg: string; color: string;
  subcats: Record<string, { label: string; icon: string }>;
}> = {
  salud: {
    label: "Salud & Bienestar", icon: "🏥", bg: "#fff5f5", color: "#dc2626",
    subcats: {
      tension:    { label: "Tensiómetros Smart",        icon: "🩺" },
      oximetro:   { label: "Oxímetros",                 icon: "💊" },
      masaje:     { label: "Masajeadores",               icon: "💆" },
      glucometro: { label: "Glucómetros",                icon: "🩸" },
      ecg:        { label: "Relojes & ECG",              icon: "❤️" },
    },
  },
  belleza: {
    label: "Belleza Tech", icon: "✨", bg: "#fdf4ff", color: "#a855f7",
    subcats: {
      facial: { label: "Masaje Facial Smart", icon: "💆" },
      ipl:    { label: "Depilación IPL",      icon: "🪒" },
    },
  },
  telefonos: {
    label: "Teléfonos", icon: "📱", bg: "#f0f9ff", color: "#0ea5e9",
    subcats: {
      smartphones:      { label: "Smartphones IA",     icon: "📱" },
      fundas:           { label: "Fundas Inteligentes", icon: "📱" },
      "accesorios-tel": { label: "Accesorios Smart",   icon: "🔌" },
    },
  },
  wearables: {
    label: "Wearables", icon: "⌚", bg: "#eef2ff", color: "#6366f1",
    subcats: { gafas: { label: "Gafas Smart", icon: "👓" } },
  },
  deportes: {
    label: "Deportes", icon: "⚽", bg: "#f0fdf4", color: "#22c55e",
    subcats: {
      "relojes-dep": { label: "Relojes Deportivos", icon: "⌚" },
      "equipos-dep": { label: "Equipos con IA",     icon: "🏋️" },
    },
  },
  hogar: {
    label: "Hogar Inteligente", icon: "🏠", bg: "#f0fdf4", color: "#10b981",
    subcats: { robots: { label: "Robots del Hogar", icon: "🤖" } },
  },
  audio: {
    label: "Audio", icon: "🎧", bg: "#fff7ed", color: "#f97316",
    subcats: { traductores: { label: "Traductores en Tiempo Real", icon: "🌍" } },
  },
  mascotas: {
    label: "Mascotas Tech", icon: "🐾", bg: "#f0f9ff", color: "#0ea5e9",
    subcats: { comedero: { label: "Comederos Automáticos", icon: "🍽️" } },
  },
  gadgets: {
    label: "Gadgets", icon: "🤖", bg: "#f8fafc", color: "#64748b",
    subcats: { accesorios: { label: "Accesorios Tech", icon: "🔌" } },
  },
  electronica: {
    label: "Electrónica", icon: "🔌", bg: "#f8fafc", color: "#475569",
    subcats: { "accesorios-elec": { label: "Accesorios Smart", icon: "🔌" } },
  },
  oficina: {
    label: "Oficina", icon: "💼", bg: "#f5f3ff", color: "#8b5cf6",
    subcats: {},
  },
  juguetes: {
    label: "Juguetes Tech", icon: "🧸", bg: "#fff1f2", color: "#f43f5e",
    subcats: {},
  },
};

export const dynamic = "force-dynamic";

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const catMeta = CAT_META[categoria];
  if (!catMeta) notFound();

  const supabase = await createClient();

  // Conteos por subcategoría
  const { data: products } = await supabase
    .from("products")
    .select("id, subcategory")
    .neq("active", false)
    .eq("category", categoria);

  const subcatCounts: Record<string, number> = {};
  for (const p of products ?? []) {
    if (p.subcategory) {
      subcatCounts[p.subcategory] = (subcatCounts[p.subcategory] ?? 0) + 1;
    }
  }

  const totalProducts = products?.length ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:text-indigo-500 transition-colors">Inicio</Link>
          <span>›</span>
          <Link href="/productos" className="hover:text-indigo-500 transition-colors">Productos</Link>
          <span>›</span>
          <span style={{ color: catMeta.color, fontWeight: 700 }}>{catMeta.label}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: catMeta.bg }}>
            {catMeta.icon}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black" style={{ color: "var(--text)" }}>
              {catMeta.label}
            </h1>
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              {totalProducts} productos · Elige una subcategoría
            </p>
          </div>
        </div>

        {/* Grid subcategorías */}
        {Object.keys(catMeta.subcats).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(catMeta.subcats)
              .filter(([slug]) => (subcatCounts[slug] ?? 0) > 0)
              .map(([slug, sub]) => {
                const count = subcatCounts[slug] ?? 0;
                return (
                  <Link
                    key={slug}
                    href={`/${categoria}/${slug}`}
                    className="rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md group"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: catMeta.bg }}>
                        {sub.icon}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold" style={{ color: "var(--text)" }}>
                          {sub.label}
                        </p>
                        <p className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                          {count} producto{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-[16px] font-black flex-shrink-0 transition-transform group-hover:translate-x-1"
                      style={{ color: catMeta.color }}>
                      →
                    </span>
                  </Link>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="font-bold text-[15px]" style={{ color: "var(--text)" }}>
              Sin productos en esta categoría aún
            </p>
            <Link href="/productos" className="text-indigo-500 font-bold text-[13px] mt-3 inline-block hover:text-indigo-700">
              ← Volver a productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}