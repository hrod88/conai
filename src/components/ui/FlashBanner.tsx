"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(targetMs);
  useEffect(() => {
    const t = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1000));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(remaining / 3_600_000)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, "0");
  const s = String(Math.floor((remaining % 60_000) / 1_000)).padStart(2, "0");
  return { h, m, s, done: remaining === 0 };
}

const MESSAGES = [
  { type: "sale" },
  { type: "text", text: "🇨🇱 Pago seguro con Transbank WebPay Plus · Débito y crédito" },
  { type: "text", text: "🚚 Despacho a todo Chile · Chilexpress y Starken · 24-48 horas hábiles" },
  { type: "text", text: "↩️ 30 días para devolver · Sin preguntas · Retiro a domicilio sin costo" },
  { type: "text", text: "💬 Soporte en español · Lunes a viernes 9:00 – 18:00 hrs" },
];

const INTERVAL_MS = 4000;

export default function FlashBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem("flash_banner_dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    timerRef.current = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % MESSAGES.length);
        setAnimating(false);
      }, 350);
    }, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible]);

  const { h, m, s, done } = useCountdown(48 * 3_600_000);

  function dismiss() {
    sessionStorage.setItem("flash_banner_dismissed", "1");
    setVisible(false);
  }

  if (!visible || done || pathname === "/") return null;

  const msg = MESSAGES[current];

  return (
    <div
      className="relative z-40 flex items-center justify-center px-4 overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #dc2626, #f97316)",
        height: "38px",
      }}
    >
      {/* Mensaje con animación slide-up */}
      <div
        className="flex items-center justify-center gap-2 text-white text-[12.5px] font-semibold transition-all duration-350"
        style={{
          transform: animating ? "translateY(-100%)" : "translateY(0)",
          opacity: animating ? 0 : 1,
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
        }}
      >
        {msg.type === "sale" ? (
          <>
            <span className="font-black text-white">Flash Sale</span>
            <span className="opacity-50 text-[10px]">·</span>
            <span>20% de descuento en todo el sitio</span>
            <span className="opacity-50 text-[10px]">·</span>
            <span
              className="font-black tabular-nums"
              style={{ color: "#fef08a" }}
            >
              {h}:{m}:{s}
            </span>
            <span className="opacity-50 text-[10px]">·</span>
            <span className="opacity-90">Código</span>
            <span
              className="font-black text-[11px] px-2 py-0.5 rounded"
              style={{ background: "rgba(0,0,0,0.25)", letterSpacing: "0.5px" }}
            >
              CONAI20
            </span>
          </>
        ) : (
          <span>{msg.text}</span>
        )}
      </div>

      {/* Botón cerrar */}
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors text-[13px] leading-none"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
}