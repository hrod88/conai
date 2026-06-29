import Link from "next/link";
import Image from "next/image";
import HeroDesktop from "@/components/home/HeroDesktop";
import MobileHero from "@/components/home/MobileHero";
import OfertasDelDia from "@/components/ui/OfertasDelDia";
import ProductosDestacados from "@/components/ui/ProductosDestacados";
import NewsletterSection from "@/components/home/NewsletterSection";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types";
import { Truck, RotateCcw, ShieldCheck, Lock, Bot, type LucideIcon } from "lucide-react";
import CategoriesShowcase from "@/components/home/CategoriesShowcase";
export const dynamic = "force-dynamic";

const benefits: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Truck,     title: "Envío gratis",       desc: "En compras sobre $30.000 a todo Chile. Despacho en 24-48 horas hábiles." },
  { icon: RotateCcw, title: "30 días devolución", desc: "Sin preguntas. Si no te convence, lo retiramos a domicilio sin costo." },
  { icon: Lock,      title: "Pago 100% seguro",   desc: "Transbank WebPay Plus. Tus datos nunca se almacenan en nuestros servidores." },
  { icon: Bot,       title: "Soporte IA 24/7",    desc: "Asistente inteligente disponible siempre. Equipo humano de lunes a viernes." },
];

const trustSignals: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ShieldCheck, title: "Pago protegido por Transbank", desc: "Procesamos con WebPay Plus, el estándar bancario de Chile. No guardamos los datos de tu tarjeta." },
  { icon: Truck,       title: "Despacho a todo Chile",        desc: "Enviamos con Chilexpress y Starken a cualquier región. Seguimiento de tu pedido incluido." },
  { icon: RotateCcw,   title: "30 días para devolver",        desc: "Si el producto no te convence, lo retiramos a domicilio sin costo y te devolvemos tu dinero." },
];

const tagStyles: Record<string, { label: string; color: string; bg: string }> = {
  bestseller: { label: "⭐ Bestseller", color: "#92400e", bg: "#fef3c7" },
  nuevo:      { label: "🆕 Nuevo",      color: "#065f46", bg: "#d1fae5" },
  descuento:  { label: "🔥 Descuento",  color: "#991b1b", bg: "#fee2e2" },
};

const catMeta: Record<string, { color: string; bg: string; label: string }> = {
  salud:       { color: "#3b82f6", bg: "#eff6ff", label: "Salud" },
  belleza:     { color: "#a855f7", bg: "#fdf4ff", label: "Belleza" },
  hogar:       { color: "#10b981", bg: "#f0fdf4", label: "Hogar" },
  wearables:   { color: "#6366f1", bg: "#eef2ff", label: "Wearables" },
  mascotas:    { color: "#0ea5e9", bg: "#f0f9ff", label: "Mascotas" },
  gadgets:     { color: "#10b981", bg: "#ecfdf5", label: "Gadgets" },
  audio:       { color: "#f97316", bg: "#fff7ed", label: "Audio" },
  oficina:     { color: "#8b5cf6", bg: "#f5f3ff", label: "Oficina" },
  juguetes:    { color: "#f43f5e", bg: "#fff1f2", label: "Juguetes" },
  deportes:    { color: "#22c55e", bg: "#f0fdf4", label: "Deportes" },
  electronica: { color: "#64748b", bg: "#f8fafc", label: "Electrónica" },
  telefonos:   { color: "#0ea5e9", bg: "#f0f9ff", label: "Teléfonos" },
};

export default async function HomePage() {
  const supabase = await createClient();

  type HeroProduct = Pick<Product, "id" | "name" | "price" | "icon" | "image" | "tag"> & { category: string };
  type TrendingProduct = Pick<Product, "id" | "name" | "price" | "icon" | "image" | "tag" | "category">;
  type HeroDesktopProduct = {
    id: string; name: string; price: number;
    original_price: number | null; image: string | null; icon: string | null;
  };

  const [
    { data: discountsRaw },
    { data: bestsellersRaw },
    { data: trendingRaw },
    { data: totalProductsCount },
    { data: ofertasRaw },
    { data: heroDesktopRaw },
  ] = await Promise.all([
    // Para MobileHero
    supabase.from("products").select("id, name, price, icon, image, tag, category")
      .neq("active", false).eq("tag", "descuento").order("rating", { ascending: false }).limit(4),
    // Para MobileHero fallback
    supabase.from("products").select("id, name, price, icon, image, tag, category")
      .neq("active", false).eq("tag", "bestseller").order("review_count", { ascending: false }).limit(4),
    // Para sección Más vendidos
    supabase.from("products").select("id, name, price, icon, image, tag, category")
      .neq("active", false).eq("tag", "bestseller").order("review_count", { ascending: false }),
    // Conteo total
    // Conteo total
    supabase.from("products").select("id").neq("active", false),
    // Para OfertasDelDia y ProductosDestacados
    supabase.from("products").select("id, name, price, original_price, image, icon")
      .neq("active", false).not("original_price", "is", null).order("original_price", { ascending: false }).limit(40),
    // Para HeroDesktop: los 3 productos con MAYOR descuento absoluto (original_price - price).
    // Ordenamos por original_price DESC como proxy del ahorro más visible.
    supabase.from("products")
      .select("id, name, price, original_price, image, icon")
      .neq("active", false)
      .not("original_price", "is", null)
      .order("original_price", { ascending: false })
      .limit(3),
  ]);

  const ofertasData = (ofertasRaw ?? []) as HeroDesktopProduct[];
  const escaparateData = ofertasData.slice(0, 30);

  // Productos para MobileHero
  const mobileHeroProducts = ((discountsRaw ?? []) as HeroProduct[]).length >= 2
    ? (discountsRaw as HeroProduct[]).slice(0, 2)
    : (bestsellersRaw as HeroProduct[] ?? []).slice(0, 2);

  // Productos para HeroDesktop (los 3 con más descuento)
  const heroDesktopProducts = (heroDesktopRaw ?? []) as HeroDesktopProduct[];

  // Más vendidos por categoría
  const allCats = ["salud", "belleza", "hogar", "wearables", "mascotas", "gadgets", "audio", "oficina", "juguetes", "deportes", "electronica", "telefonos"] as const;
  const trendingAll = (trendingRaw ?? []) as TrendingProduct[];
  const seen = new Set<string>();
  const trendingProducts: TrendingProduct[] = [];
  for (const cat of allCats) {
    const match = trendingAll.find((p) => p.category === cat && !seen.has(p.id));
    if (match) { seen.add(match.id); trendingProducts.push(match); }
  }

  const totalProducts = totalProductsCount?.length ?? 0;

  return (
    <>
      {/* Hero SOLO DESKTOP: franja cupones + frase rotativa + 3 productos + caja */}
      <HeroDesktop products={heroDesktopProducts} />

      {/* Hero SOLO MÓVIL */}
      <MobileHero products={mobileHeroProducts} />

      {/* ── Ofertas de hoy ── */}
      <OfertasDelDia products={ofertasData} />

      {/* ── Escaparate ── */}
      <ProductosDestacados products={escaparateData} />

      {/* ── Más vendidos ── */}
      <section className="py-8 md:py-16" style={{ background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-4 md:mb-8">
            <div>
              <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-1">Tendencias</p>
              <h2 className="text-lg md:text-3xl font-black text-[var(--text)]">Los más vendidos</h2>
            </div>
            <Link href="/productos" className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
              Ver catálogo completo →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 md:hidden -mx-4 px-4" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
            {trendingProducts.map((p) => {
              const t = tagStyles[p.tag ?? "bestseller"];
              const meta = catMeta[p.category] ?? { color: "#6366f1", bg: "#eef2ff", label: p.category };
              return (
                <Link key={`m-${p.id}`} href={`/productos/${p.id}`}
                  className="flex-shrink-0 w-36 rounded-2xl border p-3 flex flex-col gap-1.5 active:scale-95 transition-all"
                  style={{ background: meta.bg, borderColor: `${meta.color}25` }}>
                  <div className="relative">
                    {p.image ? (
                      <div className="relative w-full h-20 rounded-xl bg-white/60 overflow-hidden">
                        <Image src={p.image} alt={p.name} fill sizes="144px" className="object-contain p-1" />
                      </div>
                    ) : (
                      <div className="w-full h-20 rounded-xl bg-white/60 flex items-center justify-center">
                        <span className="text-3xl">{p.icon}</span>
                      </div>
                    )}
                    {t && <span className="absolute top-1 left-1 text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: t.bg, color: t.color }}>{t.label}</span>}
                  </div>
                  <p className="font-bold text-[11px] text-gray-700 leading-tight line-clamp-2 flex-1">{p.name}</p>
                  <p className="text-[9px] text-gray-400 font-medium">{meta.label}</p>
                  <p className="font-black text-sm" style={{ color: meta.color }}>${Number(p.price).toLocaleString("es-CL")}</p>
                </Link>
              );
            })}
          </div>
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-3">
            {trendingProducts.map((p) => {
              const t = tagStyles[p.tag ?? "bestseller"];
              const meta = catMeta[p.category] ?? { color: "#6366f1", bg: "#eef2ff", label: p.category };
              return (
                <Link key={p.id} href={`/productos/${p.id}`}
                  className="group rounded-2xl border p-4 flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ background: meta.bg, borderColor: `${meta.color}20` }}>
                  <div className="relative mb-1">
                    {p.image ? (
                      <div className="relative w-full h-24 rounded-lg bg-gray-50 overflow-hidden">
                        <Image src={p.image} alt={p.name} fill sizes="(max-width: 1024px) 33vw, 180px" className="object-contain p-1" />
                      </div>
                    ) : (
                      <div className="w-full h-24 rounded-lg bg-gray-50 flex items-center justify-center">
                        <span className="text-3xl">{p.icon}</span>
                      </div>
                    )}
                    {t && <span className="absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: t.bg, color: t.color }}>{t.label}</span>}
                  </div>
                  <p className="font-bold text-[12px] text-gray-700 leading-tight">{p.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{meta.label}</p>
                  <p className="font-black text-sm mt-auto" style={{ color: meta.color }}>${Number(p.price).toLocaleString("es-CL")}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Por qué conAI ── */}
      <section className="py-8 md:py-16 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-5 md:mb-10">
          <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-2">Nuestro compromiso</p>
          <h2 className="text-xl md:text-3xl font-black text-[var(--text)]">¿Por qué conAI?</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl p-3 md:p-5 border flex flex-col gap-2 md:gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-500/10">
                <b.icon size={24} strokeWidth={2} className="text-indigo-500" />
              </span>
              <p className="font-black text-[var(--text)] text-sm">{b.title}</p>
              <p className="text-[11px] md:text-sm text-[var(--text-muted)] leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Compra con confianza ── */}
      <section className="py-8 md:py-16" style={{ background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-5 md:mb-10">
            <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-2">Compra con seguridad</p>
            <h2 className="text-xl md:text-3xl font-black text-[var(--text)]">Compra con confianza</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 md:hidden -mx-4 px-4" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
            {trustSignals.map((s) => (
              <div key={s.title} className="flex-shrink-0 w-72 rounded-2xl border p-4 flex flex-col gap-3"
                style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10">
                  <s.icon size={24} strokeWidth={2} className="text-indigo-500" />
                </span>
                <p className="text-sm font-bold text-[var(--text)]">{s.title}</p>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed flex-1">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="hidden md:grid grid-cols-3 gap-5">
            {trustSignals.map((s) => (
              <div key={s.title} className="rounded-2xl border p-6 flex flex-col gap-3"
                style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10">
                  <s.icon size={26} strokeWidth={2} className="text-indigo-500" />
                </span>
                <p className="text-base font-bold text-[var(--text)]">{s.title}</p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-10 md:py-14 px-6" style={{ background: "linear-gradient(135deg, #6366f1, #0ea5e9)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4 md:gap-6 text-center text-white">
          {[
            { n: `${totalProducts}`, label: "Productos disponibles" },
            { n: "30 días", label: "Para devolver" },
            { n: "24/7", label: "Soporte con IA" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl md:text-4xl font-black">{s.n}</p>
              <p className="text-xs md:text-sm font-semibold opacity-75 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
{/* ── FAQ ── */}
      {/* ── Newsletter ── */}
      <NewsletterSection />
    </>
  );
}