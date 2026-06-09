"use client";

import { useState, useEffect } from "react";

export default function FirstVisitPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem("first_visit_popup_seen");
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    localStorage.setItem("first_visit_popup_seen", "1");
    setOpen(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    localStorage.setItem("first_visit_popup_seen", "1");
    setTimeout(() => setOpen(false), 2500);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl p-7 shadow-2xl flex flex-col gap-5"
        style={{ background: "var(--surface)", animation: "scaleIn 0.35s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          style={{ background: "var(--surface-alt)" }}
        >
          ×
        </button>

        {!sent ? (
          <>
            <div className="text-center flex flex-col gap-2">
              <span className="text-5xl">🎁</span>
              <h2 className="text-xl font-black text-[var(--text)]">
                10% en tu primera compra
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Suscríbete y recibe el código directamente en tu email.
              </p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-indigo-400 transition-colors"
                style={{
                  background: "var(--surface-alt)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, #6366f1, #38bdf8)" }}
              >
                Quiero mi 10% →
              </button>
            </form>

            <p className="text-center text-[10px] text-[var(--text-muted)]">
              Sin spam. Cancela cuando quieras.
            </p>
          </>
        ) : (
          <div className="text-center flex flex-col gap-3 py-4">
            <span className="text-5xl">✅</span>
            <p className="font-black text-lg text-[var(--text)]">¡Listo!</p>
            <p className="text-sm text-[var(--text-muted)]">
              Tu código es <span className="font-black text-indigo-600">BIENVENIDO10</span>.
              Revisa tu email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
