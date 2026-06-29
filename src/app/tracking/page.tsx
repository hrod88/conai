"use client";

import { useState } from "react";
import Link from "next/link";

type TrackingResult = {
  id: string;
  status: string;
  shipping_status: string | null;
  tracking_number: string | null;
  courier: string | null;
  created_at: string;
  shipping_name: string | null;
  shipping_city: string | null;
  shipping_region: string | null;
  total: number;
};

const SHIPPING_STEPS = [
  { key: "received",   label: "Recibido",   icon: "📬" },
  { key: "preparing",  label: "Preparando", icon: "📦" },
  { key: "shipped",    label: "Despachado", icon: "🚚" },
  { key: "in_transit", label: "En camino",  icon: "🛫" },
  { key: "delivered",  label: "Entregado",  icon: "✅" },
] as const;

const STATUS_MSG: Record<string, string> = {
  received:   "Recibimos tu pedido. Lo procesaremos en las próximas 24-48 horas.",
  preparing:  "Estamos preparando tu pedido para el despacho.",
  shipped:    "Tu pedido fue despachado y está en camino.",
  in_transit: "Tu pedido está en tránsito. Llegará en los próximos días.",
  delivered:  "¡Tu pedido fue entregado! Esperamos que lo disfrutes.",
};

function courierUrl(courier: string, tracking: string): string {
  if (courier === "chilexpress") return `https://www.chilexpress.cl/views/buscaestado.aspx?codigo=${tracking}`;
  if (courier === "starken")     return `https://www.starken.cl/seguimiento?codigo=${tracking}`;
  if (courier === "bluexpress")  return `https://www.bluexpress.cl/tracking?numero=${tracking}`;
  return "#";
}

function courierLabel(courier: string): string {
  return { chilexpress: "Chilexpress", starken: "Starken", bluexpress: "Bluexpress" }[courier] ?? courier;
}

function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date); let added = 0;
  while (added < days) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) added++; }
  return d;
}

function stepIndex(status: string | null): number {
  const idx = SHIPPING_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function TrackingPage() {
  const [orderId, setOrderId]     = useState("");
  const [email, setEmail]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<TrackingResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [searched, setSearched]   = useState(false);

  async function handleSearch() {
    const id    = orderId.trim().toUpperCase();
    const mail  = email.trim().toLowerCase();
    if (!id || !mail) { setError("Ingresa el número de pedido y tu email."); return; }

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(false);

    try {
      const res  = await fetch(`/api/tracking?order=${encodeURIComponent(id)}&email=${encodeURIComponent(mail)}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "No encontramos un pedido con esos datos. Verifica el número de pedido y el email.");
      } else {
        setResult(json.order);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  const currentIdx   = result ? stepIndex(result.shipping_status) : 0;
  const created      = result ? new Date(result.created_at) : new Date();
  const minDate      = addBusinessDays(created, 10);
  const maxDate      = addBusinessDays(created, 15);
  const fmt          = (d: Date) => d.toLocaleDateString("es-CL", { day: "numeric", month: "long" });

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "var(--bg)" }}>
      <div className="max-w-lg mx-auto flex flex-col gap-8">

        {/* Encabezado */}
        <div className="text-center">
          <Link href="/" className="text-2xl font-black gradient-text mb-6 inline-block">conAI</Link>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text)] mb-2">
            Rastrear mi pedido
          </h1>
          <p className="text-[13px] text-[var(--text-muted)]">
            Ingresa tu número de pedido y el email con que compraste.
          </p>
        </div>

        {/* Formulario */}
        <div
          className="rounded-2xl border p-6 flex flex-col gap-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Número de pedido
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ej: 1304D139"
              className="px-4 py-3 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:border-indigo-400 transition-colors"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Lo encuentras en el email de confirmación o en "Mis pedidos".
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Email de la compra
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="tucorreo@ejemplo.com"
              className="px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-indigo-400 transition-colors"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl" style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
              <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-[12.5px] font-semibold text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-white text-[14px] transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #6366f1, #0ea5e9)" }}
          >
            {loading ? "Buscando..." : "Rastrear pedido →"}
          </button>
        </div>

        {/* Resultado */}
        {result && (
          <div
            className="rounded-2xl border p-6 flex flex-col gap-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* Header pedido */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                  #{result.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(result.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <span className="font-black text-lg" style={{ color: "var(--text)" }}>
                ${Number(result.total).toLocaleString("es-CL")}
              </span>
            </div>

            {/* Timeline */}
            <div className="flex items-center w-full">
              {SHIPPING_STEPS.map((step, i) => {
                const done    = i < currentIdx;
                const current = i === currentIdx;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <div
                        className="absolute h-[3px] top-[13px]"
                        style={{ left: "-50%", width: "100%", background: i <= currentIdx ? "#16a34a" : "var(--border)", zIndex: 0 }}
                      />
                    )}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold relative z-10 border-2"
                      style={{
                        background:  done ? "#16a34a" : current ? "#6366f1" : "var(--surface)",
                        borderColor: done ? "#16a34a" : current ? "#6366f1" : "var(--border)",
                        color:       done || current ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span
                      className="text-[9px] font-semibold mt-1.5 text-center leading-tight"
                      style={{ color: done ? "#16a34a" : current ? "#6366f1" : "var(--text-muted)" }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mensaje contextual */}
            {result.shipping_status && STATUS_MSG[result.shipping_status] && (
              <p className="text-[12.5px] font-semibold" style={{ color: "var(--text-muted)" }}>
                {result.shipping_status === "delivered" ? "🎉" : result.shipping_status === "in_transit" ? "🛫" : result.shipping_status === "shipped" ? "🚚" : result.shipping_status === "preparing" ? "📦" : "✅"}{" "}
                {STATUS_MSG[result.shipping_status]}
              </p>
            )}

            {/* Número de seguimiento */}
            {result.tracking_number && result.courier && (
              <div
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border"
                style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                    Número de seguimiento
                  </p>
                  <p className="font-black text-[14px] font-mono" style={{ color: "var(--text)" }}>
                    {result.tracking_number}
                  </p>
                  <p className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                    {courierLabel(result.courier)}
                  </p>
                </div>
                <a
                  href={courierUrl(result.courier, result.tracking_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#6366f1,#38bdf8)" }}
                >
                  Rastrear →
                </a>
              </div>
            )}

            {/* Fecha estimada */}
            {result.shipping_status !== "delivered" && (
              <p className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>
                📅 Entrega estimada: entre el <strong>{fmt(minDate)}</strong> y el <strong>{fmt(maxDate)}</strong>
              </p>
            )}

            {/* Dirección */}
            {result.shipping_name && (
              <div className="flex items-start gap-2 text-[12px]" style={{ color: "var(--text-muted)" }}>
                <span className="mt-0.5">🚚</span>
                <div>
                  <p className="font-bold" style={{ color: "var(--text)" }}>{result.shipping_name}</p>
                  <p>{result.shipping_city}, {result.shipping_region}</p>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex gap-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <Link href="/mis-pedidos" className="text-[12px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                Ver todos mis pedidos →
              </Link>
              <Link href="/contacto" className="text-[12px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                Contactar soporte →
              </Link>
            </div>
          </div>
        )}

        {/* Sin resultado */}
        {searched && !result && !error && (
          <div className="text-center py-8">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="font-bold text-[var(--text)]">No encontramos ese pedido</p>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">Verifica el número y el email.</p>
          </div>
        )}

      </div>
    </div>
  );
}