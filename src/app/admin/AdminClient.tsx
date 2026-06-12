"use client";

import { useState } from "react";
import type { Product, Category } from "@/types";

type CJProduct = {
  pid: string;
  productNameEn: string;
  productNameCn?: string;
  sellPrice: number;
  marketPrice?: number;
  productImage: string;
  description?: string;
};

type CJVariant = {
  vid: string;
  variantNameEn: string;
  variantSellPrice: number;
  variantImage?: string;
};

type TrackEvent = {
  description: string;
  trackTime: string;
};

type ImportForm = {
  category: Category;
  subcategory: string;
  nameEs: string;
  price: string;
  originalPrice: string;
  stock: number;
  tag: string;
  status: "idle" | "loading" | "done" | "error";
  error?: string;
  variants?: CJVariant[];
  variantsLoading?: boolean;
  selectedVid?: string;
  detailDesc?: string;
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

const USD_CLP = 950;

const SUBCATEGORIES: Record<Category, { id: string; label: string }[]> = {
  salud:      [{ id:"ecg",label:"Relojes & ECG" },{ id:"tension",label:"Tensiómetros Smart" },{ id:"sueno",label:"Sueño & Descanso" },{ id:"glucometro",label:"Glucómetros" },{ id:"termometro",label:"Termómetros Smart" },{ id:"oximetro",label:"Oxímetros" },{ id:"masaje",label:"Masajeadores Terapéuticos" }],
  belleza:    [{ id:"piel",label:"Cuidado de Piel IA" },{ id:"ipl",label:"Depilación IPL" },{ id:"facial",label:"Masaje Facial Smart" },{ id:"espejo",label:"Espejos Inteligentes" },{ id:"cepillo",label:"Cepillos Sónicos" }],
  hogar:      [{ id:"iluminacion",label:"Iluminación Smart" },{ id:"enchufes",label:"Enchufes & Energía" },{ id:"seguridad",label:"Cámaras & Seguridad" },{ id:"robots",label:"Robots del Hogar" },{ id:"clima",label:"Termostatos & Clima" },{ id:"cerraduras",label:"Cerraduras Smart" }],
  wearables:  [{ id:"smartwatch",label:"Smartwatches" },{ id:"anillos",label:"Smart Rings" },{ id:"fitness",label:"Fitness Trackers" },{ id:"gafas",label:"Gafas Smart" }],
  mascotas:   [{ id:"gps-pet",label:"GPS & Rastreo" },{ id:"comedero",label:"Comederos Automáticos" },{ id:"camara-pet",label:"Cámaras para Mascotas" },{ id:"salud-pet",label:"Monitores de Salud" },{ id:"juguetes-pet",label:"Juguetes Interactivos" }],
  gadgets:    [{ id:"cargadores",label:"Cargadores Inteligentes" },{ id:"proyectores",label:"Proyectores Smart" },{ id:"lamparas",label:"Lámparas Inteligentes" },{ id:"accesorios",label:"Accesorios Tech" }],
  audio:      [{ id:"auriculares",label:"Auriculares ANC/IA" },{ id:"parlantes",label:"Parlantes Inteligentes" },{ id:"traductores",label:"Traductores en Tiempo Real" },{ id:"micros",label:"Micrófonos Smart" }],
  oficina:    [{ id:"teclados",label:"Teclados & Ratones IA" },{ id:"monitores-of",label:"Monitores Smart" },{ id:"webcams",label:"Webcams con IA" },{ id:"productividad",label:"Gadgets de Productividad" }],
  juguetes:   [{ id:"educativos",label:"Juguetes Educativos IA" },{ id:"bebes",label:"Monitores de Bebé" },{ id:"robots-edu",label:"Robots Educativos" },{ id:"stem",label:"STEM & Coding" }],
  deportes:   [{ id:"relojes-dep",label:"Relojes Deportivos" },{ id:"sensores-dep",label:"Sensores de Entrenamiento" },{ id:"ropa-smart",label:"Ropa Inteligente" },{ id:"equipos-dep",label:"Equipos con IA" }],
  electronica:[{ id:"tablets",label:"Tablets Smart" },{ id:"streaming",label:"Streaming & Smart TV" },{ id:"accesorios-elec",label:"Accesorios Smart" }],
  telefonos:  [{ id:"smartphones",label:"Smartphones IA" },{ id:"accesorios-tel",label:"Accesorios Smart" },{ id:"fundas",label:"Fundas Inteligentes" }],
};

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

type Tab = "productos" | "importar" | "catalogo" | "pedidos" | "cupones";

type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  discount: number;
  label: string;
  min_purchase: number | null;
  max_uses: number | null;
  uses_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

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
  { value: "",           label: "Sin etiqueta" },
  { value: "bestseller", label: "⭐ Más vendidos" },
  { value: "nuevo",      label: "🆕 Recién llegado" },
  { value: "descuento",  label: "💲 Descuento" },
  { value: "oferta",     label: "🔥 Oferta" },
  { value: "destacado",  label: "✨ Destacado" },
];

export default function AdminClient({
  products: initialProducts,
  orders: initialOrders,
  coupons: initialCoupons,
}: {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
}) {
  const [tab, setTab] = useState<Tab>("productos");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [saving, setSaving] = useState<string | null>(null);

  // Cupones
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [couponForm, setCouponForm] = useState({
    code: "", type: "percentage", discount: "", label: "",
    min_purchase: "", max_uses: "", expires_at: "",
  });
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponError, setCouponError] = useState("");

  async function createCoupon() {
    if (!couponForm.code || !couponForm.discount || !couponForm.label) {
      setCouponError("Código, descuento y descripción son obligatorios");
      return;
    }
    setCouponSaving(true);
    setCouponError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponForm.code,
        type: couponForm.type,
        discount: couponForm.type === "percentage"
          ? Number(couponForm.discount) / 100
          : Number(couponForm.discount),
        label: couponForm.label,
        min_purchase: couponForm.min_purchase ? Number(couponForm.min_purchase) : null,
        max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
        expires_at: couponForm.expires_at || null,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setCoupons((prev) => [json.data, ...prev]);
      setCouponForm({ code: "", type: "percentage", discount: "", label: "", min_purchase: "", max_uses: "", expires_at: "" });
    } else {
      setCouponError(json.error ?? "Error al crear cupón");
    }
    setCouponSaving(false);
  }

  async function toggleCoupon(id: string, active: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, active } : c));
  }

  async function deleteCoupon(id: string) {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  // CJ — vincular (en tab Productos)
  const [cjSearch, setCjSearch] = useState("");
  const [cjResults, setCjResults] = useState<CJProduct[]>([]);
  const [cjLoading, setCjLoading] = useState(false);
  const [linkingProduct, setLinkingProduct] = useState<string | null>(null);
  const [fulfillMsg, setFulfillMsg] = useState<Record<string, string>>({});

  // CJ — importar
  const [importSearch, setImportSearch]     = useState("");
  const [importResults, setImportResults]   = useState<CJProduct[]>([]);
  const [importLoading, setImportLoading]   = useState(false);
  const [importForms, setImportForms]       = useState<Record<string, ImportForm>>({});
  const [importPage, setImportPage]         = useState(1);
  const [importTotal, setImportTotal]       = useState(0);
  const [importSort, setImportSort]         = useState("BESTSELLING");
  const [importMinPrice, setImportMinPrice] = useState("");
  const [importMaxPrice, setImportMaxPrice] = useState("");

  // Catálogo seed por categoría
  type SeedProduct = { pid: string; name: string; image: string | null; price: number; original_price: number; category: string; subcategory: string; tag: string };
  type SeedGroup   = { id: string; label: string; products: SeedProduct[] };

  const CAT_SEED_META: Record<string, { icon: string; label: string }> = {
    salud:       { icon: "🏥", label: "Salud"       },
    belleza:     { icon: "💄", label: "Belleza"     },
    hogar:       { icon: "🏠", label: "Hogar"       },
    wearables:   { icon: "⌚", label: "Wearables"   },
    mascotas:    { icon: "🐾", label: "Mascotas"    },
    gadgets:     { icon: "🔧", label: "Gadgets"     },
    audio:       { icon: "🎵", label: "Audio"       },
    oficina:     { icon: "💼", label: "Oficina"     },
    juguetes:    { icon: "🧸", label: "Juguetes"    },
    deportes:    { icon: "🏃", label: "Deportes"    },
    electronica: { icon: "📺", label: "Electrónica" },
    telefonos:   { icon: "📱", label: "Teléfonos"   },
  };

  const [seedCat, setSeedCat]               = useState<string | null>(null);
  const [seedGroups, setSeedGroups]         = useState<SeedGroup[]>([]);
  const [seedSelected, setSeedSelected]     = useState<Set<string>>(new Set());
  const [seedLoading, setSeedLoading]       = useState(false);
  const [seedImporting, setSeedImporting]   = useState(false);
  const [seedImportDone, setSeedImportDone] = useState<number | null>(null);

  async function loadCategoryPreview(cat: string) {
    setSeedCat(cat);
    setSeedLoading(true);
    setSeedGroups([]);
    setSeedSelected(new Set());
    setSeedImportDone(null);
    const res   = await fetch(`/api/admin/seed?category=${cat}`);
    const json  = await res.json();
    const groups: SeedGroup[] = json.groups ?? [];
    setSeedGroups(groups);
    setSeedSelected(new Set(groups.flatMap((g) => g.products.map((p) => p.pid))));
    setSeedLoading(false);
  }

  function toggleSeedProduct(pid: string) {
    setSeedSelected((prev) => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      return next;
    });
  }

  async function confirmSeedImport() {
    const selected = seedGroups.flatMap((g) => g.products).filter((p) => seedSelected.has(p.pid));
    if (!selected.length) return;
    setSeedImporting(true);
    const res  = await fetch("/api/admin/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: selected }),
    });
    const json = await res.json();
    setSeedImportDone(json.inserted ?? 0);
    setSeedImporting(false);
  }

  // CJ — tracking
  const [trackingData, setTrackingData]       = useState<Record<string, TrackEvent[]>>({});
  const [trackingLoading, setTrackingLoading] = useState<Record<string, boolean>>({});

  async function searchImport(page = 1) {
    if (!importSearch.trim()) return;
    setImportLoading(true);
    const params = new URLSearchParams({ q: importSearch, page: String(page), sort: importSort });
    if (importMinPrice) params.set("minPrice", importMinPrice);
    if (importMaxPrice) params.set("maxPrice", importMaxPrice);
    const res   = await fetch(`/api/cj/search?${params}`);
    const json  = await res.json();
    const results: CJProduct[] = json.data?.list ?? [];
    const total: number        = json.data?.total ?? 0;
    setImportResults(results);
    setImportPage(page);
    setImportTotal(total);
    const forms: Record<string, ImportForm> = {};
    results.forEach((p) => {
      forms[p.pid] = {
        category:      "gadgets",
        subcategory:   SUBCATEGORIES.gadgets[0].id,
        nameEs:        "",
        price:         String(Math.round(p.sellPrice * USD_CLP * 3 / 100) * 100),
        originalPrice: p.marketPrice ? String(Math.round(p.marketPrice * USD_CLP / 100) * 100) : "",
        stock:         50,
        tag:           "",
        status:        "idle",
      };
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
    const autoOriginalPrice = Math.round(Number(form.price) * 1.35 / 100) * 100;
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:           form.nameEs.trim() || cj.productNameEn,
        description:    form.detailDesc || cj.description || cj.productNameEn,
        price:          Number(form.price),
        original_price: form.originalPrice ? Number(form.originalPrice) : autoOriginalPrice,
        category:       form.category,
        subcategory:    form.subcategory || null,
        tag:            form.tag || null,
        image:          cj.productImage,
        icon:           CAT_ICONS[form.category],
        cj_pid:         cj.pid,
        stock:          form.stock ?? 50,
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

  async function loadVariants(pid: string) {
    patchForm(pid, { variantsLoading: true });
    const [varRes, detRes] = await Promise.all([
      fetch(`/api/cj/variants?pid=${pid}`),
      fetch(`/api/cj/product?pid=${pid}`),
    ]);
    const varJson = await varRes.json();
    const detJson = await detRes.json();
    const variants: CJVariant[] = varJson.data ?? [];
    const detailDesc: string    = detJson.data?.description ?? "";
    patchForm(pid, { variants, detailDesc, variantsLoading: false });
  }

  async function loadTracking(orderId: string) {
    setTrackingLoading((prev) => ({ ...prev, [orderId]: true }));
    const res = await fetch(`/api/cj/track?orderNo=${orderId}`);
    const json = await res.json();
    const events: TrackEvent[] = json.data?.trackList ?? [];
    setTrackingData((prev) => ({ ...prev, [orderId]: events }));
    setTrackingLoading((prev) => ({ ...prev, [orderId]: false }));
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

  async function deleteAllProducts() {
    if (!confirm(`¿Eliminar los ${products.length} productos? Esta acción no se puede deshacer.`)) return;
    setSaving("__all__");
    await fetch("/api/admin/products", { method: "DELETE" });
    setProducts([]);
    setSaving(null);
  }

  async function deleteProduct(id: string) {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    setSaving(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
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

  const inputCls = "text-xs px-2 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400";
  const inputStyle = { background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text)]">Panel de Admin</h1>
        <p className="text-sm text-[var(--text-muted)]">conAI — gestión de productos y pedidos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Productos", value: products.length, icon: "📦" },
          { label: "Pedidos",   value: orders.length,   icon: "🛒" },
          { label: "Pagados",   value: orders.filter((o) => o.status !== "pending").length, icon: "✅" },
          { label: "Ingresos",  value: `$${Math.round(totalRevenue).toLocaleString("es-CL")}`, icon: "💰" },
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
        {(["productos", "importar", "catalogo", "pedidos", "cupones"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
              tab === t ? "text-[var(--text)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            style={tab === t ? { background: "var(--surface)" } : {}}
          >
            {t === "importar"  ? "📥 Importar"
             : t === "catalogo" ? "📦 Catálogo"
             : t === "cupones"  ? "🏷 Cupones"
             : t}
          </button>
        ))}
      </div>

      {/* ── Tab Productos ────────────────────────────────────── */}
      {tab === "productos" && (
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <h2 className="font-black text-[var(--text)] text-sm">{products.length} productos</h2>
              {products.length > 0 && (
                <button
                  onClick={deleteAllProducts}
                  disabled={saving === "__all__"}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                >
                  {saving === "__all__" ? "Eliminando..." : "🗑 Eliminar todos"}
                </button>
              )}
            </div>
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
                  <th className="px-5 py-3" />
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
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => deleteProduct(p.id)}
                        disabled={saving === p.id}
                        className="text-[var(--text-muted)] hover:text-red-500 disabled:opacity-40 transition-colors text-base leading-none"
                        title="Eliminar producto"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab Importar ─────────────────────────────────────── */}
      {tab === "importar" && (
        <div className="flex flex-col gap-4">

          {/* Buscador + filtros */}
          <div className="rounded-xl border p-4 flex flex-col gap-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex gap-2">
              <input
                value={importSearch}
                onChange={(e) => setImportSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchImport(1)}
                placeholder="Buscar en CJ Dropshipping (ej: yoga mat, shin guard, bike helmet...)"
                className="flex-1 text-sm px-3 py-2.5 rounded-lg border focus:outline-none focus:border-indigo-400"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
              />
              <button
                onClick={() => searchImport(1)}
                disabled={importLoading}
                className="px-6 py-2.5 text-sm font-bold rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {importLoading ? "Buscando..." : "Buscar en CJ"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">ORDENAR:</span>
              {[
                { value: "BESTSELLING", label: "🔥 Más vendidos" },
                { value: "LOWER_PRICE", label: "$ Menor precio"  },
                { value: "NEWER",       label: "✨ Más nuevos"   },
                { value: "RELEVANCE",   label: "📊 Relevancia"   },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setImportSort(value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                    importSort === value
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-400"
                  }`}
                >
                  {label}
                </button>
              ))}

              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">PRECIO USD:</span>
              <input
                type="number"
                value={importMinPrice}
                onChange={(e) => setImportMinPrice(e.target.value)}
                placeholder="Mín"
                className="w-20 text-xs px-2 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400 text-center"
                style={inputStyle}
              />
              <span className="text-xs text-[var(--text-muted)]">—</span>
              <input
                type="number"
                value={importMaxPrice}
                onChange={(e) => setImportMaxPrice(e.target.value)}
                placeholder="Máx"
                className="w-20 text-xs px-2 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400 text-center"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Grid de resultados */}
          {importResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {importResults.map((cj) => {
                const form = importForms[cj.pid];
                if (!form) return null;
                return (
                  <div
                    key={cj.pid}
                    className="rounded-xl border overflow-hidden flex flex-col"
                    style={{
                      background: "var(--surface)",
                      borderColor: form.status === "done" ? "#10b981" : form.status === "error" ? "#ef4444" : "var(--border)",
                    }}
                  >
                    {/* Imagen */}
                    {cj.productImage ? (
                      <img src={cj.productImage} alt="" className="w-full aspect-square object-cover bg-gray-50" />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-5xl">📦</div>
                    )}

                    {/* Formulario */}
                    <div className="p-3 flex flex-col gap-2 flex-1">

                      {/* Nombre */}
                      <input
                        type="text"
                        value={form.nameEs}
                        onChange={(e) => patchForm(cj.pid, { nameEs: e.target.value })}
                        placeholder={cj.productNameEn}
                        className={`${inputCls} font-semibold`}
                        style={inputStyle}
                      />

                      {/* Info CJ */}
                      <p className="text-[10px] text-[var(--text-muted)] truncate">
                        CJ: USD {cj.sellPrice}{cj.marketPrice ? ` — ${cj.marketPrice}` : ""} · PID {cj.pid.slice(0, 18)}
                      </p>

                      {/* Categoría */}
                      <select
                        value={form.category}
                        onChange={(e) => {
                          const cat = e.target.value as Category;
                          patchForm(cj.pid, { category: cat, subcategory: SUBCATEGORIES[cat][0].id });
                        }}
                        className={inputCls + " capitalize"}
                        style={inputStyle}
                      >
                        {ALL_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
                        ))}
                      </select>

                      {/* Subcategoría */}
                      <select
                        value={form.subcategory}
                        onChange={(e) => patchForm(cj.pid, { subcategory: e.target.value })}
                        className={inputCls}
                        style={inputStyle}
                      >
                        <option value="">Subcategoría (opcional)</option>
                        {SUBCATEGORIES[form.category].map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>

                      {/* Precio + Existencias */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Precio $</label>
                          <input
                            type="number"
                            value={form.price}
                            onChange={(e) => patchForm(cj.pid, { price: e.target.value })}
                            className={inputCls}
                            style={inputStyle}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Existencias</label>
                          <input
                            type="number"
                            value={form.stock}
                            onChange={(e) => patchForm(cj.pid, { stock: Number(e.target.value) })}
                            className={inputCls}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      {/* Etiqueta */}
                      <select
                        value={form.tag}
                        onChange={(e) => patchForm(cj.pid, { tag: e.target.value })}
                        className={inputCls}
                        style={inputStyle}
                      >
                        {tagOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>

                      {/* Variantes */}
                      {form.status !== "done" && (
                        <div>
                          {!form.variants ? (
                            <button
                              onClick={() => loadVariants(cj.pid)}
                              disabled={!!form.variantsLoading}
                              className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 disabled:opacity-50 transition-colors"
                            >
                              {form.variantsLoading ? "Cargando..." : "▸ Ver variantes"}
                            </button>
                          ) : form.variants.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {form.variants.map((v) => {
                                const varPrice  = Math.round(v.variantSellPrice * USD_CLP * 3 / 100) * 100;
                                const isSelected = form.selectedVid === v.vid;
                                return (
                                  <button
                                    key={v.vid}
                                    onClick={() => patchForm(cj.pid, { selectedVid: v.vid, price: String(varPrice) })}
                                    className={`text-[9px] px-2 py-0.5 rounded border transition-all ${
                                      isSelected
                                        ? "bg-indigo-100 border-indigo-400 text-indigo-700"
                                        : "border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-300"
                                    }`}
                                  >
                                    {v.variantNameEn}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[9px] text-[var(--text-muted)]">Sin variantes disponibles</p>
                          )}
                        </div>
                      )}

                      <div className="flex-1" />

                      {/* Botón importar */}
                      {form.status === "done" ? (
                        <div className="py-2 text-center text-sm font-bold text-emerald-600">✅ Importado correctamente</div>
                      ) : form.status === "error" ? (
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] text-red-500">{form.error}</p>
                          <button
                            onClick={() => importProduct(cj)}
                            className="w-full py-2.5 text-sm font-bold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                          >
                            Reintentar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => importProduct(cj)}
                          disabled={form.status === "loading" || !form.price}
                          className="w-full py-2.5 text-sm font-bold rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
                        >
                          {form.status === "loading" ? "Importando..." : "Importar a mi tienda"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {importTotal > 0 && (
            <div className="flex items-center justify-between px-2 py-3">
              <button
                onClick={() => searchImport(importPage - 1)}
                disabled={importPage <= 1 || importLoading}
                className="text-sm font-bold px-4 py-2 rounded-lg border disabled:opacity-40 hover:border-indigo-400 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                ← Anterior
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                Página <span className="font-bold text-[var(--text)]">{importPage}</span> de{" "}
                <span className="font-bold text-[var(--text)]">{Math.ceil(importTotal / 50)}</span>
                <span className="ml-2 opacity-60">({importTotal} resultados)</span>
              </span>
              <button
                onClick={() => searchImport(importPage + 1)}
                disabled={importPage >= Math.ceil(importTotal / 50) || importLoading}
                className="text-sm font-bold px-4 py-2 rounded-lg border disabled:opacity-40 hover:border-indigo-400 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                Siguiente →
              </button>
            </div>
          )}

          {importResults.length === 0 && !importLoading && (
            <div className="rounded-xl border py-20 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <span className="text-5xl block mb-3">🔍</span>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Busca un producto en CJ para importarlo</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Se guardará en tu tienda con imagen, precio y categoría</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab Catálogo ─────────────────────────────────────── */}
      {tab === "catalogo" && (
        <div className="rounded-xl border p-4 flex flex-col gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div>
            <p className="text-sm font-bold text-[var(--text)]">🚀 Importar catálogo por categoría</p>
            <p className="text-xs text-[var(--text-muted)]">Elige una categoría, previsualiza los productos y confirma los que quieres importar</p>
          </div>

          {/* Grid de categorías */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Object.entries(CAT_SEED_META).map(([cat, meta]) => (
              <button
                key={cat}
                onClick={() => loadCategoryPreview(cat)}
                disabled={seedLoading}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border text-xs font-semibold transition-all ${
                  seedCat === cat
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-[var(--border)] hover:border-indigo-300 text-[var(--text)]"
                } disabled:opacity-50`}
                style={{ background: seedCat === cat ? undefined : "var(--bg)" }}
              >
                <span className="text-xl">{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            ))}
          </div>

          {/* Cargando */}
          {seedLoading && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span className="animate-spin">⟳</span>
              Buscando productos en CJ para {seedCat ? CAT_SEED_META[seedCat]?.label : ""}...
            </div>
          )}

          {/* Preview */}
          {!seedLoading && seedGroups.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-bold text-[var(--text)]">
                  {CAT_SEED_META[seedCat!]?.icon} {CAT_SEED_META[seedCat!]?.label} —{" "}
                  <span className="text-[var(--text-muted)] font-normal">
                    {seedSelected.size} de {seedGroups.reduce((a, g) => a + g.products.length, 0)} seleccionados
                  </span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSeedSelected(new Set(seedGroups.flatMap((g) => g.products.map((p) => p.pid))))}
                    className="text-xs px-3 py-1 rounded-lg border border-[var(--border)] hover:bg-indigo-50 text-[var(--text)]"
                  >
                    Seleccionar todos
                  </button>
                  <button
                    onClick={() => setSeedSelected(new Set())}
                    className="text-xs px-3 py-1 rounded-lg border border-[var(--border)] hover:bg-red-50 text-[var(--text)]"
                  >
                    Deseleccionar todos
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {seedGroups.map((group) => (
                  <div key={group.id}>
                    <p className="text-xs font-bold text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
                      📂 {group.label} ({group.products.length})
                    </p>
                    <div className="flex flex-col gap-1">
                      {group.products.map((p) => (
                        <label
                          key={p.pid}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                            seedSelected.has(p.pid)
                              ? "border-indigo-200 bg-indigo-50/50"
                              : "border-[var(--border)] opacity-50"
                          }`}
                          style={{ background: seedSelected.has(p.pid) ? undefined : "var(--bg)" }}
                        >
                          <input
                            type="checkbox"
                            checked={seedSelected.has(p.pid)}
                            onChange={() => toggleSeedProduct(p.pid)}
                            className="accent-indigo-500 w-4 h-4 flex-shrink-0"
                          />
                          {p.image && (
                            <img src={p.image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate text-[var(--text)]">{p.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              ${p.price.toLocaleString("es-CL")} CLP · <span className="line-through">${p.original_price.toLocaleString("es-CL")}</span>
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            p.tag === "bestseller" ? "bg-amber-100 text-amber-700" :
                            p.tag === "nuevo"      ? "bg-emerald-100 text-emerald-700" :
                            p.tag === "destacado"  ? "bg-indigo-100 text-indigo-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {p.tag}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {seedImportDone === null ? (
                <button
                  onClick={confirmSeedImport}
                  disabled={seedImporting || seedSelected.size === 0}
                  className="w-full py-2.5 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {seedImporting ? "Importando..." : `Importar ${seedSelected.size} productos seleccionados →`}
                </button>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-sm font-bold text-emerald-700">✅ {seedImportDone} productos importados</p>
                  <button
                    onClick={() => { setSeedGroups([]); setSeedCat(null); setSeedImportDone(null); }}
                    className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Importar otra categoría
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Pedidos ──────────────────────────────────────── */}
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
                        ) : o.status === "shipped" ? (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => loadTracking(o.id)}
                              disabled={trackingLoading[o.id]}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 disabled:opacity-50 transition-colors whitespace-nowrap dark:bg-sky-900/30 dark:text-sky-300"
                            >
                              {trackingLoading[o.id] ? "..." : "📦 Tracking"}
                            </button>
                            {trackingData[o.id] && (
                              trackingData[o.id].length === 0 ? (
                                <p className="text-[10px] text-[var(--text-muted)]">Sin datos aún</p>
                              ) : (
                                <div className="flex flex-col gap-0.5 max-w-[200px]">
                                  {trackingData[o.id].slice(0, 3).map((ev, i) => (
                                    <div key={i} className="text-[9px] text-[var(--text-muted)] leading-snug">
                                      <span className="font-semibold text-[var(--text)]">{ev.description}</span>
                                      <span className="ml-1 opacity-70">{ev.trackTime?.slice(0, 10)}</span>
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
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

      {/* ── Tab Cupones ──────────────────────────────────────── */}
      {tab === "cupones" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border p-5 flex flex-col gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="font-black text-[var(--text)]">Nuevo cupón</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Código *</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="VERANO20"
                  className="px-3 py-2 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Tipo *</label>
                <select
                  value={couponForm.type}
                  onChange={(e) => setCouponForm((p) => ({ ...p, type: e.target.value, discount: "" }))}
                  className="px-3 py-2 rounded-lg border text-sm bg-transparent text-[var(--text)] focus:outline-none focus:border-indigo-500 transition-colors"
                  style={{ borderColor: "var(--border)", background: "var(--bg)" }}
                >
                  <option value="percentage">% Porcentaje</option>
                  <option value="fixed">$ Monto fijo</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  {couponForm.type === "percentage" ? "% Descuento *" : "$ Descuento *"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={couponForm.type === "percentage" ? 100 : undefined}
                  value={couponForm.discount}
                  onChange={(e) => setCouponForm((p) => ({ ...p, discount: e.target.value }))}
                  placeholder={couponForm.type === "percentage" ? "20" : "5000"}
                  className="px-3 py-2 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Descripción</label>
                <input
                  type="text"
                  value={couponForm.label}
                  onChange={(e) => setCouponForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="20% de descuento en toda la tienda"
                  className="px-3 py-2 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Compra mínima $</label>
                <input
                  type="number"
                  min={0}
                  value={couponForm.min_purchase}
                  onChange={(e) => setCouponForm((p) => ({ ...p, min_purchase: e.target.value }))}
                  placeholder="20000"
                  className="px-3 py-2 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Usos máximos</label>
                <input
                  type="number"
                  min={1}
                  value={couponForm.max_uses}
                  onChange={(e) => setCouponForm((p) => ({ ...p, max_uses: e.target.value }))}
                  placeholder="100"
                  className="px-3 py-2 rounded-lg border text-sm bg-transparent text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 max-w-xs">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Expira</label>
              <input
                type="date"
                value={couponForm.expires_at}
                onChange={(e) => setCouponForm((p) => ({ ...p, expires_at: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-sm bg-transparent text-[var(--text)] focus:outline-none focus:border-indigo-500 transition-colors"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            {couponError && <p className="text-xs text-red-500">{couponError}</p>}
            <button
              onClick={createCoupon}
              disabled={couponSaving}
              className="self-start px-5 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {couponSaving ? "Guardando..." : "Crear cupón"}
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="font-black text-[var(--text)]">{coupons.length} cupones</p>
            </div>
            {coupons.length === 0 ? (
              <div className="py-16 text-center">
                <span className="text-4xl block mb-3">🏷️</span>
                <p className="text-sm text-[var(--text-muted)]">Aún no hay cupones creados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                      {["Código", "Tipo", "Descuento", "Descripción", "Compra mín.", "Usos", "Expira", "Estado", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-[var(--surface-alt)] transition-colors" style={{ borderColor: "var(--border)" }}>
                        <td className="px-4 py-3 font-mono font-black text-indigo-500">{c.code}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{c.type === "fixed" ? "$ Fijo" : "% Porcentaje"}</td>
                        <td className="px-4 py-3 font-bold text-[var(--text)]">
                          {c.type === "fixed"
                            ? `$${Number(c.discount).toLocaleString("es-CL")}`
                            : `${Math.round(c.discount * 100)}%`}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{c.label}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">
                          {c.min_purchase ? `$${Number(c.min_purchase).toLocaleString("es-CL")}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">
                          {c.max_uses ? `${c.uses_count ?? 0}/${c.max_uses}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("es-CL") : "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleCoupon(c.id, !c.active)}
                            className={`px-2 py-1 rounded-full text-[10px] font-black border transition-colors ${c.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}
                          >
                            {c.active ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteCoupon(c.id)}
                            className="text-[var(--text-muted)] hover:text-red-500 transition-colors text-xs font-bold"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
