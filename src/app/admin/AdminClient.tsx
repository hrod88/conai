"use client";

import { useState } from "react";
import type { Product, Category } from "@/types";

type CJProduct = {
  pid: string;
  productNameEn: string;
  productNameCn?: string;
  sellPrice: number;
  productImage: string;
  description?: string;
};

type ImportForm = {
  category: Category;
  price: string;
  tag: string;
  status: "idle" | "loading" | "done" | "error";
  error?: string;
};

const CAT_ICONS: Record<Category, string> = {
  salud: "❤️", belleza: "✨", hogar: "🏠", wearables: "⌚",
  mascotas: "🐾", gadgets: "🤖", audio: "🎧", oficina: "💼",
  juguetes: "🧸", deportes: "⚽", electronica: "🔌", telefonos: "📱",
};

const ALL_CATEGORIES: Category[] = [
  "salud","belleza","hogar","wearables","mascotas","gadgets",
  "audio","oficina","juguetes","deportes","electronica","telefonos",
];

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

type Tab = "productos" | "pedidos" | "importar";

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

  // CJ — vincular
  const [cjSearch, setCjSearch] = useState("");
  const [cjResults, setCjResults] = useState<CJProduct[]>([]);
  const [cjLoading, setCjLoading] = useState(false);
  const [linkingProduct, setLinkingProduct] = useState<string | null>(null);
  const [fulfillMsg, setFulfillMsg] = useState<Record<string, string>>({});

  // CJ — importar
  const [importSearch, setImportSearch] = useState("");
  const [importResults, setImportResults] = useState<CJProduct[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importForms, setImportForms] = useState<Record<string, ImportForm>>({});

  async function searchImport() {
    if (!importSearch.trim()) return;
    setImportLoading(true);
    const res = await fetch(`/api/cj/search?q=${encodeURIComponent(importSearch)}`);
    const json = await res.json();
    const results: CJProduct[] = json.data?.list ?? [];
    setImportResults(results);
    const forms: Record<string, ImportForm> = {};
    results.forEach((p) => {
      forms[p.pid] = { category: "gadgets", price: String(Math.round(p.sellPrice * 1000)), tag: "", status: "idle" };
    });
    setImportForms(forms);
    setImportLoading(false);
  }

  function patchForm(pid: string, patch: Partial<ImportForm>) {
    setImportForms((prev) => ({ ...prev, [pid]: { ...prev[pid], ...patch } }));
  }

  async function importProduct(cj: CJProduct) {
    const form = importForms[cj.pid];
    if (!form || !form.price) return;
    patchForm(cj.pid, { status: "loading" });
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:        cj.productNameEn,
        description: cj.description ?? cj.productNameEn,
        price:       Number(form.price),
        category:    form.category,
        tag:         form.tag || null,
        image:       cj.productImage,
        icon:        CAT_ICONS[form.category],
        cj_pid:      cj.pid,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      patchForm(cj.pid, { status: "done" });
    } else {
      patchForm(cj.pid, { status: "error", error: json.error });
    }
  }

  async function searchCJ() {
    if (!cjSearch.trim()) return;
    setCjLoading(true);
    const res = await fetch(`/api/cj/search?q=${encodeURIComponent(cjSearch)}`);
    const json = await res.json();
    setCjResults(json.data?.list ?? []);
    setCjLoading(false);
  }

  async function linkCJ(productId: string, cjPid: string) {
    setSaving(productId);
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cj_pid: cjPid }),
    });
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, cj_pid: cjPid } as Product & { cj_pid: string } : p));
    setLinkingProduct(null);
    setCjResults([]);
    setCjSearch("");
    setSaving(null);
  }

  async function fulfillWithCJ(orderId: string) {
    setSaving(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}/fulfill`, { method: "POST" });
    const json = await res.json();
    setFulfillMsg((prev) => ({ ...prev, [orderId]: json.ok ? "✅ Enviado a CJ" : `❌ ${json.error}` }));
    if (json.ok) setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "shipped" } : o));
    setSaving(null);
  }

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
        {(["productos", "pedidos", "importar"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
              tab === t ? "text-[var(--text)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            style={tab === t ? { background: "var(--surface)" } : {}}
          >
            {t === "importar" ? "📥 Importar CJ" : t}
          </button>
        ))}
      </div>

      {/* Tabla Productos */}
      {tab === "productos" && (
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-black text-[var(--text)] text-sm">{products.length} productos</h2>
            <div className="flex items-center gap-2">
              <input
                value={cjSearch}
                onChange={(e) => setCjSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchCJ()}
                placeholder="Buscar en CJ Dropshipping..."
                className="text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              />
              <button
                onClick={searchCJ}
                disabled={cjLoading}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {cjLoading ? "..." : "Buscar CJ"}
              </button>
            </div>
          </div>

          {/* Resultados CJ */}
          {cjResults.length > 0 && (
            <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
              <p className="text-xs font-bold text-[var(--text-muted)] mb-2">{cjResults.length} resultados — haz clic en &quot;Vincular&quot; al lado del producto conAI que corresponda</p>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {cjResults.map((cj) => (
                  <div key={cj.pid} className="flex items-center justify-between gap-3 text-xs py-1 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      {cj.productImage && <img src={cj.productImage} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-[var(--text)]">{cj.productNameEn}</p>
                        <p className="text-[var(--text-muted)]">PID: {cj.pid} · USD {cj.sellPrice}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setLinkingProduct(linkingProduct === cj.pid ? null : cj.pid)}
                      className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                    >
                      {linkingProduct === cj.pid ? "Cancelar" : "Vincular →"}
                    </button>
                    {linkingProduct === cj.pid && (
                      <div className="flex flex-col gap-1 text-[10px] text-[var(--text-muted)] flex-shrink-0">
                        <p className="font-bold">¿A cuál producto conAI?</p>
                        <div className="max-h-32 overflow-y-auto flex flex-col gap-0.5">
                          {products.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => linkCJ(p.id, cj.pid)}
                              className="text-left px-2 py-0.5 rounded hover:bg-indigo-100 text-[var(--text)] transition-colors"
                            >
                              {p.icon} {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* ── Tab Importar CJ ──────────────────────────────────── */}
      {tab === "importar" && (
        <div className="flex flex-col gap-4">
          {/* Buscador */}
          <div className="rounded-xl border p-4 flex gap-2" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <input
              value={importSearch}
              onChange={(e) => setImportSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchImport()}
              placeholder="Buscar producto en CJ Dropshipping (ej: smart watch, yoga mat...)"
              className="flex-1 text-sm px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-400"
              style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            />
            <button
              onClick={searchImport}
              disabled={importLoading}
              className="px-5 py-2 text-sm font-bold rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {importLoading ? "Buscando..." : "🔍 Buscar"}
            </button>
          </div>

          {/* Resultados */}
          {importResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {importResults.map((cj) => {
                const form = importForms[cj.pid];
                if (!form) return null;
                return (
                  <div
                    key={cj.pid}
                    className="rounded-xl border p-4 flex flex-col gap-3"
                    style={{
                      background: "var(--surface)",
                      borderColor: form.status === "done" ? "#10b981" : form.status === "error" ? "#ef4444" : "var(--border)",
                    }}
                  >
                    {/* Producto CJ */}
                    <div className="flex gap-3">
                      {cj.productImage && (
                        <img src={cj.productImage} alt="" className="w-16 h-16 rounded-lg object-contain bg-gray-50 flex-shrink-0 p-1" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[var(--text)] leading-snug line-clamp-2">{cj.productNameEn}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">PID: {cj.pid}</p>
                        <p className="text-xs font-semibold text-orange-500 mt-0.5">Costo CJ: USD ${cj.sellPrice}</p>
                      </div>
                    </div>

                    {/* Formulario */}
                    {form.status !== "done" && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">Categoría</label>
                          <select
                            value={form.category}
                            onChange={(e) => patchForm(cj.pid, { category: e.target.value as Category })}
                            className="text-xs px-2 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400 capitalize"
                            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                          >
                            {ALL_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">Precio CLP</label>
                          <input
                            type="number"
                            value={form.price}
                            onChange={(e) => patchForm(cj.pid, { price: e.target.value })}
                            placeholder="ej: 29990"
                            className="text-xs px-2 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400"
                            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">Tag</label>
                          <select
                            value={form.tag}
                            onChange={(e) => patchForm(cj.pid, { tag: e.target.value })}
                            className="text-xs px-2 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400"
                            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                          >
                            <option value="">Sin tag</option>
                            <option value="nuevo">🆕 Nuevo</option>
                            <option value="bestseller">⭐ Bestseller</option>
                            <option value="descuento">🔥 Descuento</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Acción */}
                    {form.status === "done" ? (
                      <p className="text-sm font-bold text-emerald-600">✅ Importado correctamente</p>
                    ) : form.status === "error" ? (
                      <p className="text-xs font-bold text-red-500">❌ {form.error}</p>
                    ) : (
                      <button
                        onClick={() => importProduct(cj)}
                        disabled={form.status === "loading" || !form.price}
                        className="w-full py-2 text-sm font-black rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                      >
                        {form.status === "loading" ? "Importando..." : "📥 Importar a conAI"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {importResults.length === 0 && !importLoading && (
            <div className="rounded-xl border py-16 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Busca un producto en CJ para importarlo</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Se guardará en tu tienda con imagen, precio y categoría</p>
            </div>
          )}
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
                    <th className="text-left px-5 py-3">CJ</th>
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
                      <td className="px-5 py-3">
                        {fulfillMsg[o.id] ? (
                          <span className="text-[10px] font-bold">{fulfillMsg[o.id]}</span>
                        ) : o.status === "paid" ? (
                          <button
                            onClick={() => fulfillWithCJ(o.id)}
                            disabled={saving === o.id}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            Enviar a CJ
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)]">—</span>
                        )}
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
