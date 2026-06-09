"use client";

import { useState } from "react";
import type { Product } from "@/types";

type Order = {
  id: string;
  user_id: string | null;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered";
  transbank_token: string | null;
  created_at: string;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_region: string | null;
  shipping_cost: number | null;
};

type Tab = "productos" | "pedidos";

const statusStyles: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  paid:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  shipped:   "bg-sky-50 text-sky-700 border-sky-200",
  delivered: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const statusLabel: Record<string, string> = {
  pending:   "Pendiente",
  paid:      "Pagado",
  shipped:   "Enviado",
  delivered: "Entregado",
};

const tagOptions = [
  { value: "", label: "Sin tag" },
  { value: "bestseller", label: "Bestseller" },
  { value: "nuevo", label: "Nuevo" },
  { value: "descuento", label: "Descuento" },
];

export default function AdminClient({
  products: initialProducts,
  orders: initialOrders,
}: {
  products: Product[];
  orders: Order[];
}) {
  const [tab, setTab] = useState<Tab>("productos");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [saving, setSaving] = useState<string | null>(null);

  const totalRevenue = orders
    .filter((o) => o.status !== "pending")
    .reduce((sum, o) => sum + Number(o.total), 0);

  async function updateOrderStatus(id: string, status: string) {
    setSaving(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as Order["status"] } : o)));
    }
    setSaving(null);
  }

  async function updateProduct(id: string, fields: { stock?: number; tag?: string | null; price?: number }) {
    setSaving(id);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...fields, tag: (fields.tag ?? p.tag) as Product["tag"] } : p))
      );
    }
    setSaving(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text)]">Panel de Admin</h1>
        <p className="text-sm text-[var(--text-muted)]">conAI — gestión de productos y pedidos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Productos", value: products.length, icon: "📦" },
          { label: "Pedidos", value: orders.length, icon: "🛒" },
          { label: "Pagados", value: orders.filter((o) => o.status !== "pending").length, icon: "✅" },
          { label: "Ingresos", value: `$${Math.round(totalRevenue).toLocaleString("es-CL")}`, icon: "💰" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 border flex flex-col gap-1"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span className="text-xl">{s.icon}</span>
            <p className="text-2xl font-black text-[var(--text)]">{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl p-1 w-fit" style={{ background: "var(--surface-alt)" }}>
        {(["productos", "pedidos"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
              tab === t ? "text-[var(--text)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            style={tab === t ? { background: "var(--surface)" } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tabla Productos */}
      {tab === "productos" && (
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-black text-[var(--text)] text-sm">{products.length} productos</h2>
            <p className="text-xs text-[var(--text-muted)]">Edita stock, precio o tag directamente</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-[var(--text-muted)] font-bold uppercase tracking-wide" style={{ borderColor: "var(--border)" }}>
                  <th className="text-left px-5 py-3">Producto</th>
                  <th className="text-left px-5 py-3">Categoría</th>
                  <th className="text-right px-5 py-3">Precio</th>
                  <th className="text-right px-5 py-3">Stock</th>
                  <th className="text-left px-5 py-3">Tag</th>
                  <th className="text-right px-5 py-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b transition-colors hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10"
                    style={{ borderColor: "var(--border)", opacity: saving === p.id ? 0.5 : 1 }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span>{p.icon}</span>
                        <span className="font-semibold text-[var(--text)] truncate max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)] capitalize">{p.category}</td>

                    {/* Precio editable */}
                    <td className="px-5 py-3 text-right">
                      <input
                        type="number"
                        defaultValue={p.price}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val !== p.price) updateProduct(p.id, { price: val });
                        }}
                        className="w-24 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-transparent border-b border-transparent hover:border-indigo-300 focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </td>

                    {/* Stock editable */}
                    <td className="px-5 py-3 text-right">
                      <input
                        type="number"
                        defaultValue={p.stock}
                        min={0}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val !== p.stock) updateProduct(p.id, { stock: val });
                        }}
                        className={`w-16 text-right text-sm font-bold bg-transparent border-b border-transparent hover:border-indigo-300 focus:border-indigo-500 focus:outline-none transition-colors ${
                          p.stock > 10 ? "text-emerald-600" : p.stock > 0 ? "text-amber-500" : "text-red-500"
                        }`}
                      />
                    </td>

                    {/* Tag editable */}
                    <td className="px-5 py-3">
                      <select
                        value={p.tag ?? ""}
                        onChange={(e) => updateProduct(p.id, { tag: e.target.value || null })}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-transparent cursor-pointer focus:outline-none"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                      >
                        {tagOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-3 text-right text-amber-500 font-semibold">
                      ★ {p.rating?.toFixed(1) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla Pedidos */}
      {tab === "pedidos" && (
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-black text-[var(--text)] text-sm">{orders.length} pedidos</h2>
          </div>
          {orders.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-muted)]">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-sm">Todavía no hay pedidos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-[var(--text-muted)] font-bold uppercase tracking-wide" style={{ borderColor: "var(--border)" }}>
                    <th className="text-left px-5 py-3">ID</th>
                    <th className="text-left px-5 py-3">Estado</th>
                    <th className="text-left px-5 py-3">Destinatario</th>
                    <th className="text-right px-5 py-3">Total</th>
                    <th className="text-left px-5 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b transition-colors hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10"
                      style={{ borderColor: "var(--border)", opacity: saving === o.id ? 0.5 : 1 }}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-[var(--text-muted)]">
                        {o.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${statusStyles[o.status] ?? ""}`}
                        >
                          {Object.entries(statusLabel).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        {o.shipping_name ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-[var(--text)]">{o.shipping_name}</span>
                            <span className="text-[10px] text-[var(--text-muted)]">{o.shipping_city}, {o.shipping_region?.replace("Región ", "")}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        ${Number(o.total).toLocaleString("es-CL")}
                      </td>
                      <td className="px-5 py-3 text-[var(--text-muted)] text-xs">
                        {new Date(o.created_at).toLocaleDateString("es-CL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
