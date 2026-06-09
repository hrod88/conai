"use client";

import { useState, useEffect } from "react";
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

export default function FlashBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem("flash_banner_dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const { h, m, s, done } = useCountdown(48 * 3_600_000);

  function dismiss() {
    sessionStorage.setItem("flash_banner_dismissed", "1");
    setVisible(false);
  }

  if (!visible || done || pathname === "/") return null;

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 px-4 py-2 text-white text-[12px] font-bold"
      style={{ background: "linear-gradient(90deg, #6366f1, #0ea5e9, #10b981)" }}>
      <span>⚡ Flash Sale — 20% en todo el sitio</span>
      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full font-black tabular-nums">
        {h}:{m}:{s}
      </span>
      <span className="text-white/70">· Usa código</span>
      <span className="bg-white text-indigo-600 px-2 py-0.5 rounded font-black tracking-wider">
        CONAI20
      </span>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-lg leading-none"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}
