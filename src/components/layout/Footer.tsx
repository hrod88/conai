import Link from "next/link";

const col1 = [
  { label: "Todos los productos", href: "/productos" },
  { label: "Salud & Bienestar", href: "/productos?cat=salud" },
  { label: "Belleza Tech", href: "/productos?cat=belleza" },
  { label: "Hogar Inteligente", href: "/productos?cat=hogar" },
  { label: "Mascotas Tech", href: "/productos?cat=mascotas" },
  { label: "Gadgets", href: "/productos?cat=gadgets" },
];

const col2 = [
  { label: "Mi carrito", href: "/carrito" },
  { label: "Mis favoritos", href: "/favoritos" },
  { label: "Iniciar sesión", href: "/login" },
];

const col3 = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
  { label: "Política de envíos", href: "/envios" },
  { label: "Devoluciones", href: "/devoluciones" },
  { label: "Términos de uso", href: "/terminos" },
];

export default function Footer() {
  return (
    <footer
      className="border-t mt-auto"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="text-2xl font-black gradient-text w-fit">
              conAI
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              La tecnología con IA más avanzada, llevada a tu hogar. Envíos a todo Chile.
            </p>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span>📍</span>
              <span>Santiago, Chile</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span>📧</span>
              <span>hola@conai.cl</span>
            </div>
          </div>

          {/* Tienda */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black tracking-widest uppercase text-[var(--text-muted)]">
              Tienda
            </p>
            {col1.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Mi cuenta */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black tracking-widest uppercase text-[var(--text-muted)]">
              Mi cuenta
            </p>
            {col2.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Información */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black tracking-widest uppercase text-[var(--text-muted)]">
              Información
            </p>
            {col3.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs text-[var(--text-muted)]">
            © 2025 conAI · Todos los derechos reservados
          </p>

          {/* Métodos de pago */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>Pago seguro:</span>
            {["WebPay", "Visa", "Mastercard", "Débito"].map((m) => (
              <span
                key={m}
                className="font-bold px-2 py-1 rounded-md border text-[var(--text-muted)]"
                style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
