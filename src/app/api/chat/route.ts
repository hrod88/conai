import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ── Contexto base de conAI ──────────────────────────────────────────
const SYSTEM_PROMPT = `Eres el asistente virtual de conAI, una tienda chilena de tecnología e innovación.

Ayudas a los visitantes de forma amable, breve y útil, en español chileno neutro.

INFORMACIÓN DE LA TIENDA:
- Envío: gratis a todo Chile en compras sobre $30.000. Chilexpress y Starken. Entrega 3 a 7 días hábiles.
- Devoluciones: 30 días de garantía sin preguntas. Retiro a domicilio sin costo.
- Pagos: débito y crédito vía Transbank WebPay Plus. 100% seguro; los datos de la tarjeta nunca se almacenan.
- Categorías: salud, belleza, hogar, wearables, mascotas, gadgets, audio, oficina, juguetes, deportes, electronica, telefonos.

REGLAS:
- Sé conciso (2-4 frases).
- Cuando te pasen una lista de PRODUCTOS DISPONIBLES, recomiéndalos por su nombre y precio reales. No inventes productos ni precios.
- Si no hay productos para lo que buscan, oriéntalos a explorar /productos o escribir a contacto@conai.cl.
- Formatea los precios en pesos chilenos (ej: $29.990).`;

// ── Mapa de palabras clave -> categoría ─────────────────────────────
const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  salud: /salud|smartwatch|cardiaco|coraz[óo]n|ox[íi]geno|presi[óo]n|term[óo]metro|gluc|sal[uú]d|bienestar/,
  belleza: /belleza|facial|piel|skin|masaje|led|anti.?edad|spa|cabello|depil/,
  hogar: /hogar|casa|robot|aspirad|c[áa]mara|termostato|limpieza|cocina|smart.?home/,
  wearables: /wearable|reloj|anillo|gafa|pulsera|banda/,
  mascotas: /mascota|perro|gato|pet|collar|comedero|alimentador/,
  gadgets: /gadget|dron|impresora|proyector|3d/,
  audio: /audio|parlante|altavoz|auricular|aud[íi]fono|bluetooth|sonido|m[úu]sica/,
  oficina: /oficina|teclado|monitor|escritorio|silla|ergon|trabajo|productividad|mouse/,
  juguetes: /juguete|ni[ñn]o|beb[ée]|infantil|educativo/,
  deportes: /deporte|outdoor|fitness|running|ciclismo|ejercicio|gym|gimnasio/,
  electronica: /electr[óo]nic|componente|circuito|sensor/,
  telefonos: /tel[ée]fono|celular|smartphone|funda|cargador|cable|powerbank/,
};

function detectCategory(text: string): string | null {
  const t = text.toLowerCase();
  for (const [cat, regex] of Object.entries(CATEGORY_KEYWORDS)) {
    if (regex.test(t)) return cat;
  }
  return null;
}

type ProductLite = { name: string; price: number; category: string; rating: number | null };

// ── Buscar productos reales en Supabase ─────────────────────────────
async function findProducts(category: string): Promise<ProductLite[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("name, price, category, rating")
      .eq("category", category)
      .eq("active", true)
      .gt("stock", 0)
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(4);
    if (error || !data) return [];
    return data as ProductLite[];
  } catch {
    return [];
  }
}

function formatPrice(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

// ── Fallback sin IA, ahora con productos reales ─────────────────────
function fallbackResponse(text: string, products: ProductLite[], category: string | null): string {
  const t = text.toLowerCase();

  // Respuestas de políticas (no necesitan productos)
  if (/hola|hi|buenas|saludos/.test(t))
    return "¡Hola! Me alegra tenerte aquí 😊 ¿Estás buscando algún producto en especial o tienes alguna consulta?";
  if (/env[íi]o|despacho|llega|entrega|shipping/.test(t))
    return "🚚 Envío gratis a todo Chile en compras sobre $30.000. Trabajamos con Chilexpress y Starken. Entrega en 3 a 7 días hábiles.";
  if (/devolu|garant[íi]a|reembolso/.test(t))
    return "✅ Ofrecemos 30 días de garantía de devolución sin preguntas. Coordinamos el retiro a domicilio sin costo.";
  if (/pago|pagar|tarjeta|d[ée]bito|cr[ée]dito|transbank|webpay/.test(t))
    return "🔒 Aceptamos tarjetas de débito y crédito vía Transbank WebPay Plus. Es 100% seguro y tus datos nunca se almacenan.";
  if (/gracias|thank|perfecto|excelente|genial/.test(t))
    return "¡Con gusto! 😊 Si tienes más consultas, aquí estaré.";
  if (/adios|chao|bye|hasta luego/.test(t))
    return "¡Hasta luego! 👋 Vuelve cuando quieras.";

  // Si encontramos productos reales para la categoría, los recomendamos
  if (products.length > 0 && category) {
    const lista = products
      .map((p) => `• ${p.name} — ${formatPrice(p.price)}`)
      .join("\n");
    return `Te recomiendo estos productos de ${category} que tenemos disponibles:\n\n${lista}\n\nVer más → /productos?cat=${category}`;
  }

  // Si detectamos categoría pero sin stock
  if (category) {
    return `Justo ahora no tengo productos de ${category} con stock disponible, pero puedes revisar el catálogo completo → /productos?cat=${category}`;
  }

  return "Puedo ayudarte con dudas sobre productos, envíos, pagos y devoluciones. ¿Qué tipo de producto buscas? (salud, hogar, mascotas, audio, etc.) 🛍️";
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

    // 1. Detectar categoría y buscar productos REALES
    const category = detectCategory(lastUser);
    const products = category ? await findProducts(category) : [];

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // 2a. Sin API key -> fallback con productos reales
    if (!apiKey) {
      return Response.json({
        reply: fallbackResponse(lastUser, products, category),
        mode: "fallback",
      });
    }

    // 2b. Con API key -> pasamos los productos reales a Claude
    let productContext = "";
    if (products.length > 0 && category) {
      const lista = products
        .map((p) => `- ${p.name} (${formatPrice(p.price)})`)
        .join("\n");
      productContext = `\n\nPRODUCTOS DISPONIBLES en la categoría "${category}" (recomienda estos, con su nombre y precio reales):\n${lista}\nEnlace a la categoría: /productos?cat=${category}`;
    }

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
        system: SYSTEM_PROMPT + productContext,
        messages: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!resp.ok) {
      console.error("Anthropic API error:", resp.status, await resp.text());
      return Response.json({
        reply: fallbackResponse(lastUser, products, category),
        mode: "fallback-error",
      });
    }

    const data = await resp.json();
    const reply = Array.isArray(data?.content)
      ? data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim()
      : "";

    return Response.json({
      reply: reply || fallbackResponse(lastUser, products, category),
      mode: "ai",
    });
  } catch (err) {
    console.error("Chat error:", err);
    return Response.json(
      { reply: "Disculpa, tuve un problema técnico. Intenta de nuevo o escríbenos a contacto@conai.cl", mode: "error" },
      { status: 200 }
    );
  }
}
