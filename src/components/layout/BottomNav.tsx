"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useSearchStore } from "@/store/search";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", icon: "🏠", label: "Inicio" },
  { href: "/productos", icon: "🛍️", label: "Tienda" },
  { icon: "🔍", label: "Buscar", action: "search" },
  { href: "/favoritos", icon: "♡", label: "Favoritos" },
  { href: "/carrito", icon: "🛒", label: "Carrito" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.count());
  const favCount = useFavoritesStore((s) => s.count());
  const { setOpen } = useSearchStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-[#1a1a2e] border-t border-gray-100 dark:border-[#2d2d4e] flex items-center justify-around h-16 px-2 safe-area-inset-bottom"
      style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
      {navItems.map((item) => {
        if (item.action === "search") {
          return (
            <button
              key="search"
              onClick={() => setOpen(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-0 flex-1"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold text-gray-400">{item.label}</span>
            </button>
          );
        }
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href!);
        const showBadge = mounted && ((item.href === "/carrito" && cartCount > 0) ||
          (item.href === "/favoritos" && favCount > 0));
        const badgeCount = item.href === "/carrito" ? cartCount : favCount;
        return (
          <Link
            key={item.href}
            href={item.href!}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 min-w-0 flex-1 relative transition-colors ${
              isActive ? "text-indigo-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl relative">
              {item.icon}
              {showBadge && (
                <span className="absolute -top-1 -right-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-semibold ${isActive ? "text-indigo-600" : "text-gray-400"}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
