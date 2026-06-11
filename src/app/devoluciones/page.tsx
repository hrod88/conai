export const metadata = {
  title: "Devoluciones y Reembolsos — conAI",
  description: "Conoce nuestra política de devoluciones y cómo solicitar un reembolso en conAI.",
};

export default function DevolucionesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text)" }}>
        Devoluciones y Reembolsos
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-10">Última actualización: junio 2026</p>

      <section className="flex flex-col gap-8 text-[var(--text-muted)] text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Plazo para devoluciones</h2>
          <p>Tienes hasta <strong>10 días hábiles</strong> desde la recepción del producto para solicitar una devolución. Pasado ese plazo no se aceptarán solicitudes.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Condiciones</h2>
          <p>Para procesar una devolución el producto debe:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Estar sin uso y en su embalaje original</li>
            <li>Incluir todos los accesorios y manuales</li>
            <li>No presentar daños causados por el cliente</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Productos defectuosos</h2>
          <p>Si recibes un producto defectuoso o dañado durante el transporte, contáctanos dentro de las primeras 48 horas con fotos del producto. Gestionaremos el reemplazo o reembolso sin costo adicional.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Productos sin devolución</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Productos usados o con precinto roto</li>
            <li>Productos personalizados o bajo pedido especial</li>
            <li>Software o licencias digitales activadas</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Proceso de reembolso</h2>
          <p>Una vez aprobada la devolución, el reembolso se procesa en 5–10 días hábiles al mismo medio de pago original. Los costos de envío de devolución son responsabilidad del cliente, salvo que el producto sea defectuoso.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>Cómo solicitar una devolución</h2>
          <p>Escríbenos a <a href="mailto:hola@conai.cl" className="text-indigo-500 hover:underline">hola@conai.cl</a> con tu número de pedido y motivo de devolución. Te responderemos en máximo 2 días hábiles.</p>
        </div>
      </section>
    </main>
  );
}
