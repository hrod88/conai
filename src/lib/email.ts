import { Resend } from "resend";

interface OrderConfirmationParams {
  to: string;
  orderId: string;
  total: number;
  items: { name: string; quantity: number; unit_price: number }[];
}

export async function sendOrderConfirmation({
  to,
  orderId,
  total,
  items,
}: OrderConfirmationParams) {
  const itemsHtml = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${i.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${i.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">$${(i.unit_price * i.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:system-ui,sans-serif;background:#f8f8f8;margin:0;padding:24px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">

        <div style="background:linear-gradient(135deg,#6366f1,#38bdf8);padding:32px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;">conAI</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">¡Tu pedido fue confirmado!</p>
        </div>

        <div style="padding:24px;">
          <p style="color:#555;font-size:14px;margin:0 0 16px;">
            Hola, gracias por tu compra. Aquí está el resumen de tu pedido:
          </p>

          <div style="background:#f8f8f8;border-radius:12px;padding:4px;margin-bottom:20px;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="color:#888;">
                  <th style="padding:10px 12px;text-align:left;font-weight:600;">Producto</th>
                  <th style="padding:10px 12px;text-align:center;font-weight:600;">Cant.</th>
                  <th style="padding:10px 12px;text-align:right;font-weight:600;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding:12px;font-weight:900;color:#1a1a2e;">Total</td>
                  <td style="padding:12px;font-weight:900;color:#6366f1;text-align:right;font-size:15px;">$${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:20px;">
            <p style="color:#16a34a;font-size:13px;margin:0;font-weight:600;">🚚 Envío gratuito a todo Chile</p>
            <p style="color:#4ade80;font-size:12px;margin:6px 0 0;">Entrega estimada: 3–5 días hábiles</p>
          </div>

          <p style="color:#aaa;font-size:11px;text-align:center;margin:0;">
            N° de pedido: <span style="font-family:monospace;color:#888;">${orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        <div style="background:#f8f8f8;padding:16px 24px;text-align:center;border-top:1px solid #f0f0f0;">
          <p style="color:#aaa;font-size:11px;margin:0;">
            ¿Tienes dudas? Escríbenos a <a href="mailto:hola@conai.cl" style="color:#6366f1;">hola@conai.cl</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: "conAI <noreply@conai.cl>",
    to,
    subject: "¡Tu pedido en conAI fue confirmado! 🎉",
    html,
  });
}
