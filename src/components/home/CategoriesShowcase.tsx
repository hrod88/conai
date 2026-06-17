"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { motion, useInView } from "framer-motion";
import {
  Heart, Sparkles, House, Watch, PawPrint, Bot, Headphones, Briefcase,
  ToyBrick, Dumbbell, Plug, Smartphone, type LucideIcon,
} from "lucide-react";

// ── Datos de categorías (con span para el bento asimétrico) ──────────────────
// span: cuántas columnas ocupa en desktop. Mezclar 2 y 1 crea el ritmo bento.
type Cat = {
  value: string; label: string; icon: LucideIcon; desc: string;
  from: string; to: string; span: 1 | 2;
};

const categories: Cat[] = [
  { value: "salud",       label: "Salud",       icon: Heart,      desc: "Smartwatches, anillos y sensores",         from: "#3b82f6", to: "#6366f1", span: 2 },
  { value: "belleza",     label: "Belleza",      icon: Sparkles,   desc: "Dispositivos faciales con IA",             from: "#a855f7", to: "#ec4899", span: 1 },
  { value: "audio",       label: "Audio",        icon: Headphones, desc: "Auriculares, parlantes y altavoces IA",    from: "#f97316", to: "#eab308", span: 1 },
  { value: "hogar",       label: "Hogar",        icon: House,      desc: "Robots, cámaras y termostatos",            from: "#10b981", to: "#0ea5e9", span: 1 },
  { value: "gadgets",     label: "Gadgets",      icon: Bot,        desc: "Drones, impresoras 3D y más",              from: "#10b981", to: "#0ea5e9", span: 2 },
  { value: "wearables",   label: "Wearables",    icon: Watch,      desc: "Relojes, gafas y accesorios IA",           from: "#f59e0b", to: "#ef4444", span: 1 },
  { value: "telefonos",   label: "Teléfonos",    icon: Smartphone, desc: "Accesorios para smartphones",              from: "#0ea5e9", to: "#6366f1", span: 1 },
  { value: "oficina",     label: "Oficina",      icon: Briefcase,  desc: "Teclados, monitores y accesorios IA",      from: "#8b5cf6", to: "#06b6d4", span: 2 },
  { value: "mascotas",    label: "Mascotas",     icon: PawPrint,   desc: "GPS, cámaras y alimentadores",             from: "#10b981", to: "#0ea5e9", span: 1 },
  { value: "juguetes",    label: "Juguetes",     icon: ToyBrick,   desc: "Juguetes educativos y tecnológicos",       from: "#f43f5e", to: "#fb923c", span: 1 },
  { value: "deportes",    label: "Deportes",     icon: Dumbbell,   desc: "Accesorios deportivos con IA",             from: "#22c55e", to: "#0ea5e9", span: 1 },
  { value: "electronica", label: "Electrónica",  icon: Plug,       desc: "Gadgets y electrónica de consumo",         from: "#64748b", to: "#6366f1", span: 1 },
];

// ── Tarjeta individual con tilt 3D al mouse (CSS puro, sin librería 3D) ───────
function CategoryCard({ cat, index }: { cat: Cat; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  // Tilt 3D + brillo que sigue al cursor. Más marcado para que se note bien.
  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0 .. 1
    const py = (e.clientY - rect.top) / rect.height;   // 0 .. 1
    const x = px - 0.5;                                 // -0.5 .. 0.5
    const y = py - 0.5;
    const max = 14; // grados de inclinación (marcado pero no mareante)
    el.style.transform = `perspective(650px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-6px) scale(1.02)`;
    // Brillo: foco de luz que sigue el cursor sobre la tarjeta
    el.style.setProperty("--glow-x", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--glow-y", `${(py * 100).toFixed(1)}%`);
  }
  function handleMouseLeave() {
    const el = ref.current;
    if (el) el.style.transform = "perspective(650px) rotateX(0) rotateY(0) translateY(0) scale(1)";
  }

  const Icon = cat.icon;
  const isWide = cat.span === 2;

  return (
    <motion.div
      // Scroll reveal encadenado más marcado: entra desde más abajo, más lento,
      // y con mayor separación entre tarjetas para que se note la cascada.
      initial={{ opacity: 0, y: 64, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{ gridColumn: `span ${cat.span}` } as CSSProperties}
      className="min-h-[150px]"
    >
      <Link
        ref={ref}
        href={`/productos?cat=${cat.value}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative flex h-full overflow-hidden rounded-3xl border p-5 will-change-transform"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          transition: "transform 0.18s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
        }}
      >
        {/* Gradiente de color que se intensifica al hover */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `linear-gradient(135deg, ${cat.from}16, ${cat.to}12)` }}
        />
        {/* Brillo que sigue el cursor (usa las variables --glow-x/y del tilt) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(220px circle at var(--glow-x,50%) var(--glow-y,50%), ${cat.from}22, transparent 60%)`,
          }}
        />
        {/* Glow de color en la esquina */}
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
          style={{ background: `radial-gradient(circle, ${cat.from}, transparent 70%)` }}
        />

        {/* Layout: vertical en las chicas, horizontal en las anchas (llena el ancho) */}
        <div className={`relative flex w-full ${isWide ? "flex-row items-center gap-5" : "flex-col justify-between"}`}>
          <span
            className="inline-flex flex-shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
            style={{
              width: isWide ? 64 : 48,
              height: isWide ? 64 : 48,
              background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`,
              boxShadow: `0 8px 20px ${cat.from}40`,
            }}
          >
            <Icon size={isWide ? 32 : 24} strokeWidth={2.2} color="#fff" />
          </span>

          <div className={isWide ? "flex-1" : "mt-3"}>
            <p
              className="font-black text-[var(--text)]"
              style={{ fontSize: isWide ? "1.4rem" : "1rem" }}
            >
              {cat.label}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-[var(--text-muted)]">{cat.desc}</p>
            <span
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold transition-all duration-300 group-hover:gap-2"
              style={{ color: cat.from }}
            >
              Ver categoría
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesShowcase() {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: "-80px" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
      {/* Encabezado con su propio reveal */}
      <motion.div
        ref={headRef}
        initial={{ opacity: 0, y: 24 }}
        animate={headInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 text-center md:mb-12"
      >
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-500">Explora</p>
        <h2 className="text-3xl font-black text-[var(--text)] md:text-4xl">Categorías</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-muted)]">
          Tecnología e innovación, organizada para que encuentres justo lo que buscas.
        </p>
      </motion.div>

      {/* Bento asimétrico: 2 cols en móvil, 4 en desktop; las span-2 rompen el ritmo */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {categories.map((cat, i) => (
          <CategoryCard key={cat.value} cat={cat} index={i} />
        ))}
      </div>
    </section>
  );
}
