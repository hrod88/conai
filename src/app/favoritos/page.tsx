"use client";

import { useFavoritesStore } from "@/store/favorites";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";

export default function FavoritosPage() {
  const { items, toggle } = useFavoritesStore();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--text)]">
            Mis favoritos ❤️
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {items.length === 0
              ? "Aún no tienes productos guardados"
              : `${items.length} producto${items.length > 1 ? "s" : ""} guardado${items.length > 1 ? "s" : ""}`}
          </p>
        </div>
        {items.length > 0 && (
          <Link
            href="/productos"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Seguir explorando →
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <span className="text-7xl">🤍</span>
          <div>
            <p className="text-xl font-black text-[var(--text)]">Sin favoritos aún</p>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
              Agrega productos a favoritos con el ícono de corazón en cada tarjeta
            </p>
          </div>
          <Link
            href="/productos"
            className="px-7 py-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200 text-sm"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
