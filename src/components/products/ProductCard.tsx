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
  nuevo: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  descuento: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
};

const tagLabel: Record<string, string> = {
  bestseller: "⭐ Bestseller",
  nuevo: "🆕 Nuevo",
  descuento: "🔥 Descuento",
};

export default function ProductCard({ product }: Props) {
  const add = useCartStore((s) => s.add);
  const { toggle, isFavorite } = useFavoritesStore();
  const showToast = useToastStore((s) => s.show);
  const fav = isFavorite(product.id);

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
        {product.image ? (
          <div className="w-full h-36 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center mb-1">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-2"
            />
          </div>
        ) : (
          <div className="w-full h-36 rounded-lg bg-gray-50 flex items-center justify-center mb-1">
            <span className="text-5xl">{product.icon}</span>
          </div>
        )}
        {product.tag && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagStyles[product.tag]}`}>
            {tagLabel[product.tag]}
          </span>
        )}
      </div>

      {/* Name */}
      <p className="font-bold text-[13px] text-[var(--text)] leading-tight">
        {product.name}
      </p>

      {/* Desc */}
      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-snug flex-1">
        {product.description}
      </p>

      {/* Rating */}
      {product.rating && (
        <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <span className="text-amber-400">★</span>
          <span className="font-semibold">{product.rating.toFixed(1)}</span>
          {product.review_count && (
            <span className="text-[10px]">({product.review_count})</span>
          )}
        </div>
      )}

      {/* Price */}
      <div className="mt-auto pt-1.5 border-t" style={{ borderColor: "var(--border)" }}>
        {product.tag === "descuento" && (
          <span className="text-[11px] text-[var(--text-muted)] line-through mr-1.5">
            ${Math.round(product.price * 1.2).toLocaleString("es-CL")}
          </span>
        )}
        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">
          ${Number(product.price).toLocaleString("es-CL")}
        </span>
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
