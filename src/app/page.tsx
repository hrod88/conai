import Link from "next/link";
import HeroSlider from "@/components/home/HeroSlider";
import NewsletterSection from "@/components/home/NewsletterSection";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

const categories = [
  { value: "salud", label: "Salud & Wearables", icon: "❤️", desc: "Smartwatches, anillos y sensores", count: 30, from: "#3b82f6", to: "#6366f1" },
  { value: "belleza", label: "Belleza Tech", icon: "✨", desc: "Dispositivos faciales con IA", count: 24, from: "#a855f7", to: "#ec4899" },
  { value: "hogar", label: "Hogar Inteligente", icon: "🏠", desc: "Robots, cámaras y termostatos", count: 32, from: "#3b82f6", to: "#10b981" },
  { value: "wearables", label: "Wearables", icon: "⌚", desc: "Relojes, gafas y accesorios IA", count: 18, from: "#f59e0b", to: "#ef4444" },
  { value: "mascotas", label: "Mascotas Tech", icon: "🐾", desc: "GPS, cámaras y alimentadores", count: 15, from: "#10b981", to: "#0ea5e9" },
  { value: "gadgets", label: "Gadgets", icon: "🤖", desc: "Drones, impresoras 3D y más", count: 40, from: "#10b981", to: "#0ea5e9" },
  { value: "audio", label: "Audio Inteligente", icon: "🎧", desc: "Auriculares, parlantes y altavoces IA", count: 0, from: "#f97316", to: "#eab308" },
  { value: "oficina", label: "Oficina Tech", icon: "💼", desc: "Teclados, monitores y accesorios IA", count: 0, from: "#8b5cf6", to: "#06b6d4" },
  { value: "juguetes", label: "Juguetes & Bebés", icon: "🧸", desc: "Juguetes educativos y tecnológicos", count: 0, from: "#f43f5e", to: "#fb923c" },
  { value: "deportes", label: "Deportes & Outdoor", icon: "⚽", desc: "Accesorios deportivos con tecnología IA", count: 0, from: "#22c55e", to: "#0ea5e9" },
  { value: "electronica", label: "Electrónica", icon: "🔌", desc: "Gadgets y electrónica de consumo", count: 0, from: "#64748b", to: "#6366f1" },
  { value: "telefonos", label: "Teléfonos & Accesorios", icon: "📱", desc: "Accesorios y periféricos para smartphones", count: 0, from: "#0ea5e9", to: "#6366f1" },
];

const benefits = [
  { icon: "🚚", title: "Envío gratis", desc: "En compras sobre $30.000 a todo Chile. Despacho en 24-48 horas hábiles." },
  { icon: "↩️", title: "30 días devolución", desc: "Sin preguntas. Si no te convence, lo retiramos a domicilio sin costo." },
  { icon: "🔒", title: "Pago 100% seguro", desc: "Transbank WebPay Plus. Tus datos nunca se almacenan en nuestros servidores." },
  { icon: "🤖", title: "Soporte IA 24/7", desc: "Asistente inteligente disponible siempre. Equipo humano de lunes a viernes." },
];

const testimonials = [
  { name: "Valentina R.", city: "Santiago", rating: 5, text: "Llegó en 2 días y el producto es increíble. El smartwatch superó todas mis expectativas, lo recomiendo 100%.", avatar: "V" },
  { name: "Carlos M.", city: "Viña del Mar", rating: 5, text: "Compré el robot aspirador y transformó mi rutina. Excelente atención al cliente cuando tuve dudas de instalación.", avatar: "C" },
  { name: "Daniela F.", city: "Concepción", rating: 5, text: "La máscara LED llegó perfectamente embalada. Ya noto resultados después de 2 semanas de uso consistente.", avatar: "D" },
];

const tagStyles: Record<string, { label: string; color: string; bg: string }> = {
  bestseller: { label: "⭐ Bestseller", color: "#92400e", bg: "#fef3c7" },
  nuevo: { label: "🆕 Nuevo", color: "#065f46", bg: "#d1fae5" },
  descuento: { label: "🔥 Descuento", color: "#991b1b", bg: "#fee2e2" },
};

const catMeta: Record<string, { color: string; bg: string; label: string }> = {
  salud:     { color: "#3b82f6", bg: "#eff6ff", label: "Salud" },
  belleza:   { color: "#a855f7", bg: "#fdf4ff", label: "Belleza" },
  hogar:     { color: "#10b981", bg: "#f0fdf4", label: "Hogar" },
  wearables: { color: "#6366f1", bg: "#eef2ff", label: "Wearables" },
  mascotas:  { color: "#0ea5e9", bg: "#f0f9ff", label: "Mascotas" },
  gadgets:   { color: "#10b981", bg: "#ecfdf5", label: "Gadgets" },
  audio:      { color: "#f97316", bg: "#fff7ed", label: "Audio" },
  oficina:    { color: "#8b5cf6", bg: "#f5f3ff", label: "Oficina" },
  juguetes:   { color: "#f43f5e", bg: "#fff1f2", label: "Juguetes" },
  deportes:   { color: "#22c55e", bg: "#f0fdf4", label: "Deportes" },
  electronica:{ color: "#64748b", bg: "#f8fafc", label: "Electrónica" },
  telefonos:  { color: "#0ea5e9", bg: "#f0f9ff", label: "Teléfonos" },
};

export default async function HomePage() {
  const supabase = await createClient();
  const heroCats = ["salud", "belleza", "hogar", "gadgets"] as const;
  const featured: Record<string, Pick<Product, "id" | "name" | "price" | "icon" | "tag">[]> = {};

  for (const cat of heroCats) {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, icon, tag")
      .eq("category", cat)
      .order("rating", { ascending: false })
      .limit(4);
    featured[cat] = (data ?? []) as Pick<Product, "id" | "name" | "price" | "icon" | "tag">[];
  }

  const allCats = ["salud", "belleza", "hogar", "wearables", "mascotas", "gadgets", "audio", "oficina", "juguetes", "deportes", "electronica", "telefonos"] as const;
  type TrendingProduct = Pick<Product, "id" | "name" | "price" | "icon" | "tag" | "category">;
  const trendingProducts: TrendingProduct[] = [];
  for (const cat of allCats) {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, icon, tag, category")
      .eq("category", cat)
      .eq("tag", "bestseller")
      .order("review_count", { ascending: false })
      .limit(1);
    if (data?.[0]) trendingProducts.push(data[0] as TrendingProduct);
  }

  return (
    <>
      <HeroSlider featured={featured} />

      {/* ── Categorías ──────────────────────────── */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-2">Explora</p>
          <h2 className="text-3xl font-black text-[var(--text)]">Categorías</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={`/productos?cat=${cat.value}`}
              className="group relative rounded-2xl p-5 border transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {/* Gradiente de fondo hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}
              />
              <div className="relative flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: `${cat.from}18`, color: cat.from }}>
                    {cat.count} productos
                  </span>
                </div>
                <div>
                  <p className="font-black text-[var(--text)] text-sm">{cat.label}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{cat.desc}</p>
                </div>
                <span
                  className="text-[11px] font-bold group-hover:gap-2 flex items-center gap-1 transition-all"
                  style={{ color: cat.from }}
                >
                  Ver categoría →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trending ────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-1">Esta semana</p>
              <h2 className="text-3xl font-black text-[var(--text)]">Más vendidos</h2>
            </div>
            <Link href="/productos" className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {trendingProducts.map((p) => {
              const t = tagStyles[p.tag ?? "bestseller"];
              const meta = catMeta[p.category];
              return (
                <Link
                  key={p.id}
                  href={`/productos/${p.id}`}
                  className="group rounded-2xl border p-4 flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ background: meta.bg, borderColor: `${meta.color}20` }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-3xl">{p.icon}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: t.bg, color: t.color }}>
                      {t.label}
                    </span>
                  </div>
                  <p className="font-bold text-[12px] text-gray-700 leading-tight">{p.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{meta.label}</p>
                  <p className="font-black text-sm mt-auto" style={{ color: meta.color }}>
                    ${Number(p.price).toLocaleString("es-CL")}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Por qué conAI ───────────────────────── */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-2">Nuestra promesa</p>
          <h2 className="text-3xl font-black text-[var(--text)]">¿Por qué conAI?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b) => (
            <div key={b.title}
              className="rounded-2xl p-5 border flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <span className="text-3xl">{b.icon}</span>
              <p className="font-black text-[var(--text)]">{b.title}</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonios ─────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-2">Clientes reales</p>
            <h2 className="text-3xl font-black text-[var(--text)]">Lo que dicen de nosotros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name}
                className="rounded-2xl border p-5 flex flex-col gap-4"
                style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-sky-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text)]">{t.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{t.city} · ✓ Compra verificada</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────── */}
      <section
        className="py-14 px-6"
        style={{ background: "linear-gradient(135deg, #6366f1, #0ea5e9)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { n: "180+", label: "Productos" },
            { n: "12K+", label: "Clientes" },
            { n: "4.8★", label: "Calificación" },
            { n: "30", label: "Días garantía" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-black">{s.n}</p>
              <p className="text-sm font-semibold opacity-75 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────── */}
      <NewsletterSection />
    </>
  );
}
