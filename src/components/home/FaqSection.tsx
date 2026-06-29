"use client";

import { useState } from "react";

const FAQS = [
  {
    icon: "🚚",
    q: "¿Cuánto tarda en llegar mi pedido?",
    a: "Para ofrecerte los mejores precios y diseños exclusivos, gestionamos nuestros productos directamente desde almacenes internacionales. El plazo de entrega estimado es de <strong>10 a 15 días laborables</strong>. Una vez realizado el pago, procesamos tu pedido en 24-48 horas.",
  },
  {
    icon: "📦",
    q: "¿Cómo puedo rastrear mi paquete?",
    a: "¡Es muy fácil! En cuanto tu pedido salga de nuestro almacén, te enviaremos un <strong>correo electrónico automático</strong> con tu número de seguimiento. Podrás introducir ese código directamente en nuestra sección \"Rastrear Pedido\" para ver el estado en tiempo real.",
  },
  {
    icon: "📬",
    q: "He pedido varios artículos, ¿por qué llegaron por separado?",
    a: "Como trabajamos con diferentes centros de distribución internacionales para agilizar los tiempos de entrega, los artículos de un mismo pedido a veces se envían de forma independiente. No te preocupes, el resto de tus productos llegará en los días siguientes <strong>sin costo adicional</strong>.",
  },
  {
    icon: "⚠️",
    q: "¿Qué pasa si mi producto llega dañado o no es lo que pedí?",
    a: "Tu satisfacción es nuestra prioridad. Si tu artículo llega defectuoso o incorrecto, escríbenos a nuestro correo de soporte dentro de los primeros <strong>14 días</strong> con una foto del producto. Te enviaremos un reemplazo totalmente gratis o procesaremos tu reembolso de inmediato.",
  },
  {
    icon: "🛃",
    q: "¿Tendré que pagar gastos de aduana?",
    a: "En el <strong>99% de los casos</strong>, nuestros paquetes son declarados con un valor mínimo que está exento de aranceles aduaneros. Sin embargo, en situaciones extremadamente raras, las oficinas locales pueden aplicar algún cargo. Estos costos específicos corren por cuenta del comprador.",
  },
  {
    icon: "💳",
    q: "¿Puedo pagar en cuotas?",
    a: "Sí. Al pagar con <strong>Transbank WebPay Plus</strong> puedes seleccionar cuotas directamente con tu banco emisor. Las opciones de cuotas dependen de tu tarjeta de crédito y banco. El monto mínimo y las condiciones las define tu entidad financiera.",
  },
  {
    icon: "🔒",
    q: "¿Mis datos de pago están seguros?",
    a: "Totalmente. Procesamos todos los pagos a través de <strong>Transbank WebPay Plus</strong>, el estándar de seguridad bancaria en Chile. Nunca almacenamos los datos de tu tarjeta en nuestros servidores — la transacción ocurre directamente en la plataforma segura de Transbank.",
  },
  {
    icon: "🛡️",
    q: "¿Los productos tienen garantía?",
    a: "Todos nuestros productos incluyen <strong>garantía de satisfacción de 30 días</strong> desde la fecha de recepción. Si el producto presenta fallas de fabricación dentro de ese plazo, lo reemplazamos o reembolsamos sin costo. Para defectos fuera de ese período, evaluamos cada caso de forma individual.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  function toggle(i: number) {
    setOpen(open === i ? null : i);
  }

  return (
    <section className="py-12 md:py-20" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto px-4 md:px-6">

        {/* Encabezado */}
        <div className="text-center mb-10">
          <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-2">
            Preguntas frecuentes
          </p>
          <h2 className="text-xl md:text-3xl font-black text-[var(--text)] mb-2">
            ¿Tienes dudas?
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Todo lo que necesitas saber antes de comprar.
          </p>
        </div>

        {/* Acordeón */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-2xl border overflow-hidden transition-all duration-200"
                style={{
                  background: "var(--surface)",
                  borderColor: isOpen ? "#6366f1" : "var(--border)",
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  style={{ background: "transparent" }}
                >
                  {/* Ícono */}
                  <span
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: isOpen ? "#eef2ff" : "var(--surface-alt)" }}
                  >
                    {faq.icon}
                  </span>

                  {/* Pregunta */}
                  <span
                    className="flex-1 text-[13.5px] font-700 text-left"
                    style={{
                      color: isOpen ? "#6366f1" : "var(--text)",
                      fontWeight: isOpen ? 700 : 600,
                    }}
                  >
                    {faq.q}
                  </span>

                  {/* Chevron */}
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-transform duration-250"
                    style={{
                      background: isOpen ? "#eef2ff" : "var(--surface-alt)",
                      color: isOpen ? "#6366f1" : "var(--text-muted)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {/* Respuesta */}
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? "300px" : "0px" }}
                >
                  <div
                    className="px-5 pb-5 text-[13.5px] leading-relaxed"
                    style={{ paddingLeft: "calc(20px + 36px + 16px)", color: "var(--text-muted)" }}
                    dangerouslySetInnerHTML={{ __html: faq.a }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <p className="text-center text-[13px] mt-8" style={{ color: "var(--text-muted)" }}>
          ¿No encontraste lo que buscabas?{" "}
          <a
            href="/contacto"
            className="text-indigo-500 font-bold hover:text-indigo-700 transition-colors"
          >
            Escríbenos aquí →
          </a>
        </p>
      </div>
    </section>
  );
}