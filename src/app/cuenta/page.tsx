import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const statusStyles: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "Pendiente",  color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  paid:      { label: "Pagado",     color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  shipped:   { label: "Enviado",    color: "#1e40af", bg: "#dbeafe", border: "#93c5fd" },
  delivered: { label: "Entregado",  color: "#3730a3", bg: "#e0e7ff", border: "#a5b4fc" },
};

type OrderRow = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: { quantity: number; unit_price: number; products: { name: string; icon: string } | null }[];
};

export default async function CuentaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, order_items(quantity, unit_price, products(name, icon))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }) as { data: OrderRow[] | null };

  const allOrders = orders ?? [];
  const recentOrders = allOrders.slice(0, 3);
  const totalSpent = allOrders
    .filter((o) => o.status !== "pending")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const totalItems = allOrders
    .filter((o) => o.status !== "pending")
    .reduce((sum, o) => sum + o.order_items.reduce((s, i) => s + i.quantity, 0), 0);

  const initials = (user.email ?? "U").slice(0, 2).toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString("es-CL", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #38bdf8)" }}
        >
          {initials}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-xs font-black tracking-widest text-indigo-500 uppercase">Mi cuenta</p>
          <h1 className="text-xl font-black text-[var(--text)] truncate">{user.email}</h1>
          <p className="text-xs text-[var(--text-muted)]">Miembro desde {memberSince}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pedidos", value: allOrders.length, icon: "🛒" },
          { label: "Productos comprados", value: totalItems, icon: "📦" },
          { label: "Total gastado", value: `$${Math.round(totalSpent).toLocaleString("es-CL")}`, icon: "💳" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 border flex flex-col gap-1"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span className="text-xl">{s.icon}</span>
            <p className="text-lg font-black text-[var(--text)]">{s.value}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-semibold leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/mis-pedidos"
          className="flex items-center gap-3 p-4 rounded-xl border transition-colors hover:border-indigo-400"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-bold text-sm text-[var(--text)]">Mis pedidos</p>
            <p className="text-xs text-[var(--text-muted)]">Ver historial completo</p>
          </div>
        </Link>
        <Link
          href="/favoritos"
          className="flex items-center gap-3 p-4 rounded-xl border transition-colors hover:border-indigo-400"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <span className="text-2xl">❤️</span>
          <div>
            <p className="font-bold text-sm text-[var(--text)]">Favoritos</p>
            <p className="text-xs text-[var(--text-muted)]">Productos guardados</p>
          </div>
        </Link>
      </div>

      {/* Pedidos recientes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-[var(--text)]">Pedidos recientes</h2>
          {allOrders.length > 3 && (
            <Link href="/mis-pedidos" className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
              Ver todos →
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center flex flex-col items-center gap-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span className="text-4xl">📭</span>
            <p className="text-sm text-[var(--text-muted)] font-semibold">Todavía no tienes pedidos</p>
            <Link
              href="/productos"
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              Ver productos →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => {
              const st = statusStyles[order.status] ?? statusStyles.pending;
              const itemCount = order.order_items.reduce((s, i) => s + i.quantity, 0);
              return (
                <div
                  key={order.id}
                  className="rounded-xl border p-4 flex items-center gap-4"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-mono text-[var(--text-muted)]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: st.color, background: st.bg, borderColor: st.border }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {itemCount} {itemCount === 1 ? "producto" : "productos"} · {new Date(order.created_at).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <p className="font-black text-[var(--text)] flex-shrink-0">
                    ${Number(order.total).toLocaleString("es-CL")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cerrar sesión */}
      <div
        className="rounded-xl border p-5 flex items-center justify-between"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div>
          <p className="font-bold text-sm text-[var(--text)]">Sesión activa</p>
          <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

    </div>
  );
}
