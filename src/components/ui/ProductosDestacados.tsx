"use client";

import Link from "next/link";
import Image from "next/image";

export type EscaparateProduct = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string | null;
  icon: string | null;
};

function clp(n: number) {
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

function discountPct(p: EscaparateProduct): number {
  if (p.original_price && p.original_price > p.price) {
    return Math.round((1 - p.price / p.original_price) * 100);
  }
  return 0;
}

// ── Tarjeta estilo AliExpress (Variante C) ──
function ProductCard({ p }: { p: EscaparateProduct }) {
  const pct = discountPct(p);
  return (
    <Link
      href={`/productos/${p.id}`}
      className="group rounded-lg overflow-hidden border bg-white hover:shadow-lg transition-all hover:-translate-y-0.5"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Imagen con cinta de descuento abajo */}
      <div className="relative w-full aspect-square bg-gray-50">
        {p.image ? (
          <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 50vw, 180px" className="object-contain p-2 group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">{p.icon ?? "🛍"}</div>
        )}
        {pct > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-black text-white py-0.5"
            style={{ background: "linear-gradient(90deg, #ff4747, #ff7847)" }}
          >
            -{pct}% DCTO
          </div>
        )}
      </div>

      {/* Cuerpo: precio + nombre */}
      <div className="p-2">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-black text-red-600">{clp(p.price)}</span>
          {p.original_price && p.original_price > p.price && (
            <span className="text-[10px] text-gray-400 line-through">{clp(p.original_price)}</span>
          )}
        </div>
        <p className="text-[11px] text-[var(--text)] leading-tight line-clamp-2 mt-1 min-h-[28px]">
          {p.name}
        </p>
      </div>
    </Link>
  );
}

export default function ProductosDestacados({ products }: { products: EscaparateProduct[] }) {
  if (!products || products.length === 0) return null;

  // Ordenar por mayor % de descuento (los más atractivos primero)
  const ordered = [...products].sort((a, b) => discountPct(b) - discountPct(a));

  return (
    <section className="py-8 md:py-14" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Encabezado */}
        <div className="text-center mb-6 md:mb-8">
          <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-1">Explora</p>
          <h2 className="text-xl md:text-3xl font-black text-[var(--text)]">Seguro que te gusta</h2>
        </div>

        {/* Grilla de productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {ordered.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>

        {/* Botón Ver todos */}
        <div className="flex justify-center mt-7">
          <Link
            href="/productos"
            className="px-7 py-3 rounded-full font-black text-sm text-white transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", boxShadow: "0 6px 20px #6366f140" }}
          >
            Ver todos los productos →
          </Link>
        </div>
      </div>
    </section>
  );
}