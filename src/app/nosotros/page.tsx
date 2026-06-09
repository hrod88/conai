export default function NosotrosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-14">
      {/* Hero */}
      <section className="text-center flex flex-col gap-4">
        <p className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
          Nuestra historia
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-[var(--text)]">
          Llevamos la IA al{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-transparent">
            hogar chileno
          </span>
        </h1>
        <p className="text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
          conAI nació con una misión simple: hacer que la tecnología con inteligencia
          artificial sea accesible para todos en Chile y Latinoamérica.
        </p>
      </section>

      {/* Valores */}
      <section>
        <h2 className="text-xl font-black text-[var(--text)] mb-6 text-center">
          Lo que nos mueve
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: "🚀",
              title: "Innovación",
              desc: "Curación constante de los mejores productos con IA del mercado global.",
            },
            {
              icon: "🇨🇱",
              title: "Local primero",
              desc: "Envíos a todo Chile, soporte en español y pagos con Transbank.",
            },
            {
              icon: "🤝",
              title: "Confianza",
              desc: "Productos verificados, devolución en 30 días y atención real.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-2xl p-5 flex flex-col gap-3 border transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <span className="text-3xl">{v.icon}</span>
              <p className="font-black text-[var(--text)]">{v.title}</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-indigo-500 to-sky-400 rounded-2xl p-8">
        <div className="grid grid-cols-3 gap-6 text-center text-white">
          {[
            { num: "180+", label: "Productos" },
            { num: "6", label: "Categorías" },
            { num: "100%", label: "Chileno" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black">{s.num}</p>
              <p className="text-sm font-semibold opacity-80 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <p className="text-[var(--text-muted)] text-sm mb-4">
          ¿Listo para explorar el futuro?
        </p>
        <a
          href="/productos"
          className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200"
        >
          Ver productos →
        </a>
      </section>
    </div>
  );
}
