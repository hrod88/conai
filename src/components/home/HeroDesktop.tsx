"use client";

// HeroDesktop.tsx — FASE 2 con fusión de PromoStrip dentro
// ──────────────────────────────────────────────────────────────────────────
// Hero comercial SOLO DESKTOP (md+) en estilo AliExpress/Temu.
// Reemplaza al HeroSlider (Bento) Y al PromoStrip (cupones grandes), ambos
// quedan inutilizados en el page.tsx pero sus archivos siguen en el repo.
//
// Estructura unificada:
//   1) Banner principal (gradient rojo→naranja del manual §2):
//      Izquierda: eyebrow + título "Hasta -26% OFF" + descripción +
//                 3 cupones (CONAI5/CONAI10/CONAI18) + timer real +
//                 CTAs + sello chileno discreto.
//      Derecha: 2 productos reales con precio rojo + badge naranja.
//   2) Franja de beneficios debajo, en indigo (manual §8 sello chileno).
//
// El timer es honesto (manual §6): termina cada DOMINGO a las 23:59 y se
// renueva al siguiente domingo. No se reinicia al llegar a cero.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type HeroMiniProduct = {
  id: string;
  name: string;
  price: number;
  icon?: string | null;
  image?: string | null;
};

interface HeroDesktopProps {
  /** Productos a destacar dentro del banner (idealmente 2 con descuento). */
  products: HeroMiniProduct[];
}

// Cupones activos. Si el día de mañana cambian códigos o montos, se editan
// acá. En el futuro esto debería venir de una tabla `coupons` en Supabase.
const COUPONS = [
  { amount: "$5.000",  cond: "sobre $40.000",  code: "CONAI5"  },
  { amount: "$10.000", cond: "sobre $70.000",  code: "CONAI10" },
  { amount: "$18.000", cond: "sobre $120.000", code: "CONAI18" },
];

/**
 * Devuelve ms hasta el próximo domingo 23:59:59. Si hoy es domingo y aún no
 * son las 23:59, retorna lo que queda; si ya pasó, salta al próximo domingo.
 */
function msHastaProximoDomingo(): number {
  const ahora = new Date();
  const proximo = new Date(ahora);
  const diasParaDomingo = (7 - ahora.getDay()) % 7;
  proximo.setDate(ahora.getDate() + diasParaDomingo);
  proximo.setHours(23, 59, 59, 999);
  if (proximo.getTime() <= ahora.getTime()) {
    proximo.setDate(proximo.getDate() + 7);
  }
  return proximo.getTime() - ahora.getTime();
}

/** Formatea ms como "Xd HH:MM:SS" o "HH:MM:SS" si <24h. */
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
  // Se inicializa en cliente vía useEffect para evitar mismatch SSR/cliente.
  const [tiempoRestante, setTiempoRestante] = useState<string>("");

  useEffect(() => {
    const tick = () => setTiempoRestante(formatearTiempo(msHastaProximoDomingo()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const destacados = (products ?? []).slice(0, 2);

  return (
    <section className="hidden md:block w-full bg-[var(--bg)] py-4 px-6">
      <div className="max-w-6xl mx-auto">

        {/* ═══════════════ BANNER PRINCIPAL ═══════════════ */}
        <div
          className="relative overflow-hidden rounded-t-2xl shadow-lg flex items-stretch gap-6 px-7 py-6 text-white"
          style={{
            background: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
            minHeight: "360px",
          }}
        >
          {/* Burbujas decorativas (manual §2). */}
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

          {/* ── Columna izquierda: mensaje + cupones + timer + CTAs ──── */}
          <div className="flex-1 flex flex-col justify-center relative z-10 max-w-[58%]">
            <p className="text-[11px] font-extrabold tracking-[2px] uppercase opacity-95">
              ⚡ Cyber Semana · Termina domingo
            </p>

            <h1
              className="font-extrabold leading-[0.95] mt-2"
              style={{ fontSize: "clamp(34px, 3.8vw, 48px)", letterSpacing: "-1px" }}
            >
              Hasta −26% OFF
            </h1>

            <p className="text-[13.5px] opacity-95 mt-2 max-w-[460px] leading-relaxed">
              En tecnología, wearables y salud. Más de 45 productos rebajados.
            </p>

            {/* ── Cupones fusionados (antes en PromoStrip) ──
                Píldoras blancas con monto en rojo, código abajo en naranja.
                El borde punteado entre cupones es decisión del manual: aporta
                identidad visual al estilo "tarjeta de ticket". */}
            <div className="flex items-stretch bg-white rounded-xl overflow-hidden mt-4 w-fit shadow-md">
              {COUPONS.map((c, i) => (
                <div
                  key={c.code}
                  className={`px-4 py-2 text-center ${
                    i < COUPONS.length - 1
                      ? "border-r-2 border-dashed border-orange-200"
                      : ""
                  }`}
                >
                  <div
                    className="text-[15px] font-extrabold leading-none"
                    style={{ color: "#dc2626" }}
                  >
                    −{c.amount}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{c.cond}</div>
                  <div
                    className="text-[10px] font-extrabold tracking-wider mt-0.5"
                    style={{ color: "#f97316" }}
                  >
                    {c.code}
                  </div>
                </div>
              ))}
            </div>

            {/* Timer real (manual §6). suppressHydrationWarning evita warning
                normal por contenido distinto entre SSR y cliente. */}
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-black/25 backdrop-blur-sm self-start">
              <span className="text-[13px] font-bold">⏰ Quedan</span>
              <span
                className="text-[15px] font-extrabold tabular-nums"
                suppressHydrationWarning
              >
                {tiempoRestante || "—:—:—"}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4">
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

            {/* Sello chileno (manual §8) */}
            <div className="flex items-center gap-3 mt-4 text-[11.5px] font-semibold opacity-95">
              <span>🇨🇱 Transbank</span>
              <span>·</span>
              <span>🚚 Envío 24-48h</span>
              <span>·</span>
              <span>🤖 Soporte IA</span>
            </div>
          </div>

          {/* ── Columna derecha: 2 productos reales ─────────────────────── */}
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

        {/* ═══════════════ FRANJA DE BENEFICIOS ═══════════════ */}
        {/* Indigo (manual §2: marca/navegación), separa el bloque comercial
            arriba (rojo) del resto de la página. Antes era parte del
            PromoStrip; aquí queda fusionada. */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 px-5 py-2.5 text-white text-[12px] rounded-b-2xl"
          style={{ background: "#3730a3" }}
        >
          <span>🚚 <b className="font-bold">Envío gratis</b> sobre $49.990</span>
          <span className="opacity-40">·</span>
          <span>📦 <b className="font-bold">Entrega rápida</b> · 3-5 días hábiles</span>
          <span className="opacity-40">·</span>
          <span>↩️ <b className="font-bold">Devoluciones</b> garantizadas</span>
        </div>

      </div>
    </section>
  );
}