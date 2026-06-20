"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

// ── Datos de la promo (fáciles de editar) ──
const COUPONS = [
  { amount: "$5.000", cond: "sobre $40.000", code: "CONAI5" },
  { amount: "$10.000", cond: "sobre $70.000", code: "CONAI10" },
  { amount: "$18.000", cond: "sobre $120.000", code: "CONAI18" },
];

const FEATURED = {
  id: "632f87da-802a-4f1e-9990-44fc65898559",
  name: "Fitbit Charge 6 con ECG",
  price: 390000,
  originalPrice: 526500,
  image: "https://mzobwuzjdaqbyuadmtpw.supabase.co/storage/v1/object/public/product-images/ae-1781410127580-fbin3i.webp",
  icon: "⚽",
};

const CYCLE_HOURS = 48; // cada cuántas horas se reinicia el contador

function clp(n: number) {
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

// Calcula cuánto falta para el próximo "corte" de 48h (contador que se reinicia)
function getRemainingMs() {
  const cycleMs = CYCLE_HOURS * 3_600_000;
  const now = Date.now();
  const next = Math.ceil(now / cycleMs) * cycleMs;
  return next - now;
}

export default function PromoStrip() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(getRemainingMs());
    const t = setInterval(() => setRemaining(getRemainingMs()), 1000);
    return () => clearInterval(t);
  }, []);

  // Mientras no monta (SSR), no mostramos el contador para evitar mismatch
  const hh = remaining != null ? String(Math.floor(remaining / 3_600_000)).padStart(2, "0") : "--";
  const mm = remaining != null ? String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, "0") : "--";
  const ss = remaining != null ? String(Math.floor((remaining % 60_000) / 1_000)).padStart(2, "0") : "--";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4">
      <div className="rounded-2xl overflow-hidden shadow-lg">
        {/* ── Fila principal ── */}
        <div
          className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6 px-5 py-4 md:px-7 md:py-5 text-white"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 55%, #3730a3 100%)" }}
        >
          {/* círculo decorativo */}
          <span className="pointer-events-none absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5" />

          {/* ① Urgencia / contador */}
          <div className="flex-shrink-0 z-10">
            <div className="text-[11px] md:text-xs font-semibold opacity-85">
              ⚡ Flash Sale — termina en
            </div>
            <div className="text-2xl md:text-3xl font-black tabular-nums flex items-center gap-2">
              {hh}:{mm}:{ss}
            </div>
          </div>

          {/* ② Cupones */}
          <div className="z-10 overflow-x-auto">
            <div className="flex bg-white rounded-xl overflow-hidden w-max">
              {COUPONS.map((c, i) => (
                <div
                  key={c.code}
                  className={`px-3 py-2 md:px-4 text-center ${i < COUPONS.length - 1 ? "border-r border-dashed border-[#e5b8a0]" : ""}`}
                >
                  <div className="text-base md:text-lg font-black text-[#c2703d] leading-none">
                    -{c.amount}
                  </div>
                  <div className="text-[9px] text-gray-400 my-0.5">{c.cond}</div>
                  <div className="text-[9px] font-extrabold text-indigo-600">{c.code}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ③ Producto destacado */}
          <Link
            href={`/productos/${FEATURED.id}`}
            className="z-10 md:ml-auto flex items-center gap-3 bg-white/95 rounded-xl p-2 pr-4 hover:bg-white transition-colors"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
              {FEATURED.image ? (
                <Image src={FEATURED.image} alt={FEATURED.name} width={56} height={56} className="object-cover w-full h-full" />
              ) : (
                <span className="text-2xl">{FEATURED.icon}</span>
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold text-indigo-600">⭐ Oferta top</div>
              <div className="text-xs font-bold text-[#1e2230] leading-tight max-w-[130px]">{FEATURED.name}</div>
              {FEATURED.originalPrice > FEATURED.price && (
                <div className="text-[10px] text-gray-400 line-through">{clp(FEATURED.originalPrice)}</div>
              )}
              <div className="text-base font-black text-indigo-700">{clp(FEATURED.price)}</div>
            </div>
          </Link>
        </div>

        {/* ④ Barra de beneficios */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-7 gap-y-1 px-5 py-2.5 text-white text-[11px] md:text-xs"
          style={{ background: "#3730a3" }}
        >
          <span>🚚 <b className="font-bold">Envío gratis</b> sobre $49.990</span>
          <span>📦 <b className="font-bold">Entrega rápida</b> · 3-5 días hábiles</span>
          <span>↩️ <b className="font-bold">Devoluciones</b> garantizadas</span>
        </div>
      </div>
    </div>
  );
}
