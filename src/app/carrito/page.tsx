"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useState } from "react";

function clp(n: number) {
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

const REGIONES = [
  "Región Metropolitana de Santiago",
  "Región de Valparaíso",
  "Región del Biobío",
  "Región de la Araucanía",
  "Región de Los Lagos",
  "Región de Antofagasta",
  "Región de Coquimbo",
  "Región del Libertador B. O'Higgins",
  "Región del Maule",
  "Región de Los Ríos",
  "Región de Ñuble",
  "Región de Atacama",
  "Región de Tarapacá",
  "Región de Arica y Parinacota",
  "Región de Magallanes",
  "Región de Aysén",
];

function shippingCost(region: string, subtotal: number): number {
  if (subtotal >= 49990) return 0;
  return region === "Región Metropolitana de Santiago" ? 2990 : 4990;
}

type ShippingData = {
  name: string;
  phone: string;
  address: string;
  city: string;
  region: string;
};

type Step = "cart" | "shipping";

export default function CarritoPage() {
  const { items, remove, updateQty, total, clear } = useCartStore();
  const [step, setStep] = useState<Step>("cart");
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState<ShippingData>({
    name: "", phone: "", address: "", city: "",
    region: "Región Metropolitana de Santiago",
  });

  const subtotal = total();
  const envio = shipping.region ? shippingCost(shipping.region, subtotal) : 0;
  const totalFinal = subtotal + envio;

  function handleShippingChange(field: keyof ShippingData, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  function isShippingValid() {
    return shipping.name.trim() && shipping.phone.trim() &&
      shipping.address.trim() && shipping.city.trim() && shipping.region;
  }

  async function handleCheckout() {
    if (items.length === 0 || !isShippingValid()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
          total: totalFinal,
          shipping: { ...shipping, cost: envio },
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error al iniciar el pago. Intenta de nuevo.");
      }
    } catch {
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center flex flex-col gap-5 items-center">
        <span className="text-6xl">🛒</span>
        <h1 className="text-2xl font-black text-[var(--text)]">Tu carrito está vacío</h1>
        <p className="text-[var(--text-muted)] text-sm">Agrega productos para continuar</p>
        <Link
          href="/productos"
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-full hover:opacity-90 transition-opacity"
        >
          Ver productos →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">

      {/* Header con steps */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[var(--text)]">
          {step === "cart" ? "Tu carrito" : "Datos de envío"}
        </h1>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${step === "cart" ? "bg-indigo-500 text-white" : "text-[var(--text-muted)]"}`}>
            1 · Carrito
          </span>
          <span className="text-[var(--text-muted)] text-xs">→</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${step === "shipping" ? "bg-indigo-500 text-white" : "text-[var(--text-muted)]"}`}>
            2 · Envío
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col gap-3">
          {step === "cart" ? (
            <>
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="rounded-xl p-4 flex items-center gap-4 border transition-colors"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <span className="text-3xl flex-shrink-0">{product.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[var(--text)] truncate">{product.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold text-[var(--text-muted)] hover:text-indigo-600 transition-colors"
                      style={{ borderColor: "var(--border)" }}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-[var(--text)]">{quantity}</span>
                    <button
                      onClick={() => updateQty(product.id, quantity + 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold text-[var(--text-muted)] hover:text-indigo-600 transition-colors"
                      style={{ borderColor: "var(--border)" }}
                    >
                      +
                    </button>
                  </div>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm w-24 text-right flex-shrink-0">
                    {clp(product.price * quantity)}
                  </span>
                  <button
                    onClick={() => remove(product.id)}
                    className="text-[var(--text-muted)] hover:text-red-400 transition-colors flex-shrink-0"
                    aria-label="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  onClick={clear}
                  className="text-xs text-[var(--text-muted)] hover:text-red-500 font-semibold transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </>
          ) : (
            /* Formulario de envío */
            <div
              className="rounded-xl border p-6 flex flex-col gap-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={shipping.name}
                    onChange={(e) => handleShippingChange("name", e.target.value)}
                    placeholder="Juan Pérez"
                    className="px-3 py-2.5 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) => handleShippingChange("phone", e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="px-3 py-2.5 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={shipping.address}
                  onChange={(e) => handleShippingChange("address", e.target.value)}
                  placeholder="Av. Providencia 1234, Dpto 5B"
                  className="px-3 py-2.5 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">
                    Ciudad / Comuna *
                  </label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) => handleShippingChange("city", e.target.value)}
                    placeholder="Providencia"
                    className="px-3 py-2.5 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">
                    Región *
                  </label>
                  <select
                    value={shipping.region}
                    onChange={(e) => handleShippingChange("region", e.target.value)}
                    className="px-3 py-2.5 rounded-lg border text-sm bg-transparent text-[var(--text)] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    {REGIONES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Info costo de envío */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm"
                style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
              >
                <span className="text-xl">🚚</span>
                <div className="flex-1">
                  {subtotal >= 49990 ? (
                    <p className="font-bold text-emerald-500">¡Envío gratis! Pedido sobre $49.990</p>
                  ) : (
                    <>
                      <p className="font-bold text-[var(--text)]">
                        {shipping.region === "Región Metropolitana de Santiago"
                          ? "Envío RM: $2.990"
                          : "Envío a regiones: $4.990"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Gratis sobre $49.990 · Despacho en 3-5 días hábiles</p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setStep("cart")}
                className="text-xs text-[var(--text-muted)] hover:text-indigo-500 font-semibold transition-colors self-start"
              >
                ← Volver al carrito
              </button>
            </div>
          )}
        </div>

        {/* Resumen lateral */}
        <div className="lg:w-72 flex-shrink-0">
          <div
            className="rounded-xl p-5 flex flex-col gap-4 sticky top-20 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h2 className="font-black text-[var(--text)]">Resumen</h2>

            <div className="flex flex-col gap-2 text-sm">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-[var(--text-muted)]">
                  <span className="truncate mr-2">{product.name} ×{quantity}</span>
                  <span className="flex-shrink-0">{clp(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            <hr style={{ borderColor: "var(--border)" }} />

            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)] font-semibold">Subtotal</span>
              <span className="font-bold text-[var(--text)]">{clp(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)] font-semibold">Envío</span>
              {step === "cart" ? (
                <span className="font-bold text-[var(--text-muted)]">—</span>
              ) : envio === 0 ? (
                <span className="font-bold text-emerald-500">Gratis</span>
              ) : (
                <span className="font-bold text-[var(--text)]">{clp(envio)}</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-black text-[var(--text)]">Total</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-lg">
                {step === "cart" ? clp(subtotal) : clp(totalFinal)}
              </span>
            </div>

            {step === "cart" ? (
              <button
                onClick={() => setStep("shipping")}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Continuar con envío →
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading || !isShippingValid()}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
              >
                {loading ? "Procesando..." : "Pagar con Transbank 🔒"}
              </button>
            )}

            <p className="text-[10px] text-[var(--text-muted)] text-center">
              {step === "cart"
                ? "Envío gratis sobre $49.990"
                : "Pago 100% seguro · Transbank WebPay"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
