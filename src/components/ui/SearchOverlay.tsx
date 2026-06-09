"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchStore } from "@/store/search";
import { useCartStore } from "@/store/cart";
import { useToastStore } from "@/store/toast";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Product } from "@/types";

export default function SearchOverlay() {
  const { open, setOpen } = useSearchStore();
  const add = useCartStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
        .limit(8);
      setResults((data as Product[]) ?? []);
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    const t = setTimeout(() => search(query), 220);
    return () => clearTimeout(t);
  }, [query, search]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center pt-[10vh] animate-fade-in"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl mx-4 bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#2d2d4e]">
          <span className="text-gray-400 text-xl">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 bg-transparent text-base font-medium text-[var(--text)] placeholder:text-gray-400 outline-none"
          />
          {loading && (
            <span className="text-xs text-gray-400 animate-pulse">buscando...</span>
          )}
          <kbd className="hidden sm:block text-[10px] text-gray-400 bg-gray-100 dark:bg-[#0d0d1a] border border-gray-200 dark:border-[#2d2d4e] rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[56vh] overflow-y-auto">
          {results.length === 0 && query.trim() !== "" && !loading && (
            <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
              <span className="text-3xl">🤷</span>
              <p className="text-sm font-semibold">Sin resultados para &ldquo;{query}&rdquo;</p>
            </div>
          )}
          {results.length === 0 && !query && (
            <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
              <span className="text-3xl">✨</span>
              <p className="text-sm font-semibold">Escribe para buscar productos</p>
              <p className="text-xs">salud, belleza, hogar, gadgets...</p>
            </div>
          )}
          {results.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-[#111827] border-b border-gray-50 dark:border-[#2d2d4e] transition-colors group"
            >
              <span className="text-2xl flex-shrink-0">{p.icon}</span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/productos/${p.id}`}
                  onClick={() => setOpen(false)}
                  className="font-bold text-sm text-[var(--text)] hover:text-indigo-600 block truncate"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-[var(--text-muted)] truncate">{p.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-extrabold text-indigo-600 text-sm">
                  ${Number(p.price).toLocaleString("es-CL")}
                </span>
                <button
                  onClick={() => {
                    add(p);
                    showToast(`${p.name} agregado al carrito`, "success");
                  }}
                  className="text-[11px] font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  + Agregar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-[#2d2d4e] flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            {results.length > 0 ? `${results.length} resultado${results.length > 1 ? "s" : ""}` : ""}
          </span>
          <Link
            href={query ? `/productos?q=${encodeURIComponent(query)}` : "/productos"}
            onClick={() => setOpen(false)}
            className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700"
          >
            Ver todos los productos →
          </Link>
        </div>
      </div>
    </div>
  );
}
