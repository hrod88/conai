"use client";

import type { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useToastStore } from "@/store/toast";
import Link from "next/link";

interface Props {
  product: Product;
}

const tagStyles: Record<string, string> = {
  bestseller: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  nuevo:      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  descuento:  "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
  oferta:     "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
  destacado:  "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700",
};

const tagLabel: Record<string, string> = {
  bestseller: "⭐ Más vendidos",
  nuevo:      "🆕 Recién llegado",
  descuento:  "💲 Descuento",
  oferta:     "🔥 Oferta",
  destacado:  "✨ Destacado",
};

export default function ProductCard({ product }: Props) {
  const add = useCartStore((s) => s.add);
  const { toggle, isFavorite } = useFavoritesStore();
  const showToast = useToastStore((s) => s.show);
  const fav = isFavorite(product.id);

  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / (product.original_price as number)) * 100)
    : 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(product);
    showToast(`${product.name} agregado al carrito 🛒`, "success");
  }

  function handleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
    if (!fav) showToast(`${product.name} guardado en favoritos ❤️`, "info");
  }

  return (
    <Link
      href={`/productos/${product.id}`}
      className="group relative flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Favorite button */}
      <button
        onClick={handleFav}
        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 opacity-0 group-hover:opacity-100 hover:scale-110"
        style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        title={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <span className="text-sm">{fav ? "❤️" : "🤍"}</span>
      </button>

      {/* Image / Icon + tag */}
      <div className="relative">
        {product.tag && (
          <span className={`absolute top-1.5 left-1.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagStyles[product.tag]}`}>
            {tagLabel[product.tag]}
          </span>
        )}
        <div
          className="w-full h-[180px] flex items-center justify-center rounded-xl overflow-hidden"
          style={{ background: "var(--surface-alt)" }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[162px] max-w-[92%] w-auto object-contain"
            />
          ) : (
            <span className="text-5xl">{product.icon}</span>
          )}
        </div>
      </div>

      {/* Name — 2 líneas, altura reservada para que las tarjetas queden parejas */}
      <p
        className="font-bold text-[12.5px] text-[var(--text)] leading-[1.25] line-clamp-2 min-h-[2.5em]"
        title={product.name}
      >
        {product.name}
      </p>

      {/* Rating */}
      {(product.rating ?? 0) > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <span className="text-amber-400">★</span>
          <span className="font-semibold">{(product.rating ?? 0).toFixed(1)}</span>
          {(product.review_count ?? 0) > 0 && (
            <span className="text-[10px]">({product.review_count})</span>
          )}
        </div>
      )}

      {/* Price — precio tachado arriba, y abajo precio actual + descuento JUNTOS (nunca saltan) */}
      <div className="mt-auto pt-1.5 border-t" style={{ borderColor: "var(--border)" }}>
        {hasDiscount && (
          <span className="block text-[11px] text-[var(--text-muted)] line-through leading-none mb-0.5">
            ${Number(product.original_price).toLocaleString("es-CL")}
          </span>
        )}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base leading-none">
            ${Number(product.price).toLocaleString("es-CL")}
          </span>
          {hasDiscount && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md leading-none">
              -{discountPct}%
            </span>
          )}
        </div>
      </div>

      {/* Button full-width */}
      <button
        onClick={handleAdd}
        className="w-full text-[12px] font-bold bg-gradient-to-r from-indigo-500 to-sky-400 text-white py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all"
      >
        + Agregar
      </button>
    </Link>
  );
}
