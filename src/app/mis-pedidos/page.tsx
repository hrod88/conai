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
  { key: "received", label: "Recibido" },
  { key: "preparing", label: "Preparando" },
  { key: "shipped", label: "Despachado" },
  { key: "in_transit", label: "En camino" },
  { key: "delivered", label: "Entregado" },
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
        const done = i < currentIdx;
        const current = i === currentIdx;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div
                className="absolute h-[3px] top-[13px]"
                style={{
                  left: "-50%",
                  width: "100%",
                  background: i <= currentIdx ? "#16a34a" : "var(--border)",
                  zIndex: 0,
                }}
              />
            )}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold relative z-10 border-2"
              style={{
                background: done ? "#16a34a" : current ? "#6366f1" : "var(--surface)",
                borderColor: done ? "#16a34a" : current ? "#6366f1" : "var(--border)",
                color: done || current ? "#fff" : "var(--text-muted)",
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
  order_items: {
    quantity: number;
    unit_price: number;
    products: { name: string; icon: string } | null;
  }[];
};

export default async function MisPedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, shipping_status, created_at, shipping_name, shipping_address, shipping_city, shipping_region, shipping_cost, order_items(quantity, unit_price, products(name, icon))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) as { data: OrderRow[] | null };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black tracking-widest text-indigo-500 uppercase mb-1">Tu cuenta</p>
          <h1 className="text-2xl font-black text-[var(--text)]">Mis pedidos</h1>
        </div>
        <Link
          href="/productos"
          className="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
        >
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
            return (
              <div
                key={order.id}
                className="rounded-2xl border p-5 flex flex-col gap-4"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {/* Header del pedido */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {new Date(order.created_at).toLocaleDateString("es-CL", {
                        day: "numeric", month: "long", year: "numeric"
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
<ShippingTimeline status={order.shipping_status} />
                <hr style={{ borderColor: "var(--border)" }} />

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
