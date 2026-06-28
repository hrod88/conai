// src/app/[categoria]/[subcategoria]/page.tsx
// ─────────────────────────────────────────────────────────────────────────
// Página dedicada e independiente por subcategoría.
// URL: /salud/tension, /telefonos/smartphones, /belleza/facial, etc.
// Lee los params de la ruta, consulta Supabase, y renderiza el diseño
// limpio tipo AliExpress (sidebar filtros + grid de tarjetas).
// ─────────────────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SubcategoryClient from "./SubcategoryClient";

// ── Meta de categorías ──────────────────────────────────────────────────
const CAT_META: Record<string, {
  label: string; color: string; bg: string; gradient: string;
  subcats: Record<string, string>; // slug → label
}> = {
  salud: {
    label: "Salud & Bienestar", color: "#dc2626",
    bg: "#fff5f5", gradient: "linear-gradient(135deg,#dc2626,#f97316)",
    subcats: { ecg:"Relojes & ECG", glucometro:"Glucómetros", masaje:"Masajeadores", oximetro:"Oxímetros", tension:"Tensiómetros Smart" },
  },
  belleza: {
    label: "Belleza Tech", color: "#a855f7",
    bg: "#fdf4ff", gradient: "linear-gradient(135deg,#a855f7,#ec4899)",
    subcats: { facial:"Masaje Facial Smart", ipl:"Depilación IPL" },
  },
  hogar: {
    label: "Hogar Inteligente", color: "#10b981",
    bg: "#f0fdf4", gradient: "linear-gradient(135deg,#10b981,#0ea5e9)",
    subcats: { robots:"Robots del Hogar" },
  },
  wearables: {
    label: "Wearables", color: "#6366f1",
    bg: "#eef2ff", gradient: "linear-gradient(135deg,#6366f1,#38bdf8)",
    subcats: { gafas:"Gafas Smart", smartwatch:"Smartwatches", fitness:"Fitness Trackers", anillos:"Smart Rings" },
  },
  mascotas: {
    label: "Mascotas Tech", color: "#0ea5e9",
    bg: "#f0f9ff", gradient: "linear-gradient(135deg,#0ea5e9,#22c55e)",
    subcats: { comedero:"Comederos Automáticos" },
  },
  gadgets: {
    label: "Gadgets", color: "#64748b",
    bg: "#f8fafc", gradient: "linear-gradient(135deg,#475569,#334155)",
    subcats: { accesorios:"Accesorios Tech" },
  },
  audio: {
    label: "Audio", color: "#f97316",
    bg: "#fff7ed", gradient: "linear-gradient(135deg,#f97316,#fbbf24)",
    subcats: { traductores:"Traductores en Tiempo Real", auriculares:"Auriculares ANC", parlantes:"Parlantes Inteligentes" },
  },
  oficina: {
    label: "Oficina", color: "#8b5cf6",
    bg: "#f5f3ff", gradient: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    subcats: { teclados:"Teclados & Ratones", webcams:"Webcams con IA", productividad:"Gadgets de Productividad" },
  },
  deportes: {
    label: "Deportes", color: "#22c55e",
    bg: "#f0fdf4", gradient: "linear-gradient(135deg,#22c55e,#16a34a)",
    subcats: { "relojes-dep":"Relojes Deportivos", "equipos-dep":"Equipos con IA" },
  },
  juguetes: {
    label: "Juguetes Tech", color: "#f43f5e",
    bg: "#fff1f2", gradient: "linear-gradient(135deg,#f43f5e,#f97316)",
    subcats: { educativos:"Juguetes Educativos", "robots-edu":"Robots Educativos", stem:"STEM & Coding" },
  },
  telefonos: {
    label: "Teléfonos", color: "#0ea5e9",
    bg: "#f0f9ff", gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)",
    subcats: { smartphones:"Smartphones IA", fundas:"Fundas Inteligentes", "accesorios-tel":"Accesorios Smart" },
  },
  electronica: {
    label: "Electrónica", color: "#475569",
    bg: "#f8fafc", gradient: "linear-gradient(135deg,#334155,#6366f1)",
    subcats: { "accesorios-elec":"Accesorios Smart", streaming:"Streaming & Smart TV", tablets:"Tablets Smart" },
  },
};

export const dynamic = "force-dynamic";

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ categoria: string; subcategoria: string }>;
}) {
  const { categoria, subcategoria } = await params;

  // Validar que la categoría existe
  const catMeta = CAT_META[categoria];
  if (!catMeta) notFound();

  const subcatLabel = catMeta.subcats[subcategoria] ?? subcategoria;

  const supabase = await createClient();

  // Consultar solo los productos de esta subcategoría
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .neq("active", false)
    .eq("category", categoria)
    .eq("subcategory", subcategoria)
    .order("created_at", { ascending: false });

  // También traer todos los de la categoría para los conteos del sidebar
  const { data: allCatProducts } = await supabase
    .from("products")
    .select("id, subcategory, price, original_price, rating, stock")
    .neq("active", false)
    .eq("category", categoria);

  return (
    <SubcategoryClient
      products={products ?? []}
      allCatProducts={allCatProducts ?? []}
      categoria={categoria}
      subcategoria={subcategoria}
      catMeta={catMeta}
      subcatLabel={subcatLabel}
    />
  );
}