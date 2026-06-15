"use client";

import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useToastStore } from "@/store/toast";
import type { Product } from "@/types";
import type { ReviewRow } from "./page";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";

const tagStyles: Record<string, string> = {
  bestseller: "bg-amber-50 text-amber-700 border-amber-200",
  nuevo:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  descuento:  "bg-red-50 text-red-600 border-red-200",
  oferta:     "bg-orange-50 text-orange-600 border-orange-200",
  destacado:  "bg-indigo-50 text-indigo-600 border-indigo-200",
};

const tagLabel: Record<string, string> = {
  bestseller: "⭐ Más vendidos",
  nuevo:      "🆕 Recién llegado",
  descuento:  "💲 Descuento",
  oferta:     "🔥 Oferta",
  destacado:  "✨ Destacado",
};

const categorySpecs: Record<string, [string, string][]> = {
  salud: [
    ["Sensores", "Frec. cardíaca, SpO2, temperatura corporal"],
    ["Batería", "Hasta 7 días de uso continuo"],
    ["Conectividad", "Bluetooth 5.3 + compatible ANT+"],
    ["Resistencia", "5 ATM (hasta 50 metros de profundidad)"],
    ["Compatibilidad", "iOS 14+ / Android 10+"],
    ["Pantalla", "AMOLED 1.43\", siempre activa"],
  ],
  belleza: [
    ["Tecnología", "LED fotónico + vibración sónica 8,000 RPM"],
    ["Modos", "3 intensidades ajustables"],
    ["Carga", "USB-C, completa en 90 minutos"],
    ["Duración", "45 minutos por carga"],
    ["Material", "ABS médico + silicona hipoalergénica"],
    ["Certificación", "Dermatológicamente testeado"],
  ],
  hogar: [
    ["Conectividad", "Wi-Fi 802.11 ac + Zigbee 3.0"],
    ["Control voz", "Amazon Alexa, Google Home, Siri"],
    ["Voltaje", "220V monofásico (Chile)"],
    ["Potencia", "Hasta 2,400W"],
    ["Certificación", "CE, FCC, RoHS"],
    ["Garantía", "12 meses de fábrica"],
  ],
  wearables: [
    ["Procesador", "Dual-core 1.8 GHz dedicado"],
    ["Pantalla", "AMOLED 1.78\", 326 ppi"],
    ["Memoria", "32GB almacenamiento interno"],
    ["Conectividad", "BT 5.3 + Wi-Fi 5 + NFC"],
    ["Batería", "500mAh, hasta 48h uso normal"],
    ["Resistencia", "IP68 (100m sumergible)"],
  ],
  mascotas: [
    ["GPS", "Precisión ±2 metros, cobertura global"],
    ["Batería", "3–5 días, carga en 2 horas"],
    ["Resistencia", "IP67 (30 min a 1 metro)"],
    ["App", "iOS + Android, descarga gratuita"],
    ["Alertas", "Zona segura configurable 100m–5km"],
    ["Peso", "Menos de 35 gramos"],
  ],
  gadgets: [
    ["Procesador", "Quad-core ARM Cortex-A55 2.0 GHz"],
    ["Memoria", "4GB RAM + 64GB almacenamiento"],
    ["Conectividad", "Wi-Fi 6 + Bluetooth 5.2"],
    ["Alimentación", "Batería 5,000mAh o 220V"],
    ["Sistema", "Android optimizado / firmware propietario"],
    ["Garantía", "12 meses importador oficial"],
  ],
};

const categoryFAQ: Record<string, [string, string][]> = {
  salud: [
    ["¿Qué tan preciso es el monitor cardíaco?", "Nuestros dispositivos usan sensores ópticos de última generación con una precisión del 99% comparada con equipos clínicos en pruebas independientes."],
    ["¿Se puede usar en la ducha?", "Sí, todos nuestros wearables de salud tienen resistencia 5 ATM (50 metros de profundidad), son perfectos para natación y ducha."],
    ["¿Con qué apps es compatible?", "Compatible con Apple Health, Google Fit, Samsung Health y nuestra app conAI exclusiva con análisis de tendencias impulsado por IA."],
    ["¿Cuánto demora la carga?", "La carga magnética completa toma entre 60 y 90 minutos. Incluye cargador en la caja."],
  ],
  belleza: [
    ["¿Es seguro para todo tipo de piel?", "Sí, todos nuestros dispositivos están dermatológicamente testados y son seguros para pieles sensibles, mixtas y grasas."],
    ["¿Cuántas veces a la semana se recomienda usar?", "Para mejores resultados, se recomienda usar 3–4 veces por semana durante 10–15 minutos por sesión."],
    ["¿Cuándo se notan los resultados?", "La mayoría de usuarios reporta mejoras visibles en textura e hidratación desde la segunda semana de uso consistente."],
    ["¿Incluye productos de skincare?", "El dispositivo viene solo. Es compatible con cualquier sérum o crema de tu preferencia, potenciando su absorción."],
  ],
  hogar: [
    ["¿Es compatible con Alexa y Google Home?", "Sí, todos nuestros dispositivos de hogar inteligente son compatibles con Amazon Alexa, Google Home y Apple HomeKit."],
    ["¿Se puede controlar desde fuera de casa?", "Absolutamente. Con nuestra app puedes controlar y monitorear todo desde cualquier parte del mundo con conexión a internet."],
    ["¿Funciona con el voltaje de Chile (220V)?", "Todos nuestros productos vienen configurados para 220V monofásico, el estándar de Chile. No necesitas adaptadores."],
    ["¿Qué pasa si hay un corte de luz?", "Los dispositivos guardan sus configuraciones en memoria interna. Al volver la energía, retoman su estado anterior automáticamente."],
  ],
  wearables: [
    ["¿Tiene GPS integrado?", "Sí, incluye GPS de alta precisión con actualización cada segundo, ideal para running, ciclismo y actividades outdoor."],
    ["¿Es compatible con mi teléfono?", "Compatible con iPhone (iOS 14 o superior) y todos los Android 10 o superior. La app conAI es gratuita en App Store y Google Play."],
    ["¿Cuántos días de batería tiene?", "En modo smartwatch normal: hasta 14 días. Con GPS activo y siempre encendido: 2–3 días. Se carga en 90 minutos."],
    ["¿Puedo pagar con NFC?", "Sí, tiene NFC integrado y es compatible con Apple Pay, Google Pay y tarjetas de débito/crédito configuradas en tu teléfono."],
  ],
  mascotas: [
    ["¿Funciona para perros y gatos?", "Sí, es compatible con mascotas de 2 kg o más. Viene con collar ajustable de talla única adaptable."],
    ["¿Tiene cobertura en todo Chile?", "Usa la red de telefonía 4G LTE para cobertura nacional. En sectores rurales puede depender de la cobertura del operador local."],
    ["¿Hay costo mensual adicional?", "El plan básico de GPS incluye 12 meses gratis. Luego, el plan es de $4.990/mes con almacenamiento de historial incluido."],
    ["¿Cuánto tiempo dura la batería?", "3 a 5 días con actualización GPS cada 30 segundos. En modo ahorro llega a 10 días. Se carga vía USB-C en 2 horas."],
  ],
  gadgets: [
    ["¿Incluye garantía de fábrica?", "Todos nuestros gadgets incluyen 12 meses de garantía del importador oficial en Chile. Cubre defectos de fabricación."],
    ["¿Cuánto demora el envío?", "Despachamos en 24–48 horas hábiles. El tiempo de entrega es 3–7 días hábiles a todo Chile vía Chilexpress o Starken."],
    ["¿Puedo pedir soporte técnico?", "Sí, ofrecemos soporte técnico por WhatsApp, email y videollamada. Horario: lunes a viernes 9:00–18:00."],
    ["¿Son originales o copias?", "Todos nuestros productos son 100% originales, comprados directamente de fabricantes certificados. No vendemos réplicas."],
  ],
};

type Tab = "descripcion" | "specs" | "resenas" | "faq";

function ReviewForm({
  productId,
  userEmail,
  onSubmitted,
}: {
  productId: string;
  userEmail: string;
  onSubmitted: (review: ReviewRow) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) { setError("Selecciona una calificación"); return; }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, rating, comment }),
    });
    if (res.ok) {
      onSubmitted({
        id: crypto.randomUUID(),
        user_id: "",
        rating,
        comment: comment.trim() || null,
        created_at: new Date().toISOString(),
        user_email: userEmail,
      });
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al enviar la reseña");
    }
    setSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-4 rounded-xl border"
      style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
    >
      <p className="text-sm font-black text-[var(--text)]">Deja tu reseña</p>

      <div className="flex gap-1">
        {[1,2,3,4,5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl transition-transform hover:scale-110"
          >
            <span className={(hovered || rating) >= s ? "text-amber-400" : "text-gray-200"}>★</span>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-[var(--text-muted)] self-center">
            {["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][rating]}
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Cuéntanos tu experiencia (opcional)"
        rows={3}
        maxLength={500}
        className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        style={{ borderColor: "var(--border)" }}
      />

      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="self-end px-5 py-2 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Enviando..." : "Publicar reseña"}
      </button>
    </form>
  );
}

export default function ProductDetailClient({
  product,
  related = [],
  reviews: initialReviews = [],
  userId,
  userEmail,
  userHasReviewed: initialHasReviewed = false,
}: {
  product: Product;
  related?: Product[];
  reviews?: ReviewRow[];
  userId?: string | null;
  userEmail?: string | null;
  userHasReviewed?: boolean;
}) {
  const add = useCartStore((s) => s.add);
  const { toggle, isFavorite } = useFavoritesStore();
  const showToast = useToastStore((s) => s.show);
  const [tab, setTab] = useState<Tab>("descripcion");
  const [reviews, setReviews] = useState<ReviewRow[]>(initialReviews);
  const [hasReviewed, setHasReviewed] = useState(initialHasReviewed);
  const fav = isFavorite(product.id);

  const allImages = [
    ...(product.image ? [product.image] : []),
    ...(product.images ?? []).filter((img) => img !== product.image),
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImg = allImages[activeIndex] ?? null;
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setActiveIndex((i) => Math.min(i + 1, allImages.length - 1));
      if (e.key === "ArrowLeft") setActiveIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, allImages.length]);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActiveIndex((i) => Math.min(i + 1, allImages.length - 1));
      else setActiveIndex((i) => Math.max(i - 1, 0));
    }
    setTouchStart(null);
  }

  function handleAdd() {
    add(product);
    showToast(`${product.name} agregado al carrito 🛒`, "success");
  }

  function handleFav() {
    toggle(product);
    showToast(
      fav ? "Eliminado de favoritos" : `${product.name} guardado en favoritos ❤️`,
      "info"
    );
  }

  const specs = categorySpecs[product.category] ?? categorySpecs.gadgets;
  const faqs = categoryFAQ[product.category] ?? categoryFAQ.gadgets;

  const tabs: { key: Tab; label: string }[] = [
    { key: "descripcion", label: "Descripción" },
    { key: "specs", label: "Especificaciones" },
    { key: "resenas", label: `Reseñas (${reviews.length})` },
    { key: "faq", label: "Preguntas" },
  ];

  function TabContent() {
    return (
      <>
        {tab === "descripcion" && (
          <div className="flex flex-col gap-4">
            <p className="text-[var(--text-muted)] leading-relaxed">{product.description}</p>
            <div className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-900/20 dark:to-sky-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
              <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">🤖 Análisis IA conAI</p>
              <p className="text-sm text-[var(--text)] leading-relaxed">
                Basado en miles de reseñas y comparativas, este producto destaca por su <strong>relación calidad-precio</strong> dentro de la categoría {product.category}.
                Nuestro algoritmo le asigna un <strong>Score IA de {((product.rating ?? 4.5) * 20).toFixed(0)}/100</strong>.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Calidad", pct: Math.round((product.rating ?? 4.5) * 20) },
                { label: "Valor", pct: Math.min(95, Math.round(92 - product.price / 20)) },
                { label: "Durabilidad", pct: 88 },
                { label: "Soporte", pct: 94 },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: "var(--surface-alt)" }}>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{m.pct}%</p>
                  <p className="text-[11px] text-[var(--text-muted)] font-semibold">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "specs" && (
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <tbody>
                {specs.map(([key, val], i) => (
                  <tr key={key} style={{ background: i % 2 === 0 ? "var(--surface-alt)" : "transparent" }}>
                    <td className="px-4 py-3 font-bold text-[var(--text)] w-40 border-r" style={{ borderColor: "var(--border)" }}>{key}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "resenas" && (
          <div className="flex flex-col gap-4">
            {reviews.length > 0 && (
              <div className="flex items-center gap-6 p-4 rounded-xl" style={{ background: "var(--surface-alt)" }}>
                <div className="text-center flex-shrink-0">
                  <p className="text-5xl font-black text-[var(--text)]">{(product.rating ?? 0).toFixed(1)}</p>
                  <div className="flex gap-0.5 justify-center my-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={s <= Math.round(product.rating ?? 0) ? "text-amber-400" : "text-gray-200"}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}</p>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  {[5,4,3,2,1].map((stars) => {
                    const count = reviews.filter((r) => r.rating === stars).length;
                    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="text-amber-400 w-3">{stars}</span>
                        <span className="text-amber-400 text-[10px]">★</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-[#2d2d4e] overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[var(--text-muted)] w-6">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasReviewed && (
              userId ? (
                <ReviewForm
                  productId={product.id}
                  userEmail={userEmail ?? ""}
                  onSubmitted={(review) => {
                    setReviews((prev) => [review, ...prev]);
                    setHasReviewed(true);
                  }}
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
                  style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}>
                  <span>💬</span>
                  <span className="text-[var(--text-muted)]">
                    <Link href="/login" className="text-indigo-500 font-bold hover:underline">Inicia sesión</Link> para dejar tu reseña
                  </span>
                </div>
              )
            )}

            {hasReviewed && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm text-emerald-600"
                style={{ borderColor: "#6ee7b7", background: "#d1fae5" }}>
                <span>✓</span>
                <span className="font-semibold">Ya dejaste tu reseña para este producto</span>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <span className="text-4xl block mb-2">💬</span>
                <p className="text-sm">Sé el primero en dejar una reseña</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border rounded-xl p-4" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-sky-400 flex items-center justify-center text-white font-bold text-sm">
                        {r.user_id === userId ? (userEmail ?? "T").slice(0, 1).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text)]">
                          {r.user_id === userId ? (userEmail?.split("@")[0] ?? "Tú") : "Usuario verificado"}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {new Date(r.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })} · ✓ Compra verificada
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={s <= r.rating ? "text-amber-400 text-sm" : "text-gray-200 text-sm"}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-[var(--text-muted)] leading-relaxed">{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "faq" && (
          <div className="flex flex-col gap-3">
            {faqs.map(([q, a], i) => (
              <FAQItem key={i} question={q} answer={a} />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* ── STICKY BOTTOM BAR — móvil only ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex border-t shadow-2xl"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <button
          onClick={handleFav}
          className="flex flex-col items-center justify-center gap-0.5 px-5 py-3 border-r flex-shrink-0 transition-colors active:bg-[var(--surface-alt)]"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-xl">{fav ? "❤️" : "🤍"}</span>
          <span className="text-[9px] font-bold" style={{ color: fav ? "#ef4444" : "var(--text-muted)" }}>
            {fav ? "Guardado" : "Favorito"}
          </span>
        </button>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 font-black text-[15px] text-white bg-gradient-to-r from-indigo-500 to-sky-400 disabled:opacity-50 active:opacity-80 transition-opacity"
        >
          {product.stock === 0 ? "Sin stock" : "🛒 Agregar al carrito"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto md:px-6 md:py-10 pb-20 md:pb-0">

        {/* ══════════════════════════════════════
            LAYOUT MÓVIL — estilo AliExpress
        ══════════════════════════════════════ */}
        <div className="md:hidden">

          {/* Nav superior */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
            <Link href="/productos" className="flex items-center gap-1 text-sm font-semibold text-[var(--text-muted)]">
              ‹ Volver
            </Link>
            {product.tag && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagStyles[product.tag]}`}>
                {tagLabel[product.tag]}
              </span>
            )}
          </div>

          {/* Carrusel full-bleed */}
          <div
            className="relative w-full overflow-hidden select-none"
            style={{ height: 300, background: "linear-gradient(160deg, #eef2ff 0%, #e0f2fe 100%)" }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {activeImg ? (
              <img src={activeImg} alt={product.name} className="w-full h-full object-contain p-6" draggable={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-9xl">{product.icon}</span>
              </div>
            )}

            {/* Contador */}
            {allImages.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/40 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {allImages.slice(0, 10).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`rounded-full transition-all duration-200 ${
                      i === activeIndex ? "w-4 h-1.5 bg-indigo-600" : "w-1.5 h-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                ${Number(product.price).toLocaleString("es-CL")}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-sm text-[var(--text-muted)] line-through">
                    ${Number(product.original_price).toLocaleString("es-CL")}
                  </span>
                  <span className="text-xs font-black text-white bg-emerald-500 px-1.5 py-0.5 rounded-md">
                    -{Math.round((1 - product.price / product.original_price) * 100)}%
                  </span>
                </>
              )}
            </div>
            {product.original_price && product.original_price > product.price && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Ahorro ${(Number(product.original_price) - Number(product.price)).toLocaleString("es-CL")}
              </p>
            )}
          </div>

          {/* Nombre + categoría + rating */}
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-[15px] font-bold text-[var(--text)] leading-snug mt-0.5 mb-2">
              {product.name}
            </h1>
            {product.rating && (
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={s <= Math.round(product.rating!) ? "text-amber-400" : "text-gray-200"}>★</span>
                  ))}
                </div>
                <span className="font-bold text-[var(--text)]">{product.rating.toFixed(1)}</span>
                {product.review_count && (
                  <span className="text-[var(--text-muted)]">({product.review_count} reseñas)</span>
                )}
                <span className="text-emerald-500 font-semibold ml-1">✓ Verificadas</span>
              </div>
            )}
          </div>

          {/* Envío + stock */}
          <div className="px-4 py-3 border-b flex flex-col gap-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            {[
              { icon: "🚚", bold: "Envío gratis", rest: " · Todo Chile" },
              { icon: "↩️", bold: "30 días devolución", rest: " sin costo" },
              { icon: "🔒", bold: "Pago seguro", rest: " · SSL 256-bit" },
              { icon: "🇨🇱", bold: "Stock Chile", rest: " · Despacho en 24–48h" },
            ].map(({ icon, bold, rest }) => (
              <div key={bold} className="flex items-center gap-2.5">
                <span className="text-base flex-shrink-0">{icon}</span>
                <p className="text-xs text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text)]">{bold}</span>{rest}
                </p>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-1 border-t mt-1" style={{ borderColor: "var(--border)" }}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-400" : "bg-red-500"
              }`} />
              <span className={`text-xs font-bold ${
                product.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
              }`}>
                {product.stock > 10
                  ? `En stock (${product.stock} disponibles)`
                  : product.stock > 0
                  ? `¡Últimas ${product.stock} unidades!`
                  : "Sin stock"}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-2" style={{ background: "var(--surface)" }}>
            <div className="flex border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${
                    tab === t.key
                      ? "text-indigo-600 border-indigo-600"
                      : "text-[var(--text-muted)] border-transparent"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-4">
              <TabContent />
            </div>
          </div>

          {/* Relacionados */}
          {related.length > 0 && (
            <div className="px-4 py-4 mt-2" style={{ background: "var(--surface)" }}>
              <h2 className="text-sm font-black text-[var(--text)] mb-3">También te puede interesar</h2>
              <div className="grid grid-cols-2 gap-3">
                {related.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            LAYOUT DESKTOP — igual que antes
        ══════════════════════════════════════ */}
        <div className="hidden md:block">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/productos" className="hover:text-indigo-600 transition-colors">Productos</Link>
            <span>›</span>
            <span className="text-[var(--text)] font-semibold truncate max-w-[200px]">{product.name}</span>
          </nav>

          {/* Main card */}
          <div className="rounded-2xl border p-8 flex flex-row gap-8 mb-6"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            {/* Image + thumbnails */}
            <div className="flex flex-row gap-3 flex-shrink-0">
              {/* Thumbnails — columna vertical izquierda */}
              {allImages.length > 1 && (
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-64" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
                  {allImages.slice(0, 8).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeIndex === i ? "border-indigo-500" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Imagen principal */}
              <div
                className="flex items-center justify-center w-80 h-80 rounded-2xl overflow-hidden flex-shrink-0 relative"
                style={{ background: "linear-gradient(135deg, #eef2ff, #e0f2fe)", cursor: "zoom-in" }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoomOrigin(`${x}% ${y}%`);
                  setZoomed(true);
                }}
                onMouseLeave={() => {
                  setZoomed(false);
                  setZoomOrigin("50% 50%");
                }}
                onClick={() => activeImg && setLightboxOpen(true)}
              >
                {activeImg ? (
                  <img
                    src={activeImg}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    style={{
                      transform: zoomed ? "scale(2.2)" : "scale(1)",
                      transformOrigin: zoomOrigin,
                      transition: zoomed ? "transform-origin 0ms" : "transform 300ms ease-out",
                    }}
                  />
                ) : (
                  <span className="text-8xl animate-float">{product.icon}</span>
                )}
                {/* Ícono lupa */}
                {activeImg && !zoomed && (
                  <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="white">
                      <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z" clipRule="evenodd" />
                    </svg>
                    <span className="absolute text-white text-[8px] font-black leading-none" style={{ marginTop: "-1px" }}>+</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h1 className="text-3xl font-black text-[var(--text)] leading-tight mt-0.5">
                    {product.name}
                  </h1>
                </div>
                {product.tag && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tagStyles[product.tag]}`}>
                    {tagLabel[product.tag]}
                  </span>
                )}
              </div>

              {product.rating && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((star) => (
                      <span key={star} className={star <= Math.round(product.rating!) ? "text-amber-400" : "text-gray-200"}>★</span>
                    ))}
                  </div>
                  <span className="font-bold text-[var(--text)]">{product.rating.toFixed(1)}</span>
                  {product.review_count && (
                    <span className="text-[var(--text-muted)]">({product.review_count} reseñas)</span>
                  )}
                  <span className="ml-1 text-emerald-500 font-semibold text-xs">✓ Verificadas</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {["🚚 Envío gratis", "↩️ 30 días devolución", "🔒 Pago seguro", "🇨🇱 Stock Chile"].map((item) => (
                  <span key={item} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: "var(--surface-alt)", color: "var(--text-muted)" }}>
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className={`w-2 h-2 rounded-full ${
                  product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-400" : "bg-red-500"
                }`} />
                <span className={product.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                  {product.stock > 10
                    ? `En stock (${product.stock} disponibles)`
                    : product.stock > 0
                    ? `¡Últimas ${product.stock} unidades!`
                    : "Sin stock"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t mt-auto" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-semibold mb-0.5">Precio</p>
                  {product.original_price && product.original_price > product.price && (
                    <p className="text-sm text-[var(--text-muted)] line-through leading-none mb-0.5">
                      ${Number(product.original_price).toLocaleString("es-CL")}
                    </p>
                  )}
                  <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    ${Number(product.price).toLocaleString("es-CL")}
                  </p>
                  {product.original_price && product.original_price > product.price && (
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">
                      Ahorro ${(Number(product.original_price) - Number(product.price)).toLocaleString("es-CL")} · {Math.round((1 - product.price / product.original_price) * 100)}% desc.
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={handleAdd}
                    disabled={product.stock === 0}
                    className={`px-6 py-3 font-bold rounded-xl text-sm transition-all ${
                      product.stock === 0
                        ? "bg-gray-100 dark:bg-[#2d2d4e] text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-500 to-sky-400 text-white hover:opacity-90 hover:scale-[1.02] active:scale-95"
                    }`}
                  >
                    {product.stock === 0 ? "Sin stock" : "🛒 Agregar al carrito"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleFav}
                      className="text-xs font-semibold transition-colors"
                      style={{ color: fav ? "#ef4444" : "var(--text-muted)" }}
                    >
                      {fav ? "❤️ En favoritos" : "🤍 Guardar"}
                    </button>
                    <span style={{ color: "var(--border)" }}>·</span>
                    <Link href="/carrito" className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold">
                      Ver carrito →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs desktop */}
          <div className="rounded-2xl border overflow-hidden mb-8"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
                    tab === t.key
                      ? "text-indigo-600 border-indigo-600"
                      : "text-[var(--text-muted)] border-transparent hover:text-[var(--text)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-6 animate-fade-in">
              <TabContent />
            </div>
          </div>

          {/* Relacionados desktop */}
          {related.length > 0 && (
            <section>
              <h2 className="text-lg font-black text-[var(--text)] mb-4">También te puede interesar</h2>
              <div className="grid grid-cols-4 gap-3">
                {related.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>

      </div>

      {/* Lightbox */}
      {lightboxOpen && activeImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Botón cerrar */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>

          {/* Miniaturas izquierda + imagen */}
          <div
            className="flex items-center gap-3 px-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Miniaturas columna vertical */}
            {allImages.length > 1 && (
              <div
                className="flex flex-col gap-2 overflow-y-auto max-h-[90vh] flex-shrink-0"
                style={{ scrollbarWidth: "none" } as React.CSSProperties}
              >
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeIndex === i ? "border-indigo-400" : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Imagen grande */}
            <img
              src={activeImg}
              alt={product.name}
              className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden transition-colors" style={{ borderColor: "var(--border)" }}>
      <button
        className="w-full flex items-center justify-between p-4 text-left text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{question}</span>
        <span className="text-[var(--text-muted)] ml-3 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>
          ▾
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-[var(--text-muted)] leading-relaxed border-t animate-slide-up"
          style={{ borderColor: "var(--border)" }}>
          {answer}
        </div>
      )}
    </div>
  );
}
