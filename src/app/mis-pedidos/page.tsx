import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const statusStyles: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "Pendiente",  color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  paid:      { label: "Pagado",     color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  shipped:   { label: "Enviado",    color: "#1e40af", bg: "#dbeafe", border: "#93c5fd" },
  delivered: { label: "Entregado",  color: "#3730a3", bg: "#e0e7ff", border: "#a5b4fc" },
};

const SHIPPING_STEPS = [
  { key: "received",   label: "Recibido"   },
  { key: "preparing",  label: "Preparando" },
  { key: "shipped",    label: "Despachado" },
  { key: "in_transit", label: "En camino"  },
  { key: "delivered",  label: "Entregado"  },
] as const;

function shippingStepIndex(status: string | null): number {
  const idx = SHIPPING_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

function ShippingTimeline({ status }: { status: string | null }) {
  const currentIdx = shippingStepIndex(status);
  return (
    <div className="flex items-center w-full py-1">
      {SHIPPING_STEPS.map((step, i) => {
        const done    = i < currentIdx;
        const current = i === currentIdx;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div
                className="absolute h-[3px] top-[13px]"
                style={{
                  left: "-50%", width: "100%",
                  background: i <= currentIdx ? "#16a34a" : "var(--border)",
                  zIndex: 0,
                }}
              />
            )}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold relative z-10 border-2"
              style={{
                background:   done ? "#16a34a" : current ? "#6366f1" : "var(--surface)",
                borderColor:  done ? "#16a34a" : current ? "#6366f1" : "var(--border)",
                color:        done || current ? "#fff" : "var(--text-muted)",
              }}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className="text-[9px] font-semibold mt-1.5 text-center leading-tight"
              style={{ color: done ? "#16a34a" : current ? "#6366f1" : "var(--text-muted)" }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d;
}

function courierUrl(courier: string, tracking: string): string {
  if (courier === "chilexpress")
    return `https://www.chilexpress.cl/views/buscaestado.aspx?codigo=${tracking}`;
  if (courier === "starken")
    return `https://www.starken.cl/seguimiento?codigo=${tracking}`;
  if (courier === "bluexpress")
    return `https://www.bluexpress.cl/tracking?numero=${tracking}`;
  return "#";
}

function courierLabel(courier: string): string {
  const map: Record<string, string> = {
    chilexpress: "Chilexpress",
    starken:     "Starken",
    bluexpress:  "Bluexpress",
  };
  return map[courier] ?? courier;
}

type OrderRow = {
  id: string;
  total: number;
  status: string;
  shipping_status: string | null;
  created_at: string;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_region: string | null;
  shipping_cost: number | null;
  tracking_number: string | null;
  courier: string | null;
  order_items: {
    quantity: number;
    unit_price: number;
    products: { name: string; icon: string } | null;
  }[];
};

const STATUS_MSG: Record<string, string> = {
  received:   "✅ Recibimos tu pedido. Lo procesaremos en las próximas 24-48 horas.",
  preparing:  "📦 Estamos preparando tu pedido para el despacho.",
  shipped:    "🚚 Tu pedido fue despachado y está en camino.",
  in_transit: "🛫 Tu pedido está en tránsito. Llegará en los próximos días.",
  delivered:  "🎉 ¡Tu pedido fue entregado! Esperamos que lo disfrutes.",
};

export default async function MisPedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, total, status, shipping_status, created_at,
      shipping_name, shipping_address, shipping_city, shipping_region, shipping_cost,
      tracking_number, courier,
      order_items(quantity, unit_price, products(name, icon))
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) as { data: OrderRow[] | null };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-1">Tu cuenta</p>
          <h1 className="text-2xl font-black text-[var(--text)]">Mis pedidos</h1>
        </div>
        <Link href="/productos" className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
          Seguir comprando →
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-[var(--text-muted)]">
          <span className="text-6xl">📦</span>
          <p className="font-semibold text-sm">Todavía no tienes pedidos</p>
          <Link
            href="/productos"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Ver productos →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const st = statusStyles[order.status] ?? statusStyles.pending;
            const statusMsg = STATUS_MSG[order.shipping_status ?? "received"];
            const created   = new Date(order.created_at);
            const minDate   = addBusinessDays(created, 10);
            const maxDate   = addBusinessDays(created, 15);
            const fmt = (d: Date) =>
              d.toLocaleDateString("es-CL", { day: "numeric", month: "long" });

            return (
              <div
                key={order.id}
                className="rounded-2xl border p-5 flex flex-col gap-4"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {new Date(order.created_at).toLocaleDateString("es-CL", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0"
                    style={{ color: st.color, background: st.bg, borderColor: st.border }}
                  >
                    {st.label}
                  </span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-2">
                  {order.order_items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg flex-shrink-0">{item.products?.icon ?? "📦"}</span>
                        <span className="text-[var(--text)] font-medium truncate">
                          {item.products?.name ?? "Producto"}
                        </span>
                        <span className="text-[var(--text-muted)] text-xs flex-shrink-0">×{item.quantity}</span>
                      </div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                        ${(item.unit_price * item.quantity).toLocaleString("es-CL")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <ShippingTimeline status={order.shipping_status} />

                {/* Mensaje contextual */}
                {statusMsg && (
                  <p className="text-[12px] font-semibold px-1" style={{ color: "var(--text-muted)" }}>
                    {statusMsg}
                  </p>
                )}

                {/* Número de seguimiento */}
                {order.tracking_number && (
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border"
                    style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                        Número de seguimiento
                      </p>
                      <p className="font-black text-[13px] font-mono" style={{ color: "var(--text)" }}>
                        {order.tracking_number}
                      </p>
                      {order.courier && (
                        <p className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                          {courierLabel(order.courier)}
                        </p>
                      )}
                    </div>
                    {order.courier && (
                      <a
                        href={courierUrl(order.courier, order.tracking_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-bold text-white transition-opacity hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#6366f1,#38bdf8)" }}
                      >
                        Rastrear →
                      </a>
                    )}
                  </div>
                )}

                {/* Fecha estimada */}
                {order.shipping_status !== "delivered" && (
                  <p className="text-[11.5px] font-semibold px-1" style={{ color: "var(--text-muted)" }}>
                    📅 Entrega estimada: entre el <strong>{fmt(minDate)}</strong> y el <strong>{fmt(maxDate)}</strong>
                  </p>
                )}

                <hr style={{ borderColor: "var(--border)" }} />

                {/* Dirección */}
                {order.shipping_address && (
                  <div className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                    <span className="mt-0.5">🚚</span>
                    <div>
                      <p className="font-bold text-[var(--text)]">{order.shipping_name}</p>
                      <p>{order.shipping_address}, {order.shipping_city}</p>
                      <p>{order.shipping_region}</p>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)] font-semibold">Total pagado</span>
                  <span className="font-black text-lg text-[var(--text)]">
                    ${Number(order.total).toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}