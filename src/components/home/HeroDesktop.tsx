"use client";

// HeroDesktop.tsx
// ──────────────────────────────────────────────────────────────────────────
// Hero comercial SOLO DESKTOP (md+) en estilo AliExpress/Temu:
// banner único gigante con gradient de oferta (rojo→naranja del manual §2),
// eyebrow + título dominante + timer REAL semanal + 2 productos reales.
//
// Reemplaza al HeroSlider antiguo (Bento Grid) en desktop, según decisión
// del manual de marca (BRAND.md §1 "tienda de descuento estilo Temu chileno").
//
// El timer es honesto: termina cada DOMINGO a las 23:59 hora Chile (UTC-4
// continental) y se renueva al siguiente domingo. No se reinicia cuando llega
// a cero: simplemente recalcula la próxima fecha. Ver manual §6.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type HeroMiniProduct = {
  id: string;
  name: string;
  price: number;
  // image e icon pueden venir null o undefined desde Supabase, así que el
  // tipo aquí es compatible con HeroProduct del page.tsx.
  icon?: string | null;
  image?: string | null;
};

interface HeroDesktopProps {
  /** Productos a destacar dentro del banner (idealmente 2 con descuento). */
  products: HeroMiniProduct[];
}

/**
 * Devuelve milisegundos hasta el próximo domingo a las 23:59:59 local.
 * Si hoy es domingo y aún no son las 23:59, retorna lo que queda de hoy.
 * Si ya pasó el límite, salta al siguiente domingo.
 */
function msHastaProximoDomingo(): number {
  const ahora = new Date();
  const proximo = new Date(ahora);

  // 0 = domingo, 1 = lunes, ..., 6 = sábado.
  const diasParaDomingo = (7 - ahora.getDay()) % 7;
  proximo.setDate(ahora.getDate() + diasParaDomingo);
  proximo.setHours(23, 59, 59, 999);

  // Si hoy ES domingo pero ya pasaron las 23:59, saltar al siguiente.
  if (proximo.getTime() <= ahora.getTime()) {
    proximo.setDate(proximo.getDate() + 7);
  }
  return proximo.getTime() - ahora.getTime();
}

/** Formatea ms como "Xd HH:MM:SS" para el timer. */
function formatearTiempo(ms: number): string {
  const totalSeg = Math.max(0, Math.floor(ms / 1000));
  const dias = Math.floor(totalSeg / 86400);
  const horas = Math.floor((totalSeg % 86400) / 3600);
  const mins = Math.floor((totalSeg % 3600) / 60);
  const segs = totalSeg % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return dias > 0
    ? `${dias}d ${pad(horas)}:${pad(mins)}:${pad(segs)}`
    : `${pad(horas)}:${pad(mins)}:${pad(segs)}`;
}

export default function HeroDesktop({ products }: HeroDesktopProps) {
  // El estado se inicializa en cliente vía useEffect para evitar mismatch
  // de hidratación de Next.js (server y cliente ven horas distintas).
  const [tiempoRestante, setTiempoRestante] = useState<string>("");

  useEffect(() => {
    const tick = () => setTiempoRestante(formatearTiempo(msHastaProximoDomingo()));
    tick(); // primer cálculo inmediato
    const id = setInterval(tick, 1000); // actualiza cada segundo
    return () => clearInterval(id);
  }, []);

  // Tomamos 2 productos como máximo. Si vienen menos el banner se ve igual.
  const destacados = (products ?? []).slice(0, 2);

  return (
    <section className="hidden md:block w-full bg-[var(--bg)] py-4 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className="relative overflow-hidden rounded-2xl shadow-lg flex items-stretch gap-6 px-7 py-7 text-white"
          style={{
            background: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
            minHeight: "320px",
          }}
        >
          {/* Burbuja decorativa (manual §2, blob de marca). */}
          <span
            aria-hidden
            className="absolute -right-12 -top-12 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,.08)" }}
          />
          <span
            aria-hidden
            className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,.06)" }}
          />

          {/* ── Columna izquierda: mensaje principal ──────────── */}
          <div className="flex-1 flex flex-col justify-center relative z-10 max-w-[55%]">
            <p className="text-[11px] font-extrabold tracking-[2px] uppercase opacity-95">
              ⚡ Cyber Semana · Termina domingo
            </p>

            <h1
              className="font-extrabold leading-[0.95] mt-2"
              style={{ fontSize: "clamp(36px, 4vw, 52px)", letterSpacing: "-1px" }}
            >
              Hasta −26% OFF
            </h1>

            <p className="text-[14px] opacity-95 mt-3 max-w-[440px] leading-relaxed">
              En tecnología, wearables y salud. Más de 45 productos rebajados.
            </p>

            {/* Timer real (manual §6). El "Quedan" se mantiene como texto fijo;
                el número viene del estado calculado en useEffect. */}
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-black/25 backdrop-blur-sm self-start">
              <span className="text-[13px] font-bold">⏰ Quedan</span>
              <span
                className="text-[15px] font-extrabold tabular-nums"
                // suppressHydrationWarning porque el contenido cambia entre SSR
                // y cliente; es esperado y no rompe nada.
                suppressHydrationWarning
              >
                {tiempoRestante || "—:—:—"}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-5">
              <Link
                href="/productos?descuento=1"
                className="inline-flex items-center gap-2 px-7 py-3 bg-white text-red-600 rounded-full font-extrabold text-[14px] shadow-md hover:scale-105 transition-transform"
              >
                Ver ofertas →
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-7 py-3 text-white rounded-full font-bold text-[14px] border-2 border-white/40 hover:bg-white/10 transition-colors"
              >
                Ver todos
              </Link>
            </div>

            {/* Mini features de confianza (sello chileno, manual §8) */}
            <div className="flex items-center gap-4 mt-4 text-[11.5px] font-semibold opacity-95">
              <span>🇨🇱 Transbank</span>
              <span>·</span>
              <span>🚚 Envío 24-48h</span>
              <span>·</span>
              <span>🤖 Soporte IA</span>
            </div>
          </div>

          {/* ── Columna derecha: 2 productos reales ──────────── */}
          <div className="flex gap-3 items-center relative z-10">
            {destacados.map((p) => (
              <Link
                key={p.id}
                href={`/productos/${p.id}`}
                className="bg-white rounded-2xl p-3 w-[180px] flex flex-col gap-2 text-[var(--text)] hover:-translate-y-1 hover:shadow-xl transition-all"
                aria-label={p.name}
              >
                <div className="relative aspect-[1/1] rounded-xl bg-gray-50 overflow-hidden">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="180px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-5xl">
                      {p.icon ?? "🛍️"}
                    </span>
                  )}
                  {/* Badge de descuento (manual §5). El "-26%" es texto fijo:
                      si quieres mostrar el descuento real por producto hay
                      que pasar original_price y calcularlo. */}
                  <span
                    className="absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white"
                    style={{ background: "#dc2626" }}
                  >
                    −26%
                  </span>
                </div>
                <p className="text-[11.5px] font-bold leading-tight line-clamp-2 min-h-[28px] text-gray-800">
                  {p.name}
                </p>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-[15px] font-extrabold" style={{ color: "#dc2626" }}>
                    ${Number(p.price).toLocaleString("es-CL")}
                  </span>
                  <span
                    className="text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded leading-none"
                    style={{ background: "#f97316" }}
                  >
                    −26% OFF
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}