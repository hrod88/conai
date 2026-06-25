"use client";

// HeroDesktop.tsx — FASE 2.5
// Fixes:
//   - Flecha pulse: se corta porque el Link tiene overflow:hidden.
//     Solución: sacar la flecha FUERA del Link, ponerla al lado.
//     El overflow:hidden del Link era para contener el slide-up del texto,
//     ahora solo aplica al h1, no a la flecha.
//   - Hero más compacto: altura reducida, tipografía más chica,
//     padding menor. Más parecido a AliExpress real.

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

  // El slide-up ahora aplica SOLO al h1, no al contenedor completo.
  // Así la flecha puede estar fuera sin que la corten.
  const fraseStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.5px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    display: "block",
    transition: anim === "enter" ? "none" : "transform 0.3s ease, opacity 0.3s ease",
    transform:
      anim === "idle"  ? "translateY(0)"    :
      anim === "exit"  ? "translateY(-22px)" :
                         "translateY(22px)",
    opacity: anim === "idle" ? 1 : 0,
  };

  const cards = products.slice(0, 3);
  const HAS_HERO_IMAGE = true;

  return (
    <section className="hidden md:block w-full">
      {mounted && <style>{PULSE_CSS}</style>}

      <div
        className="relative w-full text-white"
        style={{ background: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)" }}
      >
        {/* Burbujas decorativas */}
        <span aria-hidden className="absolute pointer-events-none rounded-full"
          style={{ right:"6%", top:"-20%", width:"260px", height:"260px", background:"rgba(255,255,255,.06)" }} />
        <span aria-hidden className="absolute pointer-events-none rounded-full"
          style={{ left:"-4%", bottom:"-20%", width:"200px", height:"200px", background:"rgba(255,255,255,.05)" }} />

        {/* ── 1) FRANJA DE CUPONES DISCRETA ── */}
        <div
          className="relative z-10 flex items-center gap-4 px-8 py-1 text-[10.5px] font-semibold"
          style={{ background:"rgba(0,0,0,.14)", borderBottom:"1px solid rgba(255,255,255,.14)", opacity:.9 }}
        >
          <span className="opacity-75">🎟️ Cupones:</span>
          {COUPONS.map((c, i) => (
            <span key={c.code} className="flex items-center gap-1">
              {i > 0 && <span className="opacity-25 mx-1">|</span>}
              <span>−{c.amount} sobre {c.cond} ·</span>
              <span
                className="font-extrabold px-1.5 py-0.5 rounded ml-0.5"
                style={{ background:"rgba(255,255,255,.2)", fontSize:"9.5px", letterSpacing:".5px" }}
              >
                {c.code}
              </span>
            </span>
          ))}
        </div>

        {/* ── 2) CUERPO PRINCIPAL (compacto) ── */}
        <div
          className="relative z-10 mx-auto px-8 py-4 grid items-center gap-6"
          style={{ maxWidth:"1280px", gridTemplateColumns:"1.1fr 1fr" }}
        >

          {/* ── IZQUIERDA ── */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold opacity-90">
              ⚡ <b className="font-extrabold">CYBER SEMANA</b> · Termina dom 23:59 (CLT)
            </p>

            {/* Frase rotativa + flecha PULSE
                IMPORTANTE: la flecha está FUERA del contenedor con overflow:hidden
                para que el pulse no se corte en los bordes. */}
            <div className="flex items-center gap-3">
              {/* Contenedor del texto: overflow hidden para slide-up */}
              <Link
                href="/productos?descuento=1"
                className="block"
                style={{ overflow:"hidden", height:"32px" }}
                aria-label="Ver ofertas"
              >
                <h1 style={fraseStyle} suppressHydrationWarning>
                  {FRASES[fraseIdx]}
                </h1>
              </Link>

              {/* Flecha FUERA del overflow:hidden → el pulse se ve completo */}
              <Link href="/productos?descuento=1" aria-label="Ver ofertas" tabIndex={-1}>
                <span
                  className="hero-arrow-pulse flex items-center justify-center rounded-full bg-white text-red-600 font-extrabold flex-shrink-0"
                  style={{ width:"30px", height:"30px", fontSize:"15px" }}
                >
                  ›
                </span>
              </Link>
            </div>

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
                    <div className="flex items-center gap-2 p-2">
                      <div
                        className="flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center"
                        style={{ width:"52px", height:"52px" }}
                      >
                        {p.image ? (
                          <Image src={p.image} alt={p.name} width={52} height={52} className="object-contain p-1" />
                        ) : (
                          <span style={{ fontSize:"24px" }}>{p.icon ?? "🛍️"}</span>
                        )}
                      </div>
                      <p
                        className="text-[10.5px] font-bold text-gray-800 leading-snug"
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
                      className="flex items-baseline gap-1 px-2 pb-2 pt-1 border-t"
                      style={{ borderColor:"#f4f3f9" }}
                    >
                      <span className="font-extrabold" style={{ fontSize:"13px", color:"#dc2626" }}>
                        ${Number(p.price).toLocaleString("es-CL")}
                      </span>
                      {discountPct && (
                        <span className="text-white font-extrabold px-1 py-0.5 rounded"
                          style={{ fontSize:"8.5px", background:"#f97316" }}>
                          −{discountPct}%
                        </span>
                      )}
                      {p.original_price && (
                        <span className="text-gray-400 line-through" style={{ fontSize:"9px" }}>
                          ${Number(p.original_price).toLocaleString("es-CL")}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── DERECHA: imagen o placeholder ── */}
          <div className="flex items-center justify-center">
            {HAS_HERO_IMAGE ? (
              <Image
  src="/hero-box.png"
  alt="Productos rebajados"
  width={380}
  height={240}
  className="object-contain drop-shadow-2xl"
  style={{ maxWidth: "100%", maxHeight: "220px", width: "auto", height: "220px" }}
  priority
/>
            ) : (
              <div
                className="rounded-2xl flex flex-col items-center justify-center text-center gap-3"
                style={{
                  width:"340px", height:"220px",
                  background:"radial-gradient(circle at 50% 35%,rgba(255,255,255,.18),rgba(255,255,255,.04))",
                  border:"2px dashed rgba(255,255,255,.28)",
                }}
              >
                <div className="relative" style={{ width:"160px", height:"115px" }}>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-xl flex items-end justify-center pb-2"
                    style={{ width:"125px", height:"75px", background:"linear-gradient(160deg,#fbbf24,#f59e0b)", boxShadow:"0 8px 18px rgba(0,0,0,.22)" }}>
                    <span className="text-white font-extrabold tracking-widest" style={{ fontSize:"12px" }}>conAI</span>
                  </div>
                  <div className="absolute" style={{ bottom:"71px", left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"62px solid transparent", borderRight:"62px solid transparent", borderBottom:"17px solid #fcd34d" }} />
                  <span className="absolute" style={{ top:"0", left:"57%", fontSize:"32px", filter:"drop-shadow(0 3px 6px rgba(0,0,0,.2))" }}>📷</span>
                  <span className="absolute" style={{ top:"6px", left:"5%", fontSize:"28px", filter:"drop-shadow(0 3px 6px rgba(0,0,0,.2))" }}>🎧</span>
                  <span className="absolute rounded-full" style={{ width:"10px", height:"10px", background:"#facc15", top:"38px", right:"0" }} />
                  <span className="absolute rounded-full" style={{ width:"7px", height:"7px", background:"#34d399", top:"16px", left:"38%" }} />
                  <div className="absolute rounded-full flex items-center justify-center font-extrabold text-white"
                    style={{ width:"32px", height:"32px", background:"#2563eb", fontSize:"11px", bottom:"2px", left:"-12px", boxShadow:"0 3px 8px rgba(0,0,0,.2)" }}>
                    %
                  </div>
                </div>
                <div className="text-white/85 text-center" style={{ fontSize:"10px" }}>
                  <p className="font-bold" style={{ fontSize:"11px" }}>Pon tu imagen aquí</p>
                  <code className="rounded px-1 py-0.5 mt-1 inline-block"
                    style={{ background:"rgba(0,0,0,.22)", fontSize:"8.5px" }}>
                    /public/hero-box.png
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 3) FRANJA DE BENEFICIOS ── */}
        <div className="relative z-10 w-full text-white py-2 px-8" style={{ background:"#3730a3" }}>
          <div
            className="mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
            style={{ maxWidth:"1280px", fontSize:"12px" }}
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