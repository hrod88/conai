import { NextRequest } from "next/server";

// ── Contexto de conAI que la IA usará para responder ────────────────
// Esto es lo que el asistente "sabe" sobre la tienda.
const SYSTEM_PROMPT = `Eres el asistente virtual de conAI, una tienda chilena de tecnología e innovación (smartwatches, dispositivos de belleza, hogar inteligente, wearables, gadgets, audio, mascotas, oficina, juguetes, deportes, electrónica y accesorios de teléfono).

Tu trabajo es ayudar a los visitantes de forma amable, breve y útil, en español chileno neutro.

INFORMACIÓN DE LA TIENDA:
- Envío: gratis a todo Chile en compras sobre $30.000. Trabajamos con Chilexpress y Starken. Entrega en 3 a 7 días hábiles.
- Devoluciones: 30 días de garantía sin preguntas. Retiro a domicilio sin costo si el producto no convence.
- Pagos: tarjetas de débito y crédito vía Transbank WebPay Plus. 100% seguro; los datos de la tarjeta nunca se almacenan.
- Categorías disponibles (con su enlace): salud (/productos?cat=salud), belleza (/productos?cat=belleza), hogar (/productos?cat=hogar), wearables (/productos?cat=wearables), mascotas (/productos?cat=mascotas), gadgets (/productos?cat=gadgets), audio (/productos?cat=audio), oficina (/productos?cat=oficina), juguetes (/productos?cat=juguetes), deportes (/productos?cat=deportes), electronica (/productos?cat=electronica), telefonos (/productos?cat=telefonos).

REGLAS:
- Sé conciso (2-4 frases). No inventes productos específicos ni precios que no conozcas.
- Si preguntan por una categoría, oriéntalos y sugiere el enlace correspondiente.
- Si no sabes algo puntual, sugiere escribir a contacto@conai.cl.
- No prometas cosas que no estén en la información de arriba.`;

// ── Fallback sin IA (tu lógica actual, por si no hay API key) ────────
function fallbackResponse(text: string): string {
  const t = text.toLowerCase();
  if (/hola|hi|buenas|saludos/.test(t))
    return "¡Hola! Me alegra tenerte aquí 😊 ¿Estás buscando algún producto en especial o tienes alguna consulta?";
  if (/envío|envio|despacho|llega|entrega|shipping/.test(t))
    return "🚚 Tenemos envío gratis a todo Chile en compras sobre $30.000. Trabajamos con Chilexpress y Starken. Entrega en 3 a 7 días hábiles.";
  if (/devolu|garantía|garantia|cambio|reembolso/.test(t))
    return "✅ Ofrecemos 30 días de garantía de devolución sin preguntas. Coordinamos el retiro a domicilio sin costo.";
  if (/pago|pagar|tarjeta|débito|credito|transbank|webpay/.test(t))
    return "🔒 Aceptamos tarjetas de débito y crédito vía Transbank WebPay Plus. Es 100% seguro y tus datos nunca se almacenan.";
  if (/precio|costo|valor|cuánto|cuanto|barato|caro/.test(t))
    return "💰 Tenemos productos para distintos presupuestos. ¿Tienes un rango en mente? Te ayudo a encontrar la mejor opción.";
  if (/salud|smartwatch|cardiaco|corazón|oxígeno|presión/.test(t))
    return "❤️ Nuestra categoría de Salud incluye smartwatches y sensores. → /productos?cat=salud";
  if (/belleza|facial|piel|masaje|led/.test(t))
    return "✨ En Belleza tenemos dispositivos faciales con IA. → /productos?cat=belleza";
  if (/hogar|casa|robot|aspirador|cámara|termostato/.test(t))
    return "🏠 Para el Hogar Inteligente tenemos robots, cámaras y termostatos. → /productos?cat=hogar";
  if (/mascota|perro|gato|pet/.test(t))
    return "🐾 Para mascotas tenemos GPS, cámaras y alimentadores. → /productos?cat=mascotas";
  if (/gadget|dron|impresora|proyector/.test(t))
    return "🤖 En Gadgets hay drones, impresoras 3D y más. → /productos?cat=gadgets";
  if (/audio|parlante|altavoz|auricular|bluetooth|sonido/.test(t))
    return "🎧 En Audio hay auriculares, parlantes y altavoces IA. → /productos?cat=audio";
  if (/gracias|thank|perfecto|excelente|genial/.test(t))
    return "¡Con gusto! 😊 Si tienes más consultas, aquí estaré.";
  if (/adios|chao|bye|hasta luego/.test(t))
    return "¡Hasta luego! 👋 Vuelve cuando quieras.";
  return "Puedo ayudarte con dudas sobre productos, envíos, pagos y devoluciones. ¿Qué necesitas saber? Para algo muy específico, escríbenos a contacto@conai.cl 📧";
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    if (!lastUser.trim()) {
      return Response.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // ── Si NO hay API key configurada -> modo fallback (sin costo) ──
    if (!apiKey) {
      return Response.json({ reply: fallbackResponse(lastUser), mode: "fallback" });
    }

    // ── Si HAY API key -> usar Claude ──
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!resp.ok) {
      // Si la IA falla por cualquier motivo, no rompemos: usamos fallback.
      console.error("Anthropic API error:", resp.status, await resp.text());
      return Response.json({ reply: fallbackResponse(lastUser), mode: "fallback-error" });
    }

    const data = await resp.json();
    const reply =
      Array.isArray(data?.content)
        ? data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim()
        : "";

    return Response.json({ reply: reply || fallbackResponse(lastUser), mode: "ai" });
  } catch (err) {
    console.error("Chat error:", err);
    return Response.json(
      { reply: "Disculpa, tuve un problema técnico. Intenta de nuevo o escríbenos a contacto@conai.cl", mode: "error" },
      { status: 200 }
    );
  }
}
