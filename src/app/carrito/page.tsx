"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { useState, useEffect, useMemo } from "react";

function clp(n: number) {
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

const FREE_SHIPPING = 49990;

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
  if (subtotal >= FREE_SHIPPING) return 0;
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
  const { items, remove, updateQty, clear } = useCartStore();
  const [step, setStep] = useState<Step>("cart");
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState<ShippingData>({
    name: "", phone: "", address: "", city: "",
    region: "Región Metropolitana de Santiago",
  });
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState<"percentage" | "fixed">("percentage");
  const [couponLabel, setCouponLabel] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState("");

// ── Dirección guardada del usuario (Etapa 3) ──
  const [savedAddress, setSavedAddress] = useState<ShippingData | null>(null);
  const [addressUsed, setAddressUsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/my-address")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.address) {
          setSavedAddress(data.address as ShippingData);
        }
      })
      .catch(() => { /* sin dirección guardada, no pasa nada */ });
    return () => { cancelled = true; };
  }, []);

  function useSavedAddress() {
    if (savedAddress) {
      setShipping(savedAddress);
      setAddressUsed(true);
    }
  }

  // ── Selección por ítem (estado local, NO se persiste) ──
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Al cargar el carrito, todo viene seleccionado por defecto.
  // Si cambian los items (se agrega/quita algo), los nuevos entran seleccionados
  // y se descartan ids que ya no existen.
  useEffect(() => {
    setSelectedIds((prev) => {
      const existing = new Set(items.map((i) => i.product.id));
      const kept = prev.filter((id) => existing.has(id));
      const keptSet = new Set(kept);
      const additions = items
        .map((i) => i.product.id)
        .filter((id) => !keptSet.has(id));
      // Si prev estaba vacío (primera carga), seleccionar todo.
      if (prev.length === 0) return items.map((i) => i.product.id);
      return [...kept, ...additions];
    });
  }, [items]);

  const isSelected = (id: string) => selectedIds.includes(id);

  function toggleItem(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  function toggleAll() {
    setSelectedIds(allSelected ? [] : items.map((i) => i.product.id));
  }

  function removeSelected() {
    selectedIds.forEach((id) => remove(id));
    setSelectedIds([]);
  }

  // ── Cálculos basados SOLO en lo seleccionado ──
  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.includes(i.product.id)),
    [items, selectedIds]
  );

  const selectedCount = selectedItems.reduce((s, i) => s + i.quantity, 0);

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [selectedItems]
  );

  const discountAmount = couponType === "fixed"
    ? Math.min(couponDiscount, subtotal)
    : Math.round(subtotal * couponDiscount);
  const envio = shipping.region ? shippingCost(shipping.region, subtotal - discountAmount) : 0;
  const totalFinal = subtotal - discountAmount + envio;

  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING) * 100, 100);
  const faltanEnvioGratis = Math.max(0, FREE_SHIPPING - subtotal);

  // Ahorro por descuentos de producto (original_price vs price) en lo seleccionado.
  const productSavings = useMemo(
    () =>
      selectedItems.reduce((sum, i) => {
        const op = i.product.original_price;
        if (op && op > i.product.price) {
          return sum + (op - i.product.price) * i.quantity;
        }
        return sum;
      }, 0),
    [selectedItems]
  );
  // Ahorro total = descuentos de producto + cupón + envío gratis (si aplica).
  const envioAhorrado = subtotal >= FREE_SHIPPING && subtotal > 0 ? 2990 : 0;
  const totalSavings = productSavings + discountAmount;

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, total: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponDiscount(data.discount);
        setCouponType(data.type ?? "percentage");
        setCouponLabel(data.label);
        setCouponApplied(couponInput.toUpperCase().trim());
        setCouponError("");
      } else {
        setCouponError(data.error ?? "Cupón inválido");
        setCouponDiscount(0);
        setCouponLabel("");
        setCouponApplied("");
      }
    } catch {
      setCouponError("Error al validar el cupón");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponDiscount(0);
    setCouponLabel("");
    setCouponApplied("");
    setCouponInput("");
    setCouponError("");
  }

  function handleShippingChange(field: keyof ShippingData, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  function isShippingValid() {
    return shipping.name.trim() && shipping.phone.trim() &&
      shipping.address.trim() && shipping.city.trim() && shipping.region;
  }

  async function handleCheckout() {
    if (selectedItems.length === 0 || !isShippingValid()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
          total: totalFinal,
          shipping: { ...shipping, cost: envio },
          coupon_code: couponApplied || null,
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
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Steps bar */}
      <div className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          {([
            { n: 1, label: "Carrito", target: "cart" as Step },
            { n: 2, label: "Envío", target: "shipping" as Step },
            { n: 3, label: "Pago", target: null },
          ]).map(({ n, label, target }, i) => {
            const isCart = step === "cart";
            const active = target !== null && target === step;
            // "Carrito" queda completado (verde) cuando ya avanzamos a "shipping"
            const done = target === "cart" && !isCart;
            const clickable = target !== null && (active || done);
            return (
            <div key={n} className="flex items-center gap-3">
              {i > 0 && <span className="text-[var(--text-muted)] text-xs">›</span>}
              <button
                type="button"
                onClick={() => { if (clickable && target) setStep(target); }}
                disabled={!clickable}
                className={`flex items-center gap-2 ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                      ? "bg-indigo-500 text-white"
                      : "border text-[var(--text-muted)]"
                  }`}
                  style={!active && !done ? { borderColor: "var(--border)" } : {}}
                >
                  {done ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    n
                  )}
                </span>
                <span className={`text-sm font-semibold ${active ? "text-[var(--text)]" : done ? "text-emerald-600" : "text-[var(--text-muted)]"}`}>{label}</span>
              </button>
            </div>
            );
          })}
        </div>
      </div>

      {/* Free shipping bar */}
      <div className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-col gap-2">
          {subtotal >= FREE_SHIPPING ? (
            <p className="text-sm font-bold text-emerald-500">¡Tienes envío gratis en este pedido! 🎉</p>
          ) : subtotal > 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              Te faltan{" "}
              <span className="font-bold text-[var(--text)]">{clp(faltanEnvioGratis)}</span>{" "}
              para obtener{" "}
              <span className="font-bold text-indigo-500">envío gratis</span>
            </p>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Selecciona productos para ver el progreso de envío gratis</p>
          )}
          <div className="h-1.5 rounded-full overflow-hidden w-full" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6 items-start">

        {/* Productos / Envío */}
        <div className="flex-1 flex flex-col gap-3">

          {step === "cart" ? (
            <>
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-lg font-black text-[var(--text)]">
                  Mi carrito ({items.reduce((s, i) => s + i.quantity, 0)} productos)
                </h1>
                <button
                  onClick={clear}
                  className="text-xs text-[var(--text-muted)] hover:text-red-500 font-semibold transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>

              {/* Barra seleccionar todo */}
              <div
                className="rounded-xl border flex items-center gap-3 px-4 py-2.5 text-sm"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <button
                  onClick={toggleAll}
                  aria-label="Seleccionar todo"
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-colors ${allSelected ? "bg-indigo-500 border-indigo-500" : "border-[var(--text-muted)]"}`}
                >
                  {allSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <span className="font-semibold text-[var(--text)]">Seleccionar todo</span>
                <span className="text-[var(--text-muted)]">· {selectedIds.length} de {items.length} seleccionados</span>
                {selectedIds.length > 0 && (
                  <button
                    onClick={removeSelected}
                    className="ml-auto text-xs text-[var(--text-muted)] hover:text-red-500 font-semibold transition-colors"
                  >
                    Quitar seleccionados
                  </button>
                )}
              </div>

              {items.map(({ product, quantity }) => {
                const sel = isSelected(product.id);
                return (
                <div
                  key={product.id}
                  className="rounded-xl border flex gap-4 p-4 transition-all"
                  style={{
                    background: "var(--surface)",
                    borderColor: sel ? "var(--border)" : "var(--border)",
                    opacity: sel ? 1 : 0.55,
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItem(product.id)}
                    aria-label={sel ? "Deseleccionar" : "Seleccionar"}
                    className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 self-start mt-1 border-2 transition-colors ${sel ? "bg-indigo-500 border-indigo-500" : "border-[var(--text-muted)]"}`}
                  >
                    {sel && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  {/* Imagen / ícono + badge de stock */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{ background: "var(--surface-alt, #f3f4f6)" }}
                    >
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-3xl">{product.icon}</span>
                      )}
                    </div>
                    {typeof product.stock === "number" && product.stock > 0 && product.stock <= 5 && (
                      <span
                        className="absolute bottom-0 left-0 right-0 text-white text-[9px] font-semibold text-center py-0.5 rounded-b-lg"
                        style={{
                          background: product.stock <= 2
                            ? "rgba(224,49,49,0.85)"
                            : "rgba(30,34,48,0.78)",
                        }}
                      >
                        {product.stock <= 2 ? "¡Casi agotado!" : `Quedan ${product.stock}`}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="font-bold text-sm text-[var(--text)] leading-tight line-clamp-2">{product.name}</p>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-1">{product.description}</p>

                    {/* Precio + qty */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      {/* Qty */}
                      <div
                        className="flex items-center rounded-lg border overflow-hidden"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <button
                          onClick={() => updateQty(product.id, quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[var(--text-muted)] hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[var(--text)]">{quantity}</span>
                        <button
                          onClick={() => updateQty(product.id, quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[var(--text-muted)] hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Precio */}
                      <div className="text-right">
                        {product.original_price && product.original_price > product.price && (
                          <p className="text-xs text-[var(--text-muted)] line-through">
                            {clp(product.original_price * quantity)}
                          </p>
                        )}
                        <p className="font-extrabold text-indigo-600 dark:text-indigo-400">
                          {clp(product.price * quantity)}
                        </p>
                        {quantity > 1 && (
                          <p className="text-[10px] text-[var(--text-muted)]">{clp(product.price)} c/u</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => remove(product.id)}
                    className="self-start text-[var(--text-muted)] hover:text-red-400 transition-colors p-1 flex-shrink-0"
                    aria-label="Eliminar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
                );
              })}
            </>
          ) : (
            /* Formulario envío */
            <div
              className="rounded-xl border p-6 flex flex-col gap-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <h2 className="font-black text-[var(--text)]">Datos de envío</h2>

{savedAddress && !addressUsed && (
                <div
                  className="rounded-xl border p-4 flex flex-col gap-2"
                  style={{ borderColor: "#10b981", background: "rgba(16,185,129,0.06)" }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📍</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[var(--text)]">Usar mi dirección guardada</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {savedAddress.name} · {savedAddress.phone}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {savedAddress.address}, {savedAddress.city} · {savedAddress.region}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={useSavedAddress}
                    className="self-start text-xs font-bold px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  >
                    Usar esta dirección
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Nombre completo *</label>
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
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Teléfono *</label>
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
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Dirección *</label>
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
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Ciudad / Comuna *</label>
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
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Región *</label>
                  <select
                    value={shipping.region}
                    onChange={(e) => handleShippingChange("region", e.target.value)}
                    className="px-3 py-2.5 rounded-lg border text-sm text-[var(--text)] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    {REGIONES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm"
                style={{ borderColor: "var(--border)", background: "var(--surface-alt, #f9fafb)" }}
              >
                <span className="text-xl">🚚</span>
                <div>
                  {subtotal >= FREE_SHIPPING ? (
                    <p className="font-bold text-emerald-500">¡Envío gratis! Pedido sobre $49.990</p>
                  ) : (
                    <>
                      <p className="font-bold text-[var(--text)]">
                        {shipping.region === "Región Metropolitana de Santiago" ? "Envío RM: $2.990" : "Envío a regiones: $4.990"}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Gratis sobre $49.990 · Despacho en 3-5 días hábiles</p>
                    </>
                  )}
                </div>
              </div>

{addressUsed && (
                <button
                  onClick={() => { setShipping({ name:"", phone:"", address:"", city:"", region: "Región Metropolitana de Santiago" }); setAddressUsed(false); }}
                  className="text-xs text-indigo-500 hover:underline font-semibold self-start"
                >
                  Usar otra dirección
                </button>
              )}

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
        <div className="lg:w-80 flex-shrink-0 w-full">
          <div
            className="rounded-xl border p-5 flex flex-col gap-4 sticky top-20"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h2 className="font-black text-[var(--text)]">Resumen del pedido</h2>

            {/* Cupón */}
            {couponApplied ? (
              <div className="flex items-center justify-between text-sm px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <div>
                  <p className="font-bold text-emerald-600 text-xs">🏷 {couponApplied}</p>
                  <p className="text-emerald-500 text-xs">{couponLabel}</p>
                </div>
                <button onClick={removeCoupon} className="text-emerald-400 hover:text-red-400 transition-colors text-xs font-bold ml-2">✕</button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Cupón de descuento</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="Ej: CONAI20"
                    className="flex-1 px-3 py-2 rounded-lg border text-xs bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
              </div>
            )}

            <hr style={{ borderColor: "var(--border)" }} />

            {/* Totales */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Subtotal ({selectedCount} {selectedCount === 1 ? "ítem" : "ítems"})</span>
                <span className="font-semibold text-[var(--text)]">{clp(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-emerald-500 font-semibold">Descuento cupón</span>
                  <span className="font-bold text-emerald-500">−{clp(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Despacho</span>
                {step === "cart" ? (
                  <span className="text-[var(--text-muted)]">Se calcula en el envío</span>
                ) : envio === 0 ? (
                  <span className="font-bold text-emerald-500">Gratis</span>
                ) : (
                  <span className="font-semibold text-[var(--text)]">{clp(envio)}</span>
                )}
              </div>
            </div>

            <hr style={{ borderColor: "var(--border)" }} />

            <div className="flex justify-between items-center">
              <span className="font-black text-base text-[var(--text)]">Total</span>
              <span className="font-extrabold text-xl text-indigo-600 dark:text-indigo-400">
                {step === "cart" ? clp(subtotal - discountAmount) : clp(totalFinal)}
              </span>
            </div>

            {/* Ahorro destacado */}
            {totalSavings > 0 && selectedItems.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-base">🎉</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Ahorras {clp(totalSavings)}
                  {envioAhorrado > 0 && ` + envío gratis`}
                </span>
              </div>
            )}

            {step === "cart" ? (
              <button
                onClick={() => setStep("shipping")}
                disabled={selectedItems.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar con envío ({selectedItems.length}) →
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading || !isShippingValid() || selectedItems.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
              >
                {loading ? "Procesando..." : "Pagar con Transbank 🔒"}
              </button>
            )}

            <div className="flex items-center justify-center gap-4 text-[10px] text-[var(--text-muted)]">
              <span>🔒 Pago seguro</span>
              <span>🚚 Despacho rápido</span>
              <span>↩ Devoluciones</span>
            </div>
          </div>

          {/* Bloque de garantías */}
          <div
            className="rounded-xl border p-4 mt-4 flex flex-col gap-2.5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="text-xs font-black text-[var(--text)] flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                <path d="M12 2 4 5v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V5z" />
              </svg>
              Garantías conAI
            </p>
            {[
              "Reembolso si el paquete se pierde",
              "Reembolso por artículos dañados",
              "Reembolso si no llega en 45 días",
            ].map((g) => (
              <div key={g} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 flex-shrink-0 mt-0.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{g}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
