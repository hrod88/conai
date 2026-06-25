"use client";

// HeroDesktop.tsx — FASE 2.4
// ──────────────────────────────────────────────────────────────────────────
// Cambios vs 2.3:
//   - Flecha con animación PULSE (late como corazón, escala 1→1.18 + ring).
//   - Derecha: preparado para imagen real PNG de Freepik.
//     Mientras no esté, muestra placeholder bonito (no el emoji feo).
//     Cuando tengas /public/hero-box.png, descomenta las 3 líneas marcadas.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const FRASES = [
  "Hasta −26% OFF",
  "Tecnología buena, sin pagar de más",
  "Cyber Semana activa",
  "Llévatelo hoy",
];
const ROTACION_MS = 3000;

const COUPONS = [
  { amount: "$5.000",  cond: "sobre $40.000",  code: "CONAI5"  },
  { amount: "$10.000", cond: "sobre $70.000",  code: "CONAI10" },
  { amount: "$18.000", cond: "sobre $120.000", code: "CONAI18" },
];

const CARD_COLORS = ["#dc2626", "#2563eb", "#db2777"];

export type HeroProduct = {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image?: string | null;
  icon?: string | null;
};

interface HeroDesktopProps {
  products: HeroProduct[];
}

// Inyectamos el keyframe de pulse via <style> en el cliente para no depender
// de Tailwind (no tiene este keyframe built-in con ring expansivo).
const PULSE_CSS = `
@keyframes hero-pulse {
  0%   { transform: scale(1);    box-shadow: 0 0 0 0    rgba(255,255,255,.75); }
  50%  { transform: scale(1.18); box-shadow: 0 0 0 10px rgba(255,255,255,.0);  }
  100% { transform: scale(1);    box-shadow: 0 0 0 0    rgba(255,255,255,.0);  }
}
.hero-arrow-pulse {
  animation: hero-pulse 1.5s ease-in-out infinite;
}
`;

export default function HeroDesktop({ products }: HeroDesktopProps) {
  const [fraseIdx, setFraseIdx] = useState(0);
  const [anim, setAnim] = useState<"idle" | "exit" | "enter">("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => {
      setAnim("exit");
      setTimeout(() => {
        setFraseIdx((i) => (i + 1) % FRASES.length);
        setAnim("enter");
        setTimeout(() => setAnim("idle"), 50);
      }, 300);
    }, ROTACION_MS);
    return () => clearInterval(id);
  }, []);

  const fraseStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.5px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    display: "block",
    transition: anim === "enter" ? "none" : "transform 0.3s ease, opacity 0.3s ease",
    transform:
      anim === "idle"  ? "translateY(0)"    :
      anim === "exit"  ? "translateY(-24px)" :
                         "translateY(24px)",
    opacity: anim === "idle" ? 1 : 0,
  };

  const cards = products.slice(0, 3);

  // ── Para usar la imagen real: ──────────────────────────────────────────
  // 1) Descarga tu PNG de Freepik y guárdalo en /public/hero-box.png
  // 2) Cambia esta constante a true:
  const HAS_HERO_IMAGE = true;
  // ──────────────────────────────────────────────────────────────────────

  return (
    <section className="hidden md:block w-full">
      {/* Inyección del keyframe de pulse (solo cliente) */}
      {mounted && <style>{PULSE_CSS}</style>}

      <div
        className="relative overflow-hidden w-full text-white"
        style={{ background: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)" }}
      >
        {/* Burbujas decorativas */}
        <span aria-hidden className="absolute pointer-events-none rounded-full"
          style={{ right:"6%", top:"-20%", width:"300px", height:"300px", background:"rgba(255,255,255,.06)" }} />
        <span aria-hidden className="absolute pointer-events-none rounded-full"
          style={{ left:"-4%", bottom:"-20%", width:"250px", height:"250px", background:"rgba(255,255,255,.05)" }} />

        {/* ── 1) FRANJA DE CUPONES DISCRETA ── */}
        <div
          className="relative z-10 flex items-center gap-5 px-10 py-1.5 text-[11px] font-semibold"
          style={{ background:"rgba(0,0,0,.14)", borderBottom:"1px solid rgba(255,255,255,.14)", opacity:.9 }}
        >
          <span className="opacity-80">🎟️ Cupones:</span>
          {COUPONS.map((c, i) => (
            <span key={c.code} className="flex items-center gap-1.5">
              {i > 0 && <span className="opacity-30">|</span>}
              <span>−{c.amount} sobre {c.cond} ·</span>
              <span
                className="font-extrabold tracking-wide px-1.5 py-0.5 rounded"
                style={{ background:"rgba(255,255,255,.2)", fontSize:"10px" }}
              >
                {c.code}
              </span>
            </span>
          ))}
        </div>

        {/* ── 2) CUERPO PRINCIPAL ── */}
        <div
          className="relative z-10 mx-auto px-10 py-5 grid items-center gap-8"
          style={{ maxWidth:"1280px", gridTemplateColumns:"1.1fr 1fr" }}
        >

          {/* ── IZQUIERDA ── */}
          <div className="flex flex-col">
            <p className="text-[12px] font-semibold opacity-95 mb-2">
              ⚡ <b className="font-extrabold">CYBER SEMANA</b> · Termina dom 23:59 (CLT)
            </p>

            {/* Frase rotativa + flecha PULSE */}
            <Link
              href="/productos?descuento=1"
              className="inline-flex items-center gap-3 mb-4 group self-start"
              style={{ overflow:"hidden", height:"38px" }}
              aria-label="Ver ofertas"
            >
              <h1 style={fraseStyle} suppressHydrationWarning>
                {FRASES[fraseIdx]}
              </h1>
              {/* Flecha con animación Pulse (late como corazón) */}
              <span
                className="hero-arrow-pulse flex items-center justify-center rounded-full bg-white text-red-600 font-extrabold flex-shrink-0"
                style={{ width:"34px", height:"34px", fontSize:"16px", cursor:"pointer" }}
              >
                ›
              </span>
            </Link>

            {/* 3 tarjetas de producto */}
            <div className="grid gap-2" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
              {cards.map((p, i) => {
                const discountPct = p.original_price && p.original_price > p.price
                  ? Math.round((1 - p.price / p.original_price) * 100)
                  : null;
                return (
                  <Link
                    key={p.id}
                    href={`/productos/${p.id}`}
                    className="bg-white rounded-xl overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    style={{ borderTop:`3px solid ${CARD_COLORS[i] ?? "#dc2626"}` }}
                  >
                    <div className="flex items-center gap-2 p-2.5">
                      <div
                        className="flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center"
                        style={{ width:"58px", height:"58px" }}
                      >
                        {p.image ? (
                          <Image src={p.image} alt={p.name} width={58} height={58} className="object-contain p-1" />
                        ) : (
                          <span style={{ fontSize:"28px" }}>{p.icon ?? "🛍️"}</span>
                        )}
                      </div>
                      <p
                        className="text-[11px] font-bold text-gray-800 leading-snug"
                        style={{
                          display:"-webkit-box",
                          WebkitLineClamp:3,
                          WebkitBoxOrient:"vertical",
                          overflow:"hidden",
                        } as React.CSSProperties}
                      >
                        {p.name}
                      </p>
                    </div>
                    <div
                      className="flex items-baseline gap-1.5 px-2.5 pb-2.5 pt-1 border-t"
                      style={{ borderColor:"#f4f3f9" }}
                    >
                      <span className="font-extrabold" style={{ fontSize:"14px", color:"#dc2626" }}>
                        ${Number(p.price).toLocaleString("es-CL")}
                      </span>
                      {discountPct && (
                        <span className="text-white font-extrabold px-1 py-0.5 rounded"
                          style={{ fontSize:"9px", background:"#f97316" }}>
                          −{discountPct}%
                        </span>
                      )}
                      {p.original_price && (
                        <span className="text-gray-400 line-through" style={{ fontSize:"9.5px" }}>
                          ${Number(p.original_price).toLocaleString("es-CL")}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── DERECHA: imagen de Freepik o placeholder bonito ── */}
          <div className="flex items-center justify-center">
            {HAS_HERO_IMAGE ? (
              // ── Cuando tengas /public/hero-box.png, cambia HAS_HERO_IMAGE a true ──
              <Image
                src="/hero-box.png"
                alt="Productos rebajados"
                width={420}
                height={280}
                className="object-contain drop-shadow-2xl"
                priority
              />
            ) : (
              // ── Placeholder hasta tener la imagen ──
              <div
                className="rounded-2xl flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden"
                style={{
                  width:"400px", height:"270px",
                  background:"radial-gradient(circle at 50% 35%, rgba(255,255,255,.2), rgba(255,255,255,.05))",
                  border:"2px dashed rgba(255,255,255,.3)",
                }}
              >
                {/* Mini ilustración CSS mientras no hay imagen */}
                <div className="relative" style={{ width:"180px", height:"130px" }}>
                  {/* Caja base */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-xl flex items-end justify-center pb-2"
                    style={{ width:"140px", height:"85px", background:"linear-gradient(160deg,#fbbf24,#f59e0b)", boxShadow:"0 8px 20px rgba(0,0,0,.25)" }}>
                    <span className="text-white font-extrabold tracking-widest" style={{ fontSize:"13px" }}>conAI</span>
                  </div>
                  {/* Tapa */}
                  <div className="absolute" style={{ bottom:"81px", left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"70px solid transparent", borderRight:"70px solid transparent", borderBottom:"20px solid #fcd34d" }} />
                  {/* Productos saliendo */}
                  <span className="absolute" style={{ top:"0px", left:"60%", fontSize:"36px", filter:"drop-shadow(0 4px 8px rgba(0,0,0,.2))" }}>📷</span>
                  <span className="absolute" style={{ top:"8px", left:"5%", fontSize:"32px", filter:"drop-shadow(0 4px 8px rgba(0,0,0,.2))" }}>🎧</span>
                  {/* Puntos decorativos */}
                  <span className="absolute rounded-full" style={{ width:"12px", height:"12px", background:"#facc15", top:"42px", right:"0" }} />
                  <span className="absolute rounded-full" style={{ width:"8px", height:"8px", background:"#34d399", top:"20px", left:"38%" }} />
                  {/* Badge */}
                  <div className="absolute rounded-full flex items-center justify-center font-extrabold text-white"
                    style={{ width:"38px", height:"38px", background:"#2563eb", fontSize:"12px", bottom:"2px", left:"-14px", boxShadow:"0 3px 8px rgba(0,0,0,.2)" }}>
                    %
                  </div>
                </div>

                <div className="text-white/90 text-center" style={{ fontSize:"11px" }}>
                  <p className="font-bold" style={{ fontSize:"12px" }}>Pon tu imagen aquí</p>
                  <p className="opacity-75 mt-0.5">Descarga de Freepik y guarda en</p>
                  <code className="rounded px-1.5 py-0.5 mt-1 inline-block"
                    style={{ background:"rgba(0,0,0,.25)", fontSize:"9px" }}>
                    /public/hero-box.png
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 3) FRANJA DE BENEFICIOS ── */}
        <div className="relative z-10 w-full text-white py-2.5 px-10" style={{ background:"#3730a3" }}>
          <div
            className="mx-auto flex flex-wrap items-center justify-center gap-x-7 gap-y-1"
            style={{ maxWidth:"1280px", fontSize:"12.5px" }}
          >
            <span>🚚 <b className="font-bold">Envío gratis</b> sobre $49.990</span>
            <span className="opacity-30">·</span>
            <span>📦 <b className="font-bold">Entrega rápida</b> · 3-5 días hábiles</span>
            <span className="opacity-30">·</span>
            <span>↩️ <b className="font-bold">Devoluciones</b> garantizadas</span>
            <span className="opacity-30">·</span>
            <span>🇨🇱 <b className="font-bold">Pago Transbank</b></span>
          </div>
        </div>
      </div>
    </section>
  );
}