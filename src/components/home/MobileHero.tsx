"use client";

// MobileHero.tsx
// ──────────────────────────────────────────────────────────────────────────
// Hero comercial SOLO MÓVIL para la home. Reemplaza visualmente al HeroSlider
// grande en pantallas chicas (md:hidden). En desktop sigue mandando HeroSlider.
//
// Componente "tonto": recibe productos ya consultados (no hace queries propias).
// Eso evita tocar la lógica de Supabase del page.tsx y aprovecha lo que ya hay.
//
// Estructura:
//   1) Tarjeta-hero con título + 2 productos reales con precios.
//   2) Fila de atajos de utilidad (NO categorías): envío, cupones, más vendidos,
//      nuevos y "categorías" como acceso al catálogo.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import Image from "next/image";
import { Truck, Gift, Flame, Sparkles, LayoutGrid } from "lucide-react";

type HeroMiniProduct = {
  id: string;
  name: string;
  price: number;
  // image e icon son opcionales: en HeroProduct (de Supabase) están con ?
  // así que aquí también, para que TypeScript acepte el paso sin conversiones.
  icon?: string | null;
  image?: string | null;
};

interface MobileHeroProps {
  /** Productos a destacar dentro del hero (idealmente 2 con descuento). */
  products: HeroMiniProduct[];
}

export default function MobileHero({ products }: MobileHeroProps) {
  // Tomamos como mucho 2 productos. Si vienen menos, el hero igual se ve bien.
  const featured = (products ?? []).slice(0, 2);

  return (
    <section className="md:hidden">
      {/* ── Hero comercial: título + 2 productos con precios ────────────── */}
      <div
        className="mx-3 mt-3 rounded-2xl px-4 pt-4 pb-3 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)" }}
      >
        {/* Burbuja decorativa de fondo, sin contenido. Aria-hidden para a11y. */}
        <span
          aria-hidden
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
          style={{ background: "rgba(255,255,255,.08)" }}
        />

        <p className="text-[10px] font-black tracking-[1.5px] opacity-90 relative z-10">
          ⚡ FLASH SALE
        </p>
        <h2 className="text-[20px] font-black leading-tight mt-0.5 relative z-10">
          Hasta -26% OFF
        </h2>
        <p className="text-[11px] opacity-90 mt-0.5 mb-3 relative z-10">
          en tecnología y wearables seleccionados
        </p>

        {/* Dos productos lado a lado, fondo blanco, precios bien legibles. */}
        <div className="grid grid-cols-2 gap-2 relative z-10">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/productos/${p.id}`}
              className="bg-white rounded-xl p-2 flex flex-col gap-1.5 active:scale-95 transition-transform"
              aria-label={p.name}
            >
              <div className="relative w-full aspect-[1.3/1] rounded-lg bg-gray-50 overflow-hidden">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="160px"
                    className="object-contain p-1.5"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">
                    {p.icon ?? "🛍️"}
                  </span>
                )}
                {/* Descuento visible. Texto fijo "-26%" — si quieres mostrar el
                    descuento real por producto, hay que pasar original_price. */}
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">
                  -26%
                </span>
              </div>
              <p className="text-[10px] font-semibold text-gray-700 leading-tight line-clamp-2 min-h-[24px]">
                {p.name}
              </p>
              <p className="text-[13px] font-black text-indigo-600">
                ${Number(p.price).toLocaleString("es-CL")}
              </p>
            </Link>
          ))}
        </div>

        <Link
          href="/productos"
          className="absolute right-3 bottom-2 bg-white/95 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-full z-10"
        >
          Ver más ›
        </Link>
      </div>

      {/* ── Atajos de utilidad (NO categorías) ──────────────────────────── */}
      {/*  Igual que AliExpress: estos íconos son funcionalidades / vistas
           especiales, no la lista de categorías. La última lleva al
           catálogo completo donde sí están todas las categorías. */}
      <div className="mt-3 grid grid-cols-5 px-2 gap-1">
        <Link href="/productos" className="flex flex-col items-center gap-1.5 py-2 active:scale-95 transition-transform">
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}
          >
            <Truck size={20} strokeWidth={2} />
          </span>
          <span className="text-[9.5px] font-semibold text-[var(--text)] text-center leading-tight">Envío gratis</span>
        </Link>

        <Link href="/productos?descuento=1" className="flex flex-col items-center gap-1.5 py-2 active:scale-95 transition-transform">
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white relative"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
          >
            <Gift size={20} strokeWidth={2} />
            <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[8.5px] font-black px-1.5 rounded-full leading-tight">3</span>
          </span>
          <span className="text-[9.5px] font-semibold text-[var(--text)] text-center leading-tight">Cupones</span>
        </Link>

        <Link href="/productos?tag=bestseller" className="flex flex-col items-center gap-1.5 py-2 active:scale-95 transition-transform">
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #ef4444, #f87171)" }}
          >
            <Flame size={20} strokeWidth={2} />
          </span>
          <span className="text-[9.5px] font-semibold text-[var(--text)] text-center leading-tight">Más vendidos</span>
        </Link>

        <Link href="/productos?tag=nuevo" className="flex flex-col items-center gap-1.5 py-2 active:scale-95 transition-transform">
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #a855f7, #c084fc)" }}
          >
            <Sparkles size={20} strokeWidth={2} />
          </span>
          <span className="text-[9.5px] font-semibold text-[var(--text)] text-center leading-tight">Nuevos</span>
        </Link>

        <Link href="/productos" className="flex flex-col items-center gap-1.5 py-2 active:scale-95 transition-transform">
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <LayoutGrid size={20} strokeWidth={2} />
          </span>
          <span className="text-[9.5px] font-semibold text-[var(--text)] text-center leading-tight">Categorías</span>
        </Link>
      </div>
    </section>
  );
}