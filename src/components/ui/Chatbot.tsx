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

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function send() {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    try {
      // Convertir el historial al formato que espera la API (user/assistant)
      const apiMessages = nextMessages
        .filter((m) => m.id !== "init")
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      const reply =
        data?.reply ??
        "Disculpa, no pude responder en este momento. Intenta de nuevo o escríbenos a contacto@conai.cl";

      setMessages((m) => [
        ...m,
        { id: (Date.now() + 1).toString(), role: "bot", text: reply },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "Disculpa, tuve un problema de conexión. Intenta de nuevo en un momento. 🙏",
        },
      ]);
    } finally {
      setTyping(false);
    }
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
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug whitespace-pre-wrap ${
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
              disabled={!input.trim() || typing}
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
