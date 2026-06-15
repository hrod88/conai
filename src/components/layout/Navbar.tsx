"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useSearchStore } from "@/store/search";
import { useThemeStore } from "@/store/theme";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

const searchTerms = [
  "smartwatches",
  "auriculares ANC",
  "cámaras de seguridad",
  "relojes ECG",
  "depilación IPL",
  "robots del hogar",
  "GPS para mascotas",
  "lámparas inteligentes",
  "trackers de fitness",
  "proyectores smart",
  "glucómetros",
  "parlantes inteligentes",
];

function AnimatedSearchPlaceholder() {
  const [idx, setIdx] = useState(0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setOut(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % searchTerms.length);
        setOut(false);
      }, 250);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <span
      className="text-xs text-left whitespace-nowrap overflow-hidden"
      style={{
        display: "inline-block",
        opacity: out ? 0 : 1,
        transform: out ? "translateY(-5px)" : "translateY(0px)",
        transition: "opacity 250ms, transform 250ms",
      }}
    >
      Buscar {searchTerms[idx]}...
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.count());
  const favCount = useFavoritesStore((s) => s.count());
  const { toggle: toggleSearch } = useSearchStore();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const isProductos = pathname === "/productos";
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").split(",").map((e) => e.trim());
  const isAdmin = !!user && adminEmails.includes(user.email ?? "");

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setDropdownOpen(false);
  }

  const navLinks = links.map((l) => (
    <Link
      key={l.href}
      href={l.href}
      className="px-3 py-1.5 text-sm rounded-lg transition-colors hover:text-indigo-500"
      style={{
        color: pathname === l.href ? "var(--text)" : "var(--text-muted)",
        fontWeight: pathname === l.href ? 700 : 500,
      }}
    >
      {l.label}
    </Link>
  ));

  const actions = (
    <div className="flex items-center gap-2">
      {/* Search mobile */}
      <button
        onClick={toggleSearch}
        className="md:hidden w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
        style={{ borderColor: "var(--border)", background: "var(--surface-alt)", color: "var(--text-muted)" }}
      >
        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Favorites */}
      <Link
        href="/favoritos"
        className="relative w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
        style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
        title="Favoritos"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={favCount > 0 ? "#ef4444" : "none"} stroke={favCount > 0 ? "#ef4444" : "var(--text-muted)"} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {mounted && favCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {favCount > 9 ? "9+" : favCount}
          </span>
        )}
      </Link>

      {/* Cart */}
      <Link
        href="/carrito"
        className="relative w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
        style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
        title="Carrito"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <span
          className="absolute -top-1 -right-1 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none"
          style={{ background: mounted && cartCount > 0 ? "#6366f1" : "#9ca3af" }}
        >
          {mounted ? (cartCount > 9 ? "9+" : cartCount) : 0}
        </span>
      </Link>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title="Cambiar tema"
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none"
        style={{ background: theme === "dark" ? "#6366f1" : "#d1d5db" }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
          style={{ left: "2px", transform: theme === "dark" ? "translateX(20px)" : "translateX(0px)" }}
        />
      </button>

      {/* Auth — solo desktop */}
      {user ? (
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/mis-pedidos"
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:border-indigo-400"
            style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
            title="Mis pedidos"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:border-indigo-400 text-xs font-black"
              style={{
                borderColor: dropdownOpen ? "var(--indigo-400, #818cf8)" : "var(--border)",
                background: "var(--surface-alt)",
                color: "var(--text-muted)",
              }}
              title={`Mi cuenta (${user.email?.split("@")[0]})`}
            >
              {user.email?.slice(0, 1).toUpperCase()}
            </button>
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl border shadow-lg py-1 z-50"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="px-3 py-2 text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {user.email}
                </div>
                <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
                <Link
                  href="/cuenta"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-alt)]"
                  style={{ color: "var(--text)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mi cuenta
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-alt)]"
                    style={{ color: "var(--text)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    Panel Admin
                  </Link>
                )}
                <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-alt)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          className="hidden md:flex w-9 h-9 rounded-full items-center justify-center border transition-colors hover:border-indigo-400"
          style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
          title="Iniciar sesión"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>
      )}
    </div>
  );

  return (
    <header
      className="sticky top-0 z-50 border-b transition-colors duration-300"
      style={{
        background: theme === "dark" ? "rgba(13,13,26,0.96)" : "rgba(255,255,255,0.96)",
        borderColor: "var(--border)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      {isProductos ? (
        /* ── Layout /productos: full-width, columnas alineadas al contenido ── */
        <nav className="flex items-center h-16 w-full">

          {/* Mobile: logo simple */}
          <Link href="/" className="md:hidden text-xl font-black gradient-text flex-shrink-0 px-4">
            conAI
          </Link>

          {/* Col 1 — logo (desktop) */}
          <div
            className="hidden md:flex w-36 flex-shrink-0 items-center px-4 h-full"
          >
            <Link href="/" className="text-xl font-black gradient-text">
              conAI
            </Link>
          </div>

          {/* Col 2 — buscador (desktop) */}
          <div
            className="hidden md:flex w-64 flex-shrink-0 items-center px-3 h-full"
          >
            <button
              onClick={toggleSearch}
              className="w-full flex items-center gap-2 h-8 px-3 rounded-full border transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--surface-alt)", color: "var(--text-muted)" }}
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" className="flex-shrink-0">
                <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z" clipRule="evenodd" />
              </svg>
              <AnimatedSearchPlaceholder />
            </button>
          </div>

          {/* Col 3 — links + acciones (desktop) / acciones (mobile) */}
          <div className="flex flex-1 items-center overflow-hidden">
            <div className="flex-1 md:hidden" />
            <div className="hidden md:flex items-center gap-0.5 px-4 flex-1">
              {navLinks}
            </div>
            {actions}
          </div>
        </nav>
      ) : (
        /* ── Layout normal: centrado max-w-6xl ── */
        <nav className="max-w-6xl mx-auto flex items-center h-16 px-4 md:px-6 gap-3">

          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-black gradient-text flex-shrink-0">
            conAI
          </Link>

          {/* Search desktop */}
          <button
            onClick={toggleSearch}
            className="hidden md:flex items-center gap-2 h-8 px-3 rounded-full border text-sm font-medium transition-colors flex-shrink-0"
            style={{ borderColor: "var(--border)", background: "var(--surface-alt)", color: "var(--text-muted)" }}
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z" clipRule="evenodd" />
            </svg>
            <AnimatedSearchPlaceholder />
          </button>

          {/* Links — centro */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks}
          </div>

          {/* Spacer mobile */}
          <div className="flex-1 md:hidden" />

          {actions}
        </nav>
      )}
    </header>
  );
}
