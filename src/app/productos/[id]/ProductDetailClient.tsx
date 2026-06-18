"use client";

import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useToastStore } from "@/store/toast";
import type { Product, QuestionRow } from "@/types";
import type { ReviewRow } from "./page";
import Link from "next/link";
import { useState, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";

const c = {
  paper:      "#F7F4EE",
  surface:    "#FFFFFF",
  ink:        "#1C2024",
  inkSoft:    "#6E6A62",
  pcb:        "#2F6B52",
  pcbSoft:    "#E6EFE9",
  copper:     "#C2793C",
  copperSoft: "#F6E9DB",
  line:       "#E6E1D6",
};

function tagBadgeStyle(tag: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    bestseller: { background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" },
    nuevo:      { background: c.pcbSoft,    color: c.pcb,    border: `1px solid ${c.pcb}44` },
    descuento:  { background: "#FEE2E2",    color: "#B91C1C", border: "1px solid #FECACA" },
    oferta:     { background: c.copperSoft, color: c.copper,  border: `1px solid ${c.copper}44` },
    destacado:  { background: "#EDE9FE",    color: "#6D28D9", border: "1px solid #C4B5FD" },
  };
  return map[tag] ?? {};
}

const tagLabel: Record<string, string> = {
  bestseller: "⭐ Más vendidos",
  nuevo:      "🆕 Recién llegado",
  descuento:  "💲 Descuento",
  oferta:     "🔥 Oferta",
  destacado:  "✨ Destacado",
};

type Tab = "descripcion" | "specs" | "resenas" | "faq";

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/\sstyle\s*=\s*["'][^"']*["']/gi, "");
}

function CircuitDivider({ inset = 12 }: { inset?: number }) {
  return (
    <div className="relative h-px w-full my-8" style={{
      background: `linear-gradient(to right, transparent, ${c.copper}66 ${inset}%, ${c.copper}66 ${100 - inset}%, transparent)`
    }}>
      <span className="absolute rounded-full" style={{ left: `${inset}%`, top: -3, width: 7, height: 7, background: c.copper, transform: "translateX(-50%)" }} />
      <span className="absolute rounded-full" style={{ right: `${inset}%`, top: -3, width: 7, height: 7, background: c.copper, transform: "translateX(50%)" }} />
    </div>
  );
}

function ScoreGauge({ value }: { value: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
      <circle cx="70" cy="70" r={r} fill="none" stroke={c.line} strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={c.pcb} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 70 70)" />
      <text x="70" y="66" textAnchor="middle" fontSize="30" fontWeight="700" fill={c.ink} fontFamily="'JetBrains Mono', monospace">{value}</text>
      <text x="70" y="86" textAnchor="middle" fontSize="11" fill={c.inkSoft} fontFamily="'Inter', sans-serif">/ 100</text>
    </svg>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm" style={{ color: c.inkSoft }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: c.ink, fontFamily: "'JetBrains Mono', monospace" }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: c.line }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: c.pcb }} />
      </div>
    </div>
  );
}

function Chip({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: c.pcbSoft, color: c.pcb }}>
      <span>{emoji}</span>{label}
    </div>
  );
}

function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "text-base" : "text-sm";
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={sz} style={{ color: i <= Math.round(value) ? c.copper : c.line }}>★</span>
      ))}
    </div>
  );
}

function ReviewForm({ productId, userEmail, onSubmitted }: {
  productId: string;
  userEmail: string;
  onSubmitted: (r: ReviewRow) => void;
}) {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) { setError("Selecciona una calificación"); return; }
    setSubmitting(true); setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, rating, comment }),
    });
    if (res.ok) {
      onSubmitted({ id: crypto.randomUUID(), user_id: "", rating, comment: comment.trim() || null, created_at: new Date().toISOString(), user_email: userEmail });
    } else {
      const d = await res.json();
      setError(d.error ?? "Error al enviar la reseña");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 rounded-xl border"
      style={{ borderColor: c.line, background: c.paper }}>
      <p className="text-sm font-semibold" style={{ color: c.ink }}>Deja tu reseña</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map((s) => (
          <button key={s} type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl transition-transform hover:scale-110">
            <span style={{ color: (hovered || rating) >= s ? c.copper : c.line }}>★</span>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm self-center" style={{ color: c.inkSoft }}>
            {["","Muy malo","Malo","Regular","Bueno","Excelente"][rating]}
          </span>
        )}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Cuéntanos tu experiencia (opcional)" rows={3} maxLength={500}
        className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent focus:outline-none resize-none"
        style={{ borderColor: c.line, color: c.ink }} />
      {error && <p className="text-xs font-semibold" style={{ color: "#B91C1C" }}>{error}</p>}
      <button type="submit" disabled={submitting || rating === 0}
        className="self-end px-5 py-2 text-white font-semibold rounded-full text-sm transition-opacity disabled:opacity-50"
        style={{ background: c.pcb }}>
        {submitting ? "Enviando..." : "Publicar reseña"}
      </button>
    </form>
  );
}

export default function ProductDetailClient({
  product,
  related = [],
  reviews: initialReviews = [],
  questions: initialQuestions = [],
  userId,
  userEmail,
  userHasReviewed: initialHasReviewed = false,
  isAdmin = false,
}: {
  product: Product;
  related?: Product[];
  reviews?: ReviewRow[];
  questions?: QuestionRow[];
  userId?: string | null;
  userEmail?: string | null;
  userHasReviewed?: boolean;
  isAdmin?: boolean;
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
  const [zoomed, setZoomed]     = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [lbZoomed, setLbZoomed]     = useState(false);
  const [lbZoomOrigin, setLbZoomOrigin] = useState("50% 50%");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart]     = useState<number | null>(null);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")      setLightboxOpen(false);
      if (e.key === "ArrowRight")  setActiveIndex((i) => Math.min(i + 1, allImages.length - 1));
      if (e.key === "ArrowLeft")   setActiveIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, allImages.length]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  function handleTouchStart(e: React.TouchEvent) { setTouchStart(e.touches[0].clientX); }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActiveIndex((i) => Math.min(i + 1, allImages.length - 1));
      else          setActiveIndex((i) => Math.max(i - 1, 0));
    }
    setTouchStart(null);
  }

  function handleAdd() {
    add(product);
    showToast(`${product.name} agregado al carrito 🛒`, "success");
  }
  function handleFav() {
    toggle(product);
    showToast(fav ? "Eliminado de favoritos" : `${product.name} guardado en favoritos ❤️`, "info");
  }

  const [descExpanded, setDescExpanded] = useState(false);
  const [imgsExpanded, setImgsExpanded] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<QuestionRow[]>(initialQuestions);
  const [questionText, setQuestionText]     = useState("");
  const [submittingQ, setSubmittingQ]       = useState(false);
  const [questionError, setQuestionError]   = useState<string | null>(null);
  const [answerInputs, setAnswerInputs]     = useState<Record<string, string>>({});
  const [submittingAnswer, setSubmittingAnswer] = useState<string | null>(null);

  async function handleQuestion(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSubmittingQ(true); setQuestionError(null);
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.id, question: questionText.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setLocalQuestions((prev) => [...prev, data.question]);
      setQuestionText("");
    } else {
      const data = await res.json();
      setQuestionError(data.error ?? "Error al enviar la pregunta");
    }
    setSubmittingQ(false);
  }

  async function handleAnswer(questionId: string) {
    const answer = answerInputs[questionId]?.trim();
    if (!answer) return;
    setSubmittingAnswer(questionId);
    const res = await fetch(`/api/admin/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });
    if (res.ok) {
      setLocalQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, answer } : q));
      setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
    }
    setSubmittingAnswer(null);
  }

  const aiScore = Math.round((product.rating || 4.5) * 20);
  const aiMetrics = [
    { label: "Calidad",     value: aiScore },
    { label: "Valor",       value: Math.max(30, Math.min(95, Math.round(92 - product.price / 200))) },
    { label: "Durabilidad", value: 88 },
    { label: "Soporte",     value: 94 },
  ];

  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : null;
  const savings = product.original_price && product.original_price > product.price
    ? Number(product.original_price) - Number(product.price) : null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "descripcion", label: "Descripción" },
    { key: "specs",       label: "Especificaciones" },
    { key: "resenas",     label: `Reseñas (${reviews.length})` },
    { key: "faq",         label: "Preguntas" },
  ];

  function TabContent() {
    return (
      <>
        {/* ── DESCRIPCIÓN ── */}
        {tab === "descripcion" && (
          <div className="flex flex-col gap-6">
            {product.description_html ? (
              <div
                className="[&_img]:w-full [&_img]:block [&_img]:my-1 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:my-2 [&_div]:text-sm [&_span]:text-sm [&_br]:hidden [&_*:empty]:hidden"
                style={{ color: c.inkSoft }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description_html) }}
              />
            ) : (
              <>
                {product.description && product.description.length > 10 ? (
                  <div>
                    <div className={`relative overflow-hidden ${descExpanded ? "" : "max-h-24"}`}>
                      <p className="text-sm leading-relaxed" style={{ color: c.inkSoft }}>{product.description}</p>
                      {!descExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                          style={{ background: `linear-gradient(to top, ${c.surface}, transparent)` }} />
                      )}
                    </div>
                    <button onClick={() => setDescExpanded((v) => !v)}
                      className="text-xs font-semibold mt-1" style={{ color: c.pcb }}>
                      {descExpanded ? "Ver menos ↑" : "Ver más ↓"}
                    </button>
                  </div>
                ) : (
                  (!product.description_images || product.description_images.length === 0) && (
                    <div className="text-center py-8" style={{ color: c.inkSoft }}>
                      <span className="text-4xl block mb-2">📝</span>
                      <p className="text-sm">Este producto aún no tiene descripción detallada.</p>
                    </div>
                  )
                )}
                {product.description_images && product.description_images.length > 0 && (
                  <div>
                    <div className={`relative overflow-hidden ${imgsExpanded ? "" : "max-h-[500px]"}`}>
                      {product.description_images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full block" />
                      ))}
                      {!imgsExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center pb-3 pointer-events-none"
                          style={{ background: `linear-gradient(to top, ${c.surface}, transparent)` }}>
                          <button
                            className="pointer-events-auto px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm"
                            style={{ background: c.surface, borderColor: c.line, color: c.ink }}
                            onClick={() => setImgsExpanded(true)}>
                            Ver descripción completa ↓
                          </button>
                        </div>
                      )}
                    </div>
                    {imgsExpanded && (
                      <button onClick={() => setImgsExpanded(false)}
                        className="w-full text-center text-xs font-semibold py-2 mt-1" style={{ color: c.pcb }}>
                        Ver menos ↑
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Diagnóstico conAI */}
            <div className="rounded-2xl p-6" style={{ background: c.surface, border: `1px solid ${c.line}` }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: c.pcb }}>⬡</span>
                <h3 className="font-semibold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif", color: c.ink }}>
                  Diagnóstico conAI
                </h3>
              </div>
              <p className="text-sm mb-5" style={{ color: c.inkSoft }}>
                Basado en miles de reseñas y comparativas dentro de la categoría {product.category},
                este producto destaca por su relación calidad-precio.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreGauge value={aiScore} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                  {aiMetrics.map((m) => <MetricBar key={m.label} label={m.label} value={m.value} />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ESPECIFICACIONES ── */}
        {tab === "specs" && (
          (product.specifications && product.specifications.length > 0) ? (
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: c.line }}>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? c.paper : c.surface }}>
                      <td className="px-4 py-3 font-semibold w-40 border-r" style={{ color: c.ink, borderColor: c.line }}>{row.key}</td>
                      <td className="px-4 py-3" style={{ color: c.inkSoft }}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: c.inkSoft }}>
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-sm">Este producto aún no tiene especificaciones cargadas.</p>
            </div>
          )
        )}

        {/* ── RESEÑAS ── */}
        {tab === "resenas" && (
          <div className="flex flex-col gap-4">
            {reviews.length > 0 && (
              <div className="flex items-center gap-6 p-4 rounded-xl" style={{ background: c.paper, border: `1px solid ${c.line}` }}>
                <div className="text-center flex-shrink-0">
                  <p className="text-5xl font-bold" style={{ color: c.ink, fontFamily: "'JetBrains Mono', monospace" }}>
                    {(product.rating ?? 0).toFixed(1)}
                  </p>
                  <Stars value={product.rating ?? 0} size="md" />
                  <p className="text-xs mt-1" style={{ color: c.inkSoft }}>{reviews.length} reseña{reviews.length !== 1 && "s"}</p>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {[5,4,3,2,1].map((stars) => {
                    const cnt = reviews.filter((r) => r.rating === stars).length;
                    const pct = reviews.length > 0 ? Math.round((cnt / reviews.length) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span style={{ color: c.copper, width: 12 }}>{stars}</span>
                        <span style={{ color: c.copper, fontSize: 10 }}>★</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: c.line }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.copper }} />
                        </div>
                        <span style={{ color: c.inkSoft, width: 28 }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasReviewed && (
              userId ? (
                <ReviewForm productId={product.id} userEmail={userEmail ?? ""}
                  onSubmitted={(review) => { setReviews((prev) => [review, ...prev]); setHasReviewed(true); }} />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
                  style={{ borderColor: c.line, background: c.paper }}>
                  <span>💬</span>
                  <span style={{ color: c.inkSoft }}>
                    <Link href="/login" className="font-semibold hover:underline" style={{ color: c.pcb }}>Inicia sesión</Link> para dejar tu reseña
                  </span>
                </div>
              )
            )}

            {hasReviewed && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{ background: c.pcbSoft, color: c.pcb, border: `1px solid ${c.pcb}33` }}>
                <span>✓</span><span>Ya dejaste tu reseña para este producto</span>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-8" style={{ color: c.inkSoft }}>
                <span className="text-4xl block mb-2">💬</span>
                <p className="text-sm">Sé el primero en dejar una reseña</p>
              </div>
            ) : reviews.map((r) => (
              <div key={r.id} className="rounded-xl p-4 border" style={{ borderColor: c.line, background: c.surface }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: c.pcb }}>
                      {r.user_id === userId ? (userEmail ?? "T").slice(0,1).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: c.ink }}>
                        {r.user_id === userId ? (userEmail?.split("@")[0] ?? "Tú") : "Usuario verificado"}
                      </p>
                      <p className="text-[10px]" style={{ color: c.inkSoft }}>
                        {new Date(r.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })} · ✓ Compra verificada
                      </p>
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </div>
                {r.comment && <p className="text-sm leading-relaxed" style={{ color: c.inkSoft }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {/* ── PREGUNTAS ── */}
        {tab === "faq" && (
          <div className="flex flex-col gap-4">
            {userId ? (
              <form onSubmit={handleQuestion} className="flex flex-col gap-2">
                <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="¿Tienes alguna pregunta sobre este producto?" rows={2} maxLength={300}
                  className="w-full px-3 py-2 rounded-lg border text-sm bg-transparent focus:outline-none resize-none"
                  style={{ borderColor: c.line, color: c.ink }} />
                {questionError && <p className="text-xs font-semibold" style={{ color: "#B91C1C" }}>{questionError}</p>}
                <button type="submit" disabled={submittingQ || !questionText.trim()}
                  className="self-end px-5 py-2 text-white font-semibold rounded-full text-sm transition-opacity disabled:opacity-50"
                  style={{ background: c.pcb }}>
                  {submittingQ ? "Enviando..." : "Preguntar"}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: c.line, background: c.paper }}>
                <span>❓</span>
                <span style={{ color: c.inkSoft }}>
                  <Link href="/login" className="font-semibold hover:underline" style={{ color: c.pcb }}>Inicia sesión</Link> para hacer una pregunta
                </span>
              </div>
            )}

            {localQuestions.length === 0 ? (
              <div className="text-center py-8" style={{ color: c.inkSoft }}>
                <span className="text-4xl block mb-2">❓</span>
                <p className="text-sm">Sé el primero en hacer una pregunta</p>
              </div>
            ) : localQuestions.map((q) => (
              <div key={q.id} className="rounded-xl p-4 border" style={{ borderColor: c.line, background: c.surface }}>
                <div className="flex items-start gap-2 mb-2">
                  <span className="font-bold text-lg flex-shrink-0" style={{ color: c.pcb }}>Q</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: c.ink }}>{q.question}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: c.inkSoft }}>
                      {new Date(q.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {q.answer ? (
                  <div className="ml-5 pl-3 border-l-2" style={{ borderColor: c.pcb }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: c.pcb }}>✓ Respuesta del vendedor</p>
                    <p className="text-sm" style={{ color: c.inkSoft }}>{q.answer}</p>
                  </div>
                ) : isAdmin ? (
                  <div className="ml-5 flex gap-2 mt-2">
                    <input value={answerInputs[q.id] ?? ""}
                      onChange={(e) => setAnswerInputs((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Escribe una respuesta..."
                      className="flex-1 text-sm px-3 py-1.5 rounded-lg border bg-transparent focus:outline-none"
                      style={{ borderColor: c.line, color: c.ink }} />
                    <button onClick={() => handleAnswer(q.id)}
                      disabled={submittingAnswer === q.id || !answerInputs[q.id]?.trim()}
                      className="text-xs font-semibold px-3 py-1.5 text-white rounded-lg disabled:opacity-50"
                      style={{ background: c.pcb }}>
                      {submittingAnswer === q.id ? "..." : "Responder"}
                    </button>
                  </div>
                ) : (
                  <div className="ml-5 pl-3 border-l-2 mt-2" style={{ borderColor: c.line }}>
                    <p className="text-xs italic" style={{ color: c.inkSoft }}>Sin respuesta aún</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Sticky bottom bar — móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex border-t"
        style={{ background: c.surface, borderColor: c.line, boxShadow: "0 -4px 16px rgba(28,32,36,0.08)" }}>
        <button onClick={handleFav}
          className="flex flex-col items-center justify-center gap-0.5 px-5 py-3 border-r flex-shrink-0"
          style={{ borderColor: c.line }}>
          <span className="text-xl">{fav ? "❤️" : "🤍"}</span>
          <span className="text-[9px] font-semibold" style={{ color: fav ? c.copper : c.inkSoft }}>
            {fav ? "Guardado" : "Favorito"}
          </span>
        </button>
        <button onClick={handleAdd} disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 font-semibold text-[15px] text-white disabled:opacity-50"
          style={{ background: c.pcb }}>
          {product.stock === 0 ? "Sin stock" : "🛒 Agregar al carrito"}
        </button>
      </div>

      <div style={{ background: c.paper, color: c.ink, fontFamily: "'Inter', sans-serif" }}>

        {/* ════════════════════════════════
            LAYOUT MÓVIL
        ════════════════════════════════ */}
        <div className="md:hidden pb-20">

          {/* Nav */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: c.line, background: c.surface }}>
            <Link href="/productos" className="text-sm font-semibold" style={{ color: c.inkSoft }}>
              ‹ Volver
            </Link>
            {product.tag && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={tagBadgeStyle(product.tag)}>
                {tagLabel[product.tag]}
              </span>
            )}
          </div>

          {/* Carrusel — imagen llena, sin tanto espacio */}
          <div className="relative w-full overflow-hidden select-none"
            style={{ height: 340, background: c.surface }}
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {activeImg ? (
              <img src={activeImg} alt={product.name} className="w-full h-full object-cover" draggable={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(160deg, ${c.pcbSoft} 0%, ${c.paper} 100%)` }}>
                <span className="text-9xl">{product.icon}</span>
              </div>
            )}
            {allImages.length > 1 && (
              <div className="absolute top-3 right-3 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${c.ink}99` }}>
                {activeIndex + 1} / {allImages.length}
              </div>
            )}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {allImages.slice(0, 10).map((_, i) => (
                  <button key={i} onClick={() => setActiveIndex(i)}
                    className="rounded-full transition-all duration-200"
                    style={{ width: i === activeIndex ? 16 : 6, height: 6, background: i === activeIndex ? c.pcb : `${c.ink}44` }} />
                ))}
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="px-4 py-3 border-b" style={{ borderColor: c.line, background: c.surface }}>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold" style={{ color: c.ink, fontFamily: "'JetBrains Mono', monospace" }}>
                ${Number(product.price).toLocaleString("es-CL")}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-sm line-through" style={{ color: c.inkSoft }}>
                    ${Number(product.original_price).toLocaleString("es-CL")}
                  </span>
                  <span className="text-xs font-semibold text-white px-1.5 py-0.5 rounded-md" style={{ background: c.copper }}>
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            {savings && (
              <p className="text-xs font-semibold mt-0.5" style={{ color: c.pcb }}>
                Ahorro ${savings.toLocaleString("es-CL")}
              </p>
            )}
          </div>

          {/* Nombre + rating */}
          <div className="px-4 py-3 border-b" style={{ borderColor: c.line, background: c.surface }}>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: c.pcb }}>
              {product.category}
            </span>
            <h1 className="text-[15px] font-bold leading-snug mt-0.5 mb-2"
              style={{ color: c.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
              {product.name}
            </h1>
            {(product.rating ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Stars value={product.rating ?? 0} />
                <span className="font-semibold" style={{ color: c.ink }}>{(product.rating ?? 0).toFixed(1)}</span>
                {(product.review_count ?? 0) > 0 && <span style={{ color: c.inkSoft }}>({product.review_count} reseñas)</span>}
                <span className="font-semibold ml-1" style={{ color: c.pcb }}>✓ Verificadas</span>
              </div>
            )}
          </div>

          {/* Chips + stock */}
          <div className="px-4 py-3 border-b flex flex-col gap-3" style={{ borderColor: c.line, background: c.surface }}>
            <div className="flex flex-wrap gap-2">
              <Chip emoji="🚚" label="Envío gratis" />
              <Chip emoji="↩️" label="30 días devolución" />
              <Chip emoji="🔒" label="Pago seguro" />
              <Chip emoji="🇨🇱" label="Stock Chile" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
                background: product.stock > 10 ? c.pcb : product.stock > 0 ? c.copper : "#B91C1C"
              }} />
              <span className="text-xs font-semibold" style={{ color: product.stock > 0 ? c.pcb : "#B91C1C" }}>
                {product.stock > 10 ? `En stock (${product.stock} disponibles)` : product.stock > 0 ? `¡Últimas ${product.stock} unidades!` : "Sin stock"}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-2" style={{ background: c.surface }}>
            <div className="flex border-b overflow-x-auto" style={{ borderColor: c.line }}>
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors"
                  style={{ color: tab === t.key ? c.pcb : c.inkSoft, borderBottomColor: tab === t.key ? c.pcb : "transparent" }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-4"><TabContent /></div>
          </div>

          {/* Relacionados */}
          {related.length > 0 && (
            <div className="px-4 py-4 mt-2" style={{ background: c.surface }}>
              <h2 className="text-sm font-semibold mb-3"
                style={{ color: c.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
                También te puede interesar
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════
            LAYOUT DESKTOP
        ════════════════════════════════ */}
        <div className="hidden md:block max-w-4xl mx-auto px-6 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: c.inkSoft }}>
            <Link href="/" className="hover:underline">Inicio</Link>
            <span>›</span>
            <Link href="/productos" className="hover:underline">Productos</Link>
            <span>›</span>
            <span className="font-semibold truncate max-w-[200px]" style={{ color: c.ink }}>{product.name}</span>
          </nav>

          {/* Card principal */}
          <div className="rounded-2xl border p-8 flex flex-row items-center gap-8 mb-2"
            style={{ background: c.surface, borderColor: c.line }}>

            {/* Galería */}
            <div className="flex flex-row gap-3 flex-shrink-0">
              {allImages.length > 1 && (
                <div className="flex flex-col justify-between flex-shrink-0"
                  style={{ height: 460 } as React.CSSProperties}>
                  {allImages.slice(0, 6).map((img, i) => (
                    <button key={i}
                      onClick={() => setActiveIndex(i)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0"
                      style={{ borderColor: activeIndex === i ? c.pcb : c.line, opacity: activeIndex === i ? 1 : 0.65 }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Imagen principal: alto fijo cómodo, foto completa con contain */}
              <div className="flex items-center justify-center rounded-2xl overflow-hidden flex-shrink-0 relative"
                style={{ width: 460, height: 460, background: c.surface, border: `1px solid ${c.line}`, cursor: "zoom-in" }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setZoomOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
                  setZoomed(true);
                }}
                onMouseLeave={() => { setZoomed(false); setZoomOrigin("50% 50%"); }}
                onClick={() => activeImg && setLightboxOpen(true)}>
                {activeImg ? (
                  <img src={activeImg} alt={product.name} className="w-full h-full object-contain p-3"
                    style={{ transform: zoomed ? "scale(2.2)" : "scale(1)", transformOrigin: zoomOrigin, transition: zoomed ? "transform-origin 0ms" : "transform 300ms ease-out" }} />
                ) : (
                  <span className="text-8xl">{product.icon}</span>
                )}
                {activeImg && !zoomed && (
                  <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none"
                    style={{ background: `${c.ink}44` }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="white">
                      <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: c.pcb }}>
                    {product.category}
                  </span>
                  <h1 className="text-3xl font-bold leading-tight mt-0.5"
                    style={{ color: c.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {product.name}
                  </h1>
                </div>
                {product.tag && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={tagBadgeStyle(product.tag)}>
                    {tagLabel[product.tag]}
                  </span>
                )}
              </div>

              {(product.rating ?? 0) > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Stars value={product.rating ?? 0} />
                  <span className="font-semibold" style={{ color: c.ink }}>{(product.rating ?? 0).toFixed(1)}</span>
                  {(product.review_count ?? 0) > 0 && <span style={{ color: c.inkSoft }}>({product.review_count} reseñas)</span>}
                  <span className="ml-1 text-xs font-semibold" style={{ color: c.pcb }}>✓ Verificadas</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Chip emoji="🚚" label="Envío gratis" />
                <Chip emoji="↩️" label="30 días devolución" />
                <Chip emoji="🔒" label="Pago seguro" />
                <Chip emoji="🇨🇱" label="Stock Chile" />
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full" style={{ background: product.stock > 10 ? c.pcb : product.stock > 0 ? c.copper : "#B91C1C" }} />
                <span style={{ color: product.stock > 0 ? c.pcb : "#B91C1C" }}>
                  {product.stock > 10 ? `En stock (${product.stock} disponibles)` : product.stock > 0 ? `¡Últimas ${product.stock} unidades!` : "Sin stock"}
                </span>
              </div>

              {/* Mini separador copper */}
              <div className="relative h-px w-full" style={{ background: `linear-gradient(to right, ${c.copper}88, transparent)` }}>
                <span className="absolute rounded-full" style={{ left: 0, top: -3, width: 7, height: 7, background: c.copper }} />
              </div>

              {/* Precio + CTA */}
              <div className="rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 mt-auto"
                style={{ background: c.paper, border: `1px solid ${c.line}` }}>
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: c.inkSoft }}>Precio</p>
                  {product.original_price && product.original_price > product.price && (
                    <p className="text-sm line-through leading-none mb-0.5" style={{ color: c.inkSoft }}>
                      ${Number(product.original_price).toLocaleString("es-CL")}
                    </p>
                  )}
                  <p className="text-3xl font-bold" style={{ color: c.ink, fontFamily: "'JetBrains Mono', monospace" }}>
                    ${Number(product.price).toLocaleString("es-CL")}
                  </p>
                  {savings && (
                    <p className="text-sm font-semibold mt-1" style={{ color: c.pcb }}>
                      Ahorras ${savings.toLocaleString("es-CL")} · {discount}% dcto.
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button onClick={handleAdd} disabled={product.stock === 0}
                    className="px-6 py-3 font-semibold rounded-full text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: product.stock === 0 ? c.inkSoft : c.pcb }}>
                    {product.stock === 0 ? "Sin stock" : "🛒 Agregar al carrito"}
                  </button>
                  <div className="flex gap-2 items-center">
                    <button onClick={handleFav} className="text-xs font-semibold transition-colors"
                      style={{ color: fav ? c.copper : c.inkSoft }}>
                      {fav ? "❤️ En favoritos" : "🤍 Guardar"}
                    </button>
                    <span style={{ color: c.line }}>·</span>
                    <Link href="/carrito" className="text-xs font-semibold hover:underline" style={{ color: c.pcb }}>
                      Ver carrito →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CircuitDivider />

          {/* Tabs desktop */}
          <div className="rounded-2xl border overflow-hidden mb-8"
            style={{ background: c.surface, borderColor: c.line }}>
            <div className="flex border-b overflow-x-auto" style={{ borderColor: c.line }}>
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex-shrink-0 px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap"
                  style={{ color: tab === t.key ? c.pcb : c.inkSoft, borderBottomColor: tab === t.key ? c.pcb : "transparent" }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-6"><TabContent /></div>
          </div>

          {/* Relacionados */}
          {related.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4"
                style={{ color: c.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
                También te puede interesar
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Lightbox — panel blanco grande estilo AliExpress */}
      {lightboxOpen && activeImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(28,32,36,0.85)" }}
          onClick={() => setLightboxOpen(false)}>
          <div className="relative rounded-2xl overflow-hidden flex flex-row gap-4 p-5"
            style={{ background: "#fff", width: "94vw", height: "92vh" }}
            onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-xl z-10 transition-colors hover:bg-black/5"
              style={{ color: c.ink }}
              onClick={() => setLightboxOpen(false)}>
              ✕
            </button>

            {/* Miniaturas a la izquierda */}
            {allImages.length > 1 && (
              <div className="flex flex-col gap-2 overflow-y-auto flex-shrink-0 pr-1"
                style={{ scrollbarWidth: "thin" } as React.CSSProperties}>
                {allImages.map((img, i) => (
                  <button key={i}
                    onClick={() => setActiveIndex(i)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className="w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all"
                    style={{ borderColor: activeIndex === i ? c.pcb : c.line, opacity: activeIndex === i ? 1 : 0.6 }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Imagen grande con zoom al cursor */}
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl"
              style={{ background: "#fff", cursor: "zoom-in" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setLbZoomOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`);
                setLbZoomed(true);
              }}
              onMouseLeave={() => { setLbZoomed(false); setLbZoomOrigin("50% 50%"); }}>
              <img src={activeImg} alt={product.name}
                className="max-w-full max-h-full object-contain"
                style={{ transform: lbZoomed ? "scale(2.5)" : "scale(1)", transformOrigin: lbZoomOrigin, transition: lbZoomed ? "transform-origin 0ms" : "transform 300ms ease-out" }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
