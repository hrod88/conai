"use client";

import { useState } from "react";

export default function ContactoPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-10">
      {/* Header */}
      <div className="text-center flex flex-col gap-3">
        <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
          Contáctanos
        </p>
        <h1 className="text-4xl font-black text-[var(--text)]">¿Cómo podemos ayudarte?</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Respondemos en menos de 24 horas hábiles.
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "📧", label: "Email", value: "hola@conai.cl" },
          { icon: "💬", label: "WhatsApp", value: "+56 9 XXXX XXXX" },
          { icon: "🕐", label: "Horario", value: "Lun–Vie 9–18h" },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl p-4 text-center flex flex-col gap-1 border transition-colors"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span className="text-2xl">{c.icon}</span>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">
              {c.label}
            </p>
            <p className="text-sm font-semibold text-[var(--text)]">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {sent ? (
        <div
          className="rounded-2xl p-8 text-center flex flex-col gap-3 items-center border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <span className="text-4xl">✅</span>
          <h2 className="font-black text-emerald-500">Mensaje enviado</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Te responderemos a la brevedad. ¡Gracias por contactarnos!
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-xs text-indigo-500 underline mt-2"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 flex flex-col gap-4 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">Nombre</label>
              <input
                type="text"
                required
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-[var(--text)]"
                style={{ background: "var(--bg)", borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-[var(--text)]"
                style={{ background: "var(--bg)", borderColor: "var(--border)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">Asunto</label>
            <select
              className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-[var(--text-muted)]"
              style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            >
              <option>Consulta sobre un producto</option>
              <option>Problema con mi pedido</option>
              <option>Devolución o cambio</option>
              <option>Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">Mensaje</label>
            <textarea
              required
              rows={4}
              placeholder="Cuéntanos en qué podemos ayudarte..."
              className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all resize-none text-[var(--text)]"
              style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
          >
            {loading ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      )}
    </div>
  );
}
