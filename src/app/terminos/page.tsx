export const metadata = {
  title: "Términos de Servicio — conAI",
  description: "Términos y condiciones de uso de la plataforma conAI.",
};

export default function TerminosPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text)" }}>
        Términos de Servicio
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-10">Última actualización: junio 2026</p>

      <section className="flex flex-col gap-8 text-[var(--text-muted)] text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>1. Aceptación</h2>
          <p>Al acceder o usar conAI aceptas estos términos. Si no estás de acuerdo, no uses el sitio. conAI se reserva el derecho de modificar estos términos en cualquier momento, notificando los cambios en esta página.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>2. Uso del sitio</h2>
          <p>conAI es una plataforma de comercio electrónico orientada a productos tecnológicos con componentes de inteligencia artificial. El uso del sitio es personal y no comercial. Queda prohibido:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Usar el sitio para fines ilegales</li>
            <li>Intentar acceder a cuentas de otros usuarios</li>
            <li>Publicar contenido falso o engañoso en reseñas</li>
            <li>Realizar compras fraudulentas</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>3. Cuentas de usuario</h2>
          <p>Eres responsable de mantener la confidencialidad de tu contraseña. conAI no se responsabiliza por accesos no autorizados derivados de negligencia del usuario.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>4. Precios y disponibilidad</h2>
          <p>Los precios están expresados en pesos chilenos (CLP) e incluyen IVA. conAI se reserva el derecho de modificar precios sin previo aviso. La disponibilidad de stock no está garantizada hasta confirmar el pago.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>5. Pagos</h2>
          <p>Los pagos se procesan a través de plataformas seguras (Transbank / Mercado Pago). conAI no almacena datos de tarjetas. En caso de error en el cobro, contáctanos de inmediato.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>6. Propiedad intelectual</h2>
          <p>Todo el contenido del sitio (imágenes, textos, logotipos, diseño) es propiedad de conAI o de sus proveedores y está protegido por leyes de propiedad intelectual. No está permitida su reproducción sin autorización.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>7. Limitación de responsabilidad</h2>
          <p>conAI no se responsabiliza por daños indirectos derivados del uso del sitio, interrupciones del servicio, ni por el uso que terceros hagan de los productos adquiridos.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>8. Ley aplicable</h2>
          <p>Estos términos se rigen por la legislación chilena. Cualquier disputa se someterá a los tribunales ordinarios de justicia de Santiago, Chile.</p>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2" style={{ color: "var(--text)" }}>9. Contacto</h2>
          <p>Para consultas legales escríbenos a <a href="mailto:hola@conai.cl" className="text-indigo-500 hover:underline">hola@conai.cl</a>.</p>
        </div>
      </section>
    </main>
  );
}
