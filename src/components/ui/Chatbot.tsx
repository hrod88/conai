"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

const INITIAL: Message = {
  id: "init",
  role: "bot",
  text: "¡Hola! Soy conAI, tu asistente inteligente 🤖 ¿En qué te puedo ayudar hoy? Puedo orientarte sobre productos, envíos, pagos y más.",
};

function getResponse(text: string): string {
  const t = text.toLowerCase();
  if (/hola|hi|buenas|saludos/.test(t))
    return "¡Hola! Me alegra tenerte aquí 😊 ¿Estás buscando algún producto en especial o tienes alguna consulta?";
  if (/envío|envio|despacho|llega|entrega|shipping/.test(t))
    return "🚚 Tenemos **envío gratis** a todo Chile en compras sobre $30.000. Trabajamos con Chilexpress y Starken. El tiempo estimado es de 3 a 7 días hábiles.";
  if (/devolu|garantía|garantia|cambio|reembolso/.test(t))
    return "✅ Ofrecemos **30 días de garantía de devolución** sin preguntas. Si el producto no cumple tus expectativas, coordinamos el retiro a domicilio sin costo.";
  if (/pago|pagar|tarjeta|débito|credito|transbank|webpay/.test(t))
    return "🔒 Aceptamos tarjetas de **débito y crédito** a través de Transbank WebPay Plus. Es 100% seguro y los datos de tu tarjeta nunca se almacenan en nuestros servidores.";
  if (/precio|costo|valor|cuánto|cuanto|barato|caro/.test(t))
    return "💰 Nuestros productos van desde $19.990 hasta $899.990. ¿Tienes un presupuesto específico? Dime el rango y te ayudo a encontrar la mejor opción.";
  if (/salud|smartwatch|cardiaco|corazón|oxígeno|oxigeno|presión|presion/.test(t))
    return "❤️ Nuestra categoría de **Salud** incluye smartwatches con monitor cardíaco, sensor SpO2, temperatura corporal y GPS. Son perfectos para mantenerte al tanto de tu bienestar. ¿Quieres ver la selección? → /productos?cat=salud";
  if (/belleza|facial|piel|skin|masaje|led|anti/.test(t))
    return "✨ En **Belleza Tech** tenemos dispositivos de LED fotónico, masajeadores faciales ultrasónicos y espejos inteligentes con IA. Tecnología de spa en tu hogar. → /productos?cat=belleza";
  if (/hogar|casa|robot|aspirador|aspiradora|cámara|camara|termostato|smart home/.test(t))
    return "🏠 Para el **Hogar Inteligente** contamos con robots aspiradores con mapeo IA, cámaras de seguridad con detección facial, y termostatos inteligentes compatibles con Alexa y Google. → /productos?cat=hogar";
  if (/mascota|perro|gato|pet|gps mascota|collar/.test(t))
    return "🐾 ¡Queremos a tus mascotas! Tenemos GPS en tiempo real, cámaras para monitorearlas mientras trabajas, y alimentadores automáticos con IA. → /productos?cat=mascotas";
  if (/gadget|dron|drone|impresora|proyector|parlante|altavoz/.test(t))
    return "🤖 En **Gadgets** encontrarás drones con cámara 4K, impresoras 3D para el hogar, proyectores portátiles y altavoces inteligentes. ¡Tecnología de otro nivel! → /productos?cat=gadgets";
  if (/wearable|reloj|anillo|gafa|gafas|auricular|auriculares/.test(t))
    return "⌚ Los **Wearables** incluyen smartwatches de última generación, anillos inteligentes, gafas AR y auriculares con cancelación de ruido activa con IA. → /productos?cat=wearables";
  if (/audio|parlante|altavoz|auricular|audífono|audifonos|bluetooth|sonido|música|musica/.test(t))
    return "🎧 En **Audio Inteligente** encontrarás auriculares con IA, parlantes Bluetooth premium, altavoces inteligentes compatibles con Alexa y Google, y más. → /productos?cat=audio";
  if (/oficina|teclado|monitor|escritorio|silla|ergon|trabajo|productividad/.test(t))
    return "💼 En **Oficina Tech** tenemos teclados mecánicos, monitores ergonómicos, accesorios de productividad con IA y todo para hacer tu espacio de trabajo más inteligente. → /productos?cat=oficina";
  if (/mejor|recomienda|recomendación|popularito|popular|bestseller/.test(t))
    return "⭐ Nuestros productos más populares esta semana son el **Monitor de Salud Pro X** (Salud), el **Robot Aspirador Láser** (Hogar) y el **Dron 4K Plegable** (Gadgets). ¿Te interesa alguno?";
  if (/gracias|thank|perfecto|excelente|genial/.test(t))
    return "¡Con gusto! 😊 Si tienes más consultas, aquí estaré. ¡Que disfrutes tu compra en conAI!";
  if (/adios|chao|bye|hasta luego/.test(t))
    return "¡Hasta luego! 👋 Fue un placer ayudarte. Recuerda que puedes volver cuando quieras.";
  const fallbacks = [
    "Entiendo tu consulta. Te recomiendo explorar nuestro catálogo o escribirnos a contacto@conai.cl 📧 para atención personalizada.",
    "Mmm, déjame pensar... 🤔 Para esa consulta específica, te sugiero contactar a nuestro equipo en contacto@conai.cl, te responderán en menos de 24 horas.",
    "¡Buena pregunta! Puedo ayudarte mejor si me dices: ¿buscas un producto de salud, belleza, hogar, mascotas, gadgets, wearables, audio o oficina?",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    const delay = 800 + Math.random() * 600;
    setTimeout(() => {
      setTyping(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: getResponse(text),
      };
      setMessages((m) => [...m, botMsg]);
    }, delay);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 md:bottom-6 z-[100] w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-white text-2xl shadow-lg shadow-indigo-300/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        aria-label="Abrir asistente IA"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Pulse ring */}
      {!open && (
        <span
          className="fixed bottom-20 right-4 md:bottom-6 z-[99] w-14 h-14 rounded-full border-2 border-indigo-400 opacity-40 pointer-events-none"
          style={{ animation: "pulseRing 2s ease-out infinite" }}
        />
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-[88px] right-4 md:bottom-24 z-[100] w-80 sm:w-96 bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2d2d4e] flex flex-col overflow-hidden animate-slide-up"
          style={{ height: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-sky-400 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-black text-white text-sm">Asistente conAI</p>
              <p className="text-indigo-100 text-[11px]">En línea · Responde al instante</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-[#111827] text-[var(--text)] rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-[#111827] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400"
                      style={{ animation: `typing 1.2s ${i * 0.2}s ease-in-out infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 dark:border-[#2d2d4e]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-1 text-sm bg-gray-50 dark:bg-[#111827] text-[var(--text)] rounded-xl px-3 py-2 outline-none border border-gray-200 dark:border-[#2d2d4e] focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-indigo-700 transition-colors"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
