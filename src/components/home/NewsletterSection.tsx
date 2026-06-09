"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-xl mx-auto text-center flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-4xl">📬</span>
          <h2 className="text-3xl font-black text-[var(--text)]">
            Ofertas antes que nadie
          </h2>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            Suscríbete y recibe un <strong className="text-indigo-600">10% de descuento</strong> en tu primera compra, más acceso a ofertas flash exclusivas.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={submit} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none focus:border-indigo-400 transition-colors"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #38bdf8)" }}
            >
              Suscribirme →
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <span className="text-2xl">✅</span>
            <p className="text-sm font-bold text-[var(--text)]">
              ¡Listo! Tu código es{" "}
              <span className="text-indigo-600 font-black">BIENVENIDO10</span>
            </p>
          </div>
        )}

        <p className="text-[10px] text-[var(--text-muted)]">
          Sin spam. Puedes darte de baja cuando quieras.
        </p>
      </div>
    </section>
  );
}
