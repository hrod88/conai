export const metadata = {
  title: "Política de Envíos — conAI",
  description: "Conoce los plazos, costos y condiciones de envío de conAI a todo Chile.",
};

export default function EnviosPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text)" }}>
        Política de Envíos
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-10">Última actualización: junio 2026</p>

      <section className="flex flex-col gap-8 text-[var(--text-muted)] text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Cobertura</h2>
          <p>Realizamos envíos a todo Chile continental. Para regiones extremas (Aysén, Magallanes) los plazos pueden extenderse 2–4 días adicionales.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Plazos de entrega</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Región Metropolitana: 3–5 días hábiles</li>
            <li>Regiones: 5–8 días hábiles</li>
            <li>Zonas extremas: 8–12 días hábiles</li>
          </ul>
          <p className="mt-2">Los plazos cuentan desde la confirmación de pago, no desde la fecha del pedido.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Costo de envío</h2>
          <p>El costo de envío se calcula al momento del checkout según tu dirección de entrega. Los pedidos sobre $50.000 CLP tienen envío gratuito.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Seguimiento</h2>
          <p>Una vez despachado tu pedido, recibirás un número de tracking por email para seguir tu paquete en tiempo real.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Productos importados</h2>
          <p>Algunos productos son importados directamente desde nuestros proveedores internacionales. En esos casos el plazo puede ser de 10–20 días hábiles. Esta información se indica claramente en la página del producto.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Contacto</h2>
          <p>Si tienes dudas sobre tu envío escríbenos a <a href="mailto:hola@conai.cl" className="text-indigo-500 hover:underline">hola@conai.cl</a>.</p>
        </div>
      </section>
    </main>
  );
}
