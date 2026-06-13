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
  const [showCjPanel, setShowCjPanel] = useState(false);

  // Productos tab — split layout
  const [catSearch, setCatSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("__all__");
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [prodSearch, setProdSearch] = useState("");
  const [prodSort, setProdSort] = useState<"name" | "price" | "stock" | "rating">("name");
  const [prodSortDir, setProdSortDir] = useState<"asc" | "desc">("asc");
  const [selectedProds, setSelectedProds] = useState<Set<string>>(new Set());

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

  // AliExpress — importación manual por URL
  const [importSource, setImportSource] = useState<"cj" | "ae">("cj");
  const [aeUrl, setAeUrl]               = useState("");
  const [aeForm, setAeForm]             = useState({
    productId: "", title: "", imageUrl: "", price: "", originalPrice: "",
    category: "gadgets" as Category, subcategory: SUBCATEGORIES.gadgets[0].id, tag: "",
  });
  const [aeStatus, setAeStatus]         = useState<"idle" | "loading" | "done" | "error">("idle");
  const [aeError, setAeError]           = useState("");

  // Catálogo seed por categoría
  type SeedProduct = { pid: string; name: string; image: string | null; price: number; original_price: number; category: string; subcategory: string; tag: string; warehouse: string };
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
  const [seedWarehouse, setSeedWarehouse]   = useState<"CN" | "US">("CN");
  const [seedGroups, setSeedGroups]         = useState<SeedGroup[]>([]);
  const [seedSelected, setSeedSelected]     = useState<Set<string>>(new Set());
  const [seedLoading, setSeedLoading]       = useState(false);
  const [seedImporting, setSeedImporting]   = useState(false);
  const [seedImportDone, setSeedImportDone] = useState<number | null>(null);

  async function loadCategoryPreview(cat: string, wh = seedWarehouse) {
    setSeedCat(cat);
    setSeedLoading(true);
    setSeedGroups([]);
    setSeedSelected(new Set());
    setSeedImportDone(null);
    const res   = await fetch(`/api/admin/seed?category=${cat}&warehouse=${wh}`);
    const json  = await res.json();
    const groups: SeedGroup[] = json.groups ?? [];
    setSeedGroups(groups);
    setSeedSelected(new Set(groups.flatMap((g) => g.products.map((p) => `${g.id}:${p.pid}`))));
    setSeedLoading(false);
  }

  function toggleSeedProduct(key: string) {
    setSeedSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function confirmSeedImport() {
    const selected = seedGroups.flatMap((g) => g.products.filter((p) => seedSelected.has(`${g.id}:${p.pid}`)));
    if (!selected.length) return;
    setSeedImporting(true);
    const res  = await fetch("/api/admin/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: selected }),
    });
    const json = await res.json();
    if (json.error) {
      alert("Error al importar: " + json.error);
      setSeedImporting(false);
      return;
    }
    setSeedImportDone(json.inserted ?? 0);
    setSeedImporting(false);
    // Recargar lista de productos para actualizar el contador
    const pr = await fetch("/api/admin/products");
    const pj = await pr.json();
    if (Array.isArray(pj)) setProducts(pj);
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

  function handleAeUrl(url: string) {
    setAeUrl(url);
    const m = url.match(/\/item\/(\d+)/);
    if (m) setAeForm((f) => ({ ...f, productId: m[1] }));
  }

  async function importProductAE() {
    if (!aeForm.title.trim() || !aeForm.price || !aeForm.imageUrl.trim()) {
      setAeError("Título, imagen y precio son obligatorios");
      return;
    }
    setAeStatus("loading");
    setAeError("");
    const price = Number(aeForm.price);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:           aeForm.title.trim(),
        description:    aeForm.title.trim(),
        price,
        original_price: aeForm.originalPrice ? Number(aeForm.originalPrice) : Math.round(price * 1.35 / 100) * 100,
        category:       aeForm.category,
        subcategory:    aeForm.subcategory || null,
        tag:            aeForm.tag || null,
        image:          aeForm.imageUrl.trim(),
        icon:           CAT_ICONS[aeForm.category],
        cj_pid:         aeForm.productId ? `ae:${aeForm.productId}` : null,
        stock:          50,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setAeStatus("done");
      setAeUrl(""); setAeForm({ productId: "", title: "", imageUrl: "", price: "", originalPrice: "", category: "gadgets", subcategory: SUBCATEGORIES.gadgets[0].id, tag: "" });
      const pr = await fetch("/api/admin/products");
      const pj = await pr.json();
      if (Array.isArray(pj)) setProducts(pj);
    } else {
      setAeStatus("error");
      setAeError(json.error ?? "Error al importar");
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

  const [enriching, setEnriching] = useState(false);
  const [enrichMsg, setEnrichMsg] = useState<string | null>(null);

  async function enrichImages() {
    if (!confirm("¿Enriquecer imágenes de todos los productos con CJ pid? Esto puede tardar ~1 min.")) return;
    setEnriching(true);
    setEnrichMsg(null);
    const res = await fetch("/api/admin/products/enrich", { method: "POST" });
    const json = await res.json();
    if (json.error) {
      setEnrichMsg("Error: " + json.error);
    } else {
      setEnrichMsg(`✅ ${json.enriched} de ${json.total} productos enriquecidos`);
    }
    setEnriching(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    setSaving(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSaving(null);
  }

  async function toggleActiveProduct(id: string, active: boolean) {
    setSaving(id);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active } : p));
    setSaving(null);
  }

  async function bulkDeleteProducts() {
    if (!confirm(`¿Eliminar ${selectedProds.size} productos? Esta acción no se puede deshacer.`)) return;
    setSaving("__bulk__");
    await Promise.all([...selectedProds].map((id) => fetch(`/api/admin/products/${id}`, { method: "DELETE" })));
    setProducts((prev) => prev.filter((p) => !selectedProds.has(p.id)));
    setSelectedProds(new Set());
    setSaving(null);
  }

  async function bulkChangeTag(tag: string) {
    setSaving("__bulk__");
    await Promise.all([...selectedProds].map((id) =>
      fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tag || null }),
      })
    ));
    setProducts((prev) => prev.map((p) => selectedProds.has(p.id) ? { ...p, tag: (tag || null) as Product["tag"] } : p));
    setSaving(null);
  }

  async function bulkMoveCategory(cat: Category) {
    if (!cat) return;
    setSaving("__bulk__");
    await Promise.all([...selectedProds].map((id) =>
      fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, subcategory: null }),
      })
    ));
    setProducts((prev) => prev.map((p) => selectedProds.has(p.id) ? { ...p, category: cat, subcategory: null } : p));
    setSelectedProds(new Set());
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

  // Productos tab — computed
  const catCounts = ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const filteredProds = products
    .filter((p) => {
      if (selectedCat !== "__all__" && p.category !== selectedCat) return false;
      if (selectedSubcat && p.subcategory !== selectedSubcat) return false;
      if (prodSearch && !p.name.toLowerCase().includes(prodSearch.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (prodSort === "price")  cmp = a.price - b.price;
      if (prodSort === "stock")  cmp = a.stock - b.stock;
      if (prodSort === "rating") cmp = (a.rating ?? 0) - (b.rating ?? 0);
      if (prodSort === "name")   cmp = a.name.localeCompare(b.name);
      return prodSortDir === "asc" ? cmp : -cmp;
    });

  const allProdsSelected = filteredProds.length > 0 && filteredProds.every((p) => selectedProds.has(p.id));

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
        <>
          {/* Panel CJ colapsable */}
          <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <button
              onClick={() => setShowCjPanel((v) => !v)}
              className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--surface-alt)] transition-colors"
            >
              <span>🔗 Vincular productos con CJ Dropshipping</span>
              <span>{showCjPanel ? "▲" : "▼"}</span>
            </button>
            {showCjPanel && (
              <div className="border-t px-5 py-3 flex flex-col gap-2" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
                <div className="flex gap-2">
                  <input
                    value={cjSearch}
                    onChange={(e) => setCjSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchCJ()}
                    placeholder="Buscar en CJ Dropshipping..."
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400"
                    style={inputStyle}
                  />
                  <button onClick={searchCJ} disabled={cjLoading} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50">
                    {cjLoading ? "..." : "Buscar CJ"}
                  </button>
                </div>
                {cjResults.length > 0 && (
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    <p className="text-[10px] font-bold text-[var(--text-muted)]">{cjResults.length} resultados — haz clic en &quot;Vincular&quot; junto al producto conAI</p>
                    {cjResults.map((cj) => (
                      <div key={cj.pid} className="flex items-center gap-3 text-xs py-1 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {cj.productImage && <img src={cj.productImage} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-semibold truncate text-[var(--text)]">{cj.productNameEn}</p>
                            <p className="text-[var(--text-muted)]">PID: {cj.pid} · USD {cj.sellPrice}</p>
                          </div>
                        </div>
                        <button onClick={() => setLinkingProduct(linkingProduct === cj.pid ? null : cj.pid)} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex-shrink-0">
                          {linkingProduct === cj.pid ? "Cancelar" : "Vincular →"}
                        </button>
                        {linkingProduct === cj.pid && (
                          <div className="flex flex-col gap-0.5 text-[10px] flex-shrink-0 max-h-28 overflow-y-auto">
                            <p className="font-bold text-[var(--text-muted)]">¿A cuál?</p>
                            {products.map((p) => (
                              <button key={p.id} onClick={() => linkCJ(p.id, cj.pid)} className="text-left px-2 py-0.5 rounded hover:bg-indigo-100 text-[var(--text)]">
                                {p.icon} {p.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Split layout */}
          <div className="rounded-xl border overflow-hidden flex" style={{ background: "var(--surface)", borderColor: "var(--border)", height: "calc(100vh - 360px)", minHeight: "520px" }}>

            {/* ── Izquierda: Categorías ── */}
            <div className="w-52 flex-shrink-0 border-r flex flex-col" style={{ borderColor: "var(--border)" }}>
              <div className="px-3 py-3 border-b flex flex-col gap-2" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Categorías</span>
                  <div className="flex items-center gap-2">
                    {products.some((p) => p.cj_pid) && (
                      <button onClick={enrichImages} disabled={enriching} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 disabled:opacity-40 transition-colors" title="Enriquecer imágenes desde CJ">
                        {enriching ? "⏳" : "🖼 imgs"}
                      </button>
                    )}
                    {products.length > 0 && (
                      <button onClick={deleteAllProducts} disabled={saving === "__all__"} className="text-[10px] font-bold text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors" title="Eliminar todos">
                        🗑 todos
                      </button>
                    )}
                  </div>
                </div>
                {enrichMsg && (
                  <p className="text-[10px] text-indigo-600 font-semibold">{enrichMsg}</p>
                )}
                <input
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Buscar categoría..."
                  className="w-full text-xs px-2 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400"
                  style={inputStyle}
                />
              </div>

              {/* Todos */}
              <button
                onClick={() => { setSelectedCat("__all__"); setSelectedSubcat(null); setSelectedProds(new Set()); }}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors border-b ${selectedCat === "__all__" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" : "text-[var(--text)] hover:bg-[var(--surface-alt)]"}`}
                style={{ borderColor: "var(--border)" }}
              >
                <span>✦ Todos</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${selectedCat === "__all__" ? "bg-indigo-100 text-indigo-600" : "bg-[var(--border)] text-[var(--text-muted)]"}`}>{products.length}</span>
              </button>

              {/* Lista de categorías */}
              <div className="flex-1 overflow-y-auto">
                {ALL_CATEGORIES
                  .filter((cat) => !catSearch || cat.toLowerCase().includes(catSearch.toLowerCase()))
                  .map((cat) => (
                    <div key={cat}>
                      <div
                        className={`flex items-center gap-1.5 px-3 py-2 cursor-pointer transition-colors ${selectedCat === cat && !selectedSubcat ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" : "text-[var(--text)] hover:bg-[var(--surface-alt)]"}`}
                        onClick={() => {
                          setSelectedCat(cat);
                          setSelectedSubcat(null);
                          setSelectedProds(new Set());
                          setExpandedCats((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
                        }}
                      >
                        <span className="text-sm">{CAT_ICONS[cat as Category]}</span>
                        <span className="flex-1 text-xs font-semibold capitalize truncate">{cat}</span>
                        <span className="text-[10px] font-black text-[var(--text-muted)]">{catCounts[cat] ?? 0}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">{expandedCats.has(cat) ? "▼" : "▶"}</span>
                      </div>
                      {/* Barra de progreso */}
                      <div className="px-3 pb-1.5">
                        <div className="h-0.5 rounded-full" style={{ background: "var(--border)" }}>
                          <div className="h-0.5 rounded-full bg-indigo-400 transition-all" style={{ width: `${products.length ? ((catCounts[cat] ?? 0) / products.length) * 100 : 0}%` }} />
                        </div>
                      </div>
                      {/* Subcategorías */}
                      {expandedCats.has(cat) && SUBCATEGORIES[cat as Category]?.map((sub) => {
                        const cnt = products.filter((p) => p.category === cat && p.subcategory === sub.id).length;
                        if (cnt === 0) return null;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => { setSelectedCat(cat); setSelectedSubcat(sub.id); setSelectedProds(new Set()); }}
                            className={`w-full flex items-center justify-between pl-8 pr-3 py-1.5 text-[11px] transition-colors ${selectedSubcat === sub.id ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]"}`}
                          >
                            <span className="truncate">— {sub.label}</span>
                            <span className="font-bold ml-1 flex-shrink-0">{cnt}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
              </div>

              <div className="px-3 py-2 border-t text-[10px] text-[var(--text-muted)]" style={{ borderColor: "var(--border)" }}>
                Total: {products.length} productos
              </div>
            </div>

            {/* ── Derecha: Productos ── */}
            <div className="flex-1 flex flex-col min-w-0">

              {/* Breadcrumb */}
              <div className="px-4 py-2 border-b flex items-center gap-1 text-xs flex-wrap" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => { setSelectedCat("__all__"); setSelectedSubcat(null); }} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Todos</button>
                {selectedCat !== "__all__" && (
                  <><span className="text-[var(--text-muted)]">›</span>
                  <button onClick={() => setSelectedSubcat(null)} className="text-[var(--text-muted)] hover:text-[var(--text)] capitalize transition-colors">{selectedCat}</button></>
                )}
                {selectedSubcat && (
                  <><span className="text-[var(--text-muted)]">›</span>
                  <span className="font-semibold text-[var(--text)]">{SUBCATEGORIES[selectedCat as Category]?.find((s) => s.id === selectedSubcat)?.label}</span></>
                )}
                <span className="ml-auto font-bold text-[var(--text)]">{filteredProds.length} productos</span>
              </div>

              {/* Toolbar */}
              <div className="px-4 py-2 border-b flex items-center gap-2 flex-wrap" style={{ borderColor: "var(--border)" }}>
                <input
                  value={prodSearch}
                  onChange={(e) => { setProdSearch(e.target.value); setSelectedProds(new Set()); }}
                  placeholder="Buscar producto..."
                  className="text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-indigo-400 w-44"
                  style={inputStyle}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Ordenar:</span>
                {(["name", "price", "stock", "rating"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { if (prodSort === s) setProdSortDir((d) => d === "asc" ? "desc" : "asc"); else { setProdSort(s); setProdSortDir("asc"); } }}
                    className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${prodSort === s ? "bg-indigo-600 text-white border-indigo-600" : "border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-400"}`}
                  >
                    {s === "name" ? "A-Z" : s === "price" ? "Precio" : s === "stock" ? "Stock" : "Rating"}
                    {prodSort === s && (prodSortDir === "asc" ? " ↑" : " ↓")}
                  </button>
                ))}
              </div>

              {/* Header tabla */}
              <div className="grid items-center px-4 py-2 border-b text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]"
                style={{ borderColor: "var(--border)", gridTemplateColumns: "auto 1fr auto auto auto auto auto auto" }}>
                <input
                  type="checkbox"
                  checked={allProdsSelected}
                  onChange={() => setSelectedProds(allProdsSelected ? new Set() : new Set(filteredProds.map((p) => p.id)))}
                  className="mr-3 accent-indigo-500 w-3.5 h-3.5"
                />
                <span>Producto</span>
                <span className="px-2 text-right">Precio</span>
                <span className="px-2 text-right">Stock</span>
                <span className="px-2">Tag</span>
                <span className="px-2 text-center">Rating</span>
                <span className="px-2 text-center">Vis.</span>
                <span className="px-2" />
              </div>

              {/* Filas */}
              <div className="flex-1 overflow-y-auto">
                {filteredProds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--text-muted)]">
                    <span className="text-3xl">📦</span>
                    <p className="text-sm">{prodSearch ? "Sin resultados para esa búsqueda" : "Sin productos en esta categoría"}</p>
                  </div>
                ) : filteredProds.map((p) => {
                  const discountPct = p.original_price && p.original_price > p.price
                    ? Math.round((p.original_price - p.price) / p.original_price * 100) : null;
                  const isActive = p.active !== false;
                  return (
                    <div
                      key={p.id}
                      className={`grid items-center px-4 py-2 border-b transition-colors hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 ${selectedProds.has(p.id) ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}
                      style={{ borderColor: "var(--border)", gridTemplateColumns: "auto 1fr auto auto auto auto auto auto", opacity: saving === p.id ? 0.5 : isActive ? 1 : 0.45 }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProds.has(p.id)}
                        onChange={() => setSelectedProds((prev) => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })}
                        className="mr-3 accent-indigo-500 w-3.5 h-3.5"
                      />
                      {/* Info producto */}
                      <div className="flex items-center gap-2 min-w-0">
                        {p.image
                          ? <img src={p.image} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                          : <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">{p.icon}</div>
                        }
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-[var(--text)] max-w-[200px]">{p.name}</p>
                          <div className="flex items-center gap-1.5">
                            {p.subcategory && <span className="text-[9px] text-[var(--text-muted)]">{p.subcategory}</span>}
                            {!p.cj_pid && <span className="text-[9px] text-amber-500 font-bold">⚠ sin CJ</span>}
                            {p.review_count ? <span className="text-[9px] text-[var(--text-muted)]">{p.review_count} reseñas</span> : null}
                          </div>
                        </div>
                      </div>
                      {/* Precio */}
                      <div className="px-2 text-right">
                        <input
                          type="number"
                          defaultValue={p.price}
                          onBlur={(e) => { const v = Number(e.target.value); if (v !== p.price) updateProduct(p.id, { price: v }); }}
                          className="w-24 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-transparent border-b border-transparent hover:border-indigo-300 focus:border-indigo-500 focus:outline-none"
                        />
                        {p.original_price && <p className="text-[9px] text-[var(--text-muted)] line-through">${p.original_price.toLocaleString("es-CL")}</p>}
                        {discountPct && <span className="text-[9px] font-bold text-emerald-600">-{discountPct}%</span>}
                      </div>
                      {/* Stock */}
                      <div className="px-2 text-right">
                        <input
                          type="number"
                          defaultValue={p.stock}
                          min={0}
                          onBlur={(e) => { const v = Number(e.target.value); if (v !== p.stock) updateProduct(p.id, { stock: v }); }}
                          className={`w-14 text-right text-xs font-bold bg-transparent border-b border-transparent hover:border-indigo-300 focus:border-indigo-500 focus:outline-none ${p.stock === 0 ? "text-red-500" : p.stock < 5 ? "text-amber-500" : "text-emerald-600"}`}
                        />
                        <div className="flex justify-end gap-0.5 mt-0.5">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < (p.stock === 0 ? 0 : p.stock < 5 ? 1 : 3) ? p.stock === 0 ? "bg-red-400" : p.stock < 5 ? "bg-amber-400" : "bg-emerald-400" : "bg-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      {/* Tag */}
                      <div className="px-2">
                        <select
                          value={p.tag ?? ""}
                          onChange={(e) => updateProduct(p.id, { tag: e.target.value || null })}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-transparent cursor-pointer focus:outline-none"
                          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                        >
                          {tagOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      {/* Rating */}
                      <div className="px-2 text-center">
                        <span className="text-[10px] font-bold text-amber-500">★ {p.rating?.toFixed(1) ?? "—"}</span>
                      </div>
                      {/* Visibilidad */}
                      <div className="px-2 text-center">
                        <button
                          onClick={() => toggleActiveProduct(p.id, !isActive)}
                          className="text-sm transition-opacity hover:opacity-60"
                          title={isActive ? "Publicado — clic para ocultar" : "Oculto — clic para publicar"}
                        >
                          {isActive ? "👁" : "🚫"}
                        </button>
                      </div>
                      {/* Eliminar */}
                      <div className="px-2">
                        <button onClick={() => deleteProduct(p.id)} disabled={saving === p.id} className="text-[var(--text-muted)] hover:text-red-500 disabled:opacity-40 transition-colors text-sm">🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Barra flotante de acciones masivas */}
          {selectedProds.size > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <span className="text-sm font-black text-[var(--text)]">{selectedProds.size} seleccionados</span>
              <div className="h-4 w-px" style={{ background: "var(--border)" }} />
              <button onClick={bulkDeleteProducts} disabled={saving === "__bulk__"} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
                {saving === "__bulk__" ? "..." : "🗑 Eliminar"}
              </button>
              <select
                defaultValue=""
                onChange={(e) => { if (e.target.value) { bulkChangeTag(e.target.value); (e.target as HTMLSelectElement).value = ""; } }}
                className="text-xs font-bold px-2 py-1.5 rounded-lg border cursor-pointer focus:outline-none"
                style={inputStyle}
              >
                <option value="" disabled>🏷 Cambiar tag...</option>
                {tagOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                defaultValue=""
                onChange={(e) => { if (e.target.value) bulkMoveCategory(e.target.value as Category); }}
                className="text-xs font-bold px-2 py-1.5 rounded-lg border cursor-pointer focus:outline-none"
                style={inputStyle}
              >
                <option value="" disabled>📂 Mover a categoría...</option>
                {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
              </select>
              <button onClick={() => setSelectedProds(new Set())} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">✕</button>
            </div>
          )}
        </>
      )}

      {/* ── Tab Importar ─────────────────────────────────────── */}
      {tab === "importar" && (
        <div className="flex flex-col gap-4">

          {/* Toggle fuente */}
          <div className="flex gap-2">
            {(["cj", "ae"] as const).map((src) => (
              <button
                key={src}
                onClick={() => setImportSource(src)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                  importSource === src
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-400"
                }`}
              >
                {src === "cj" ? "🟠 CJ Dropshipping" : "🔴 AliExpress URL"}
              </button>
            ))}
          </div>

          {/* ── AliExpress import manual ── */}
          {importSource === "ae" && (
            <div className="rounded-xl border p-5 flex flex-col gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div>
                <p className="text-sm font-bold text-[var(--text)]">Importar desde AliExpress</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Pega la URL del producto, copia el título e imagen desde AliExpress y guárdalo.</p>
              </div>

              {/* URL */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">URL de AliExpress</label>
                <input
                  value={aeUrl}
                  onChange={(e) => handleAeUrl(e.target.value)}
                  placeholder="https://www.aliexpress.com/item/1005010167316120.html"
                  className="text-sm px-3 py-2.5 rounded-lg border focus:outline-none focus:border-indigo-400"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                />
                {aeForm.productId && (
                  <p className="text-[11px] text-emerald-600 font-semibold">✓ ID detectado: {aeForm.productId} —{" "}
                    <a href={`https://www.aliexpress.com/item/${aeForm.productId}.html`} target="_blank" rel="noreferrer" className="underline">ver en AliExpress</a>
                  </p>
                )}
              </div>

              {/* Título */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Título del producto</label>
                <input
                  value={aeForm.title}
                  onChange={(e) => setAeForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Copia el nombre desde la página de AliExpress"
                  className="text-sm px-3 py-2.5 rounded-lg border focus:outline-none focus:border-indigo-400"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              {/* Imagen */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">URL de imagen principal</label>
                <input
                  value={aeForm.imageUrl}
                  onChange={(e) => setAeForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="Clic derecho → copiar dirección de imagen en AliExpress"
                  className="text-sm px-3 py-2.5 rounded-lg border focus:outline-none focus:border-indigo-400"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                />
                {aeForm.imageUrl && (
                  <img src={aeForm.imageUrl} alt="" className="w-24 h-24 rounded-lg object-cover mt-1 border" style={{ borderColor: "var(--border)" }} />
                )}
              </div>

              {/* Precio */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Precio CLP $</label>
                  <input
                    type="number"
                    value={aeForm.price}
                    onChange={(e) => setAeForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="29990"
                    className="text-sm px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-400"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Precio original $ (tachado)</label>
                  <input
                    type="number"
                    value={aeForm.originalPrice}
                    onChange={(e) => setAeForm((f) => ({ ...f, originalPrice: e.target.value }))}
                    placeholder="Auto +35%"
                    className="text-sm px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-400"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>

              {/* Categoría + subcategoría + etiqueta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Categoría</label>
                  <select
                    value={aeForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as Category;
                      setAeForm((f) => ({ ...f, category: cat, subcategory: SUBCATEGORIES[cat][0].id }));
                    }}
                    className="text-sm px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-400 capitalize"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Subcategoría</label>
                  <select
                    value={aeForm.subcategory}
                    onChange={(e) => setAeForm((f) => ({ ...f, subcategory: e.target.value }))}
                    className="text-sm px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-400"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    {SUBCATEGORIES[aeForm.category].map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Etiqueta</label>
                  <select
                    value={aeForm.tag}
                    onChange={(e) => setAeForm((f) => ({ ...f, tag: e.target.value }))}
                    className="text-sm px-3 py-2 rounded-lg border focus:outline-none focus:border-indigo-400"
                    style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    {tagOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Error */}
              {aeError && <p className="text-sm text-red-500">{aeError}</p>}

              {/* Botón */}
              {aeStatus === "done" ? (
                <div className="py-3 text-center text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200">
                  ✅ Producto importado correctamente
                </div>
              ) : (
                <button
                  onClick={importProductAE}
                  disabled={aeStatus === "loading"}
                  className="w-full py-3 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {aeStatus === "loading" ? "Importando..." : "Importar a mi tienda →"}
                </button>
              )}
            </div>
          )}

          {/* ── CJ search (existing) ── */}
          <div className="flex flex-col gap-4" style={{ display: importSource !== "cj" ? "none" : "flex" }}>
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
        </div>
      )}

      {/* ── Tab Catálogo ─────────────────────────────────────── */}
      {tab === "catalogo" && (
        <div className="rounded-xl border p-4 flex flex-col gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div>
            <p className="text-sm font-bold text-[var(--text)]">🚀 Importar catálogo por categoría</p>
            <p className="text-xs text-[var(--text-muted)]">Elige una categoría, previsualiza los productos y confirma los que quieres importar</p>
          </div>

          {/* Selector de bodega */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Bodega:</span>
            {(["CN", "US"] as const).map((wh) => (
              <button
                key={wh}
                onClick={() => {
                  setSeedWarehouse(wh);
                  if (seedCat) loadCategoryPreview(seedCat, wh);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  seedWarehouse === wh
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-300"
                }`}
              >
                {wh === "CN" ? "🇨🇳 China" : "🇺🇸 EE.UU."}
                {wh === "CN" && <span className="text-[9px] text-emerald-600 font-normal">×3.0</span>}
                {wh === "US" && <span className="text-[9px] text-blue-600 font-normal">×3.5</span>}
              </button>
            ))}
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
              Buscando en bodega {seedWarehouse === "US" ? "🇺🇸 EE.UU." : "🇨🇳 China"} — {seedCat ? CAT_SEED_META[seedCat]?.label : ""}...
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
                    onClick={() => setSeedSelected(new Set(seedGroups.flatMap((g) => g.products.map((p) => `${g.id}:${p.pid}`))))}
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
                      {group.products.map((p) => {
                        const selKey = `${group.id}:${p.pid}`;
                        return (
                        <label
                          key={selKey}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                            seedSelected.has(selKey)
                              ? "border-indigo-200 bg-indigo-50/50"
                              : "border-[var(--border)] opacity-50"
                          }`}
                          style={{ background: seedSelected.has(selKey) ? undefined : "var(--bg)" }}
                        >
                          <input
                            type="checkbox"
                            checked={seedSelected.has(selKey)}
                            onChange={() => toggleSeedProduct(selKey)}
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
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                            p.warehouse === "US" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                          }`}>
                            {p.warehouse === "US" ? "🇺🇸 US" : "🇨🇳 CN"}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            p.tag === "bestseller" ? "bg-amber-100 text-amber-700" :
                            p.tag === "nuevo"      ? "bg-emerald-100 text-emerald-700" :
                            p.tag === "destacado"  ? "bg-indigo-100 text-indigo-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {p.tag}
                          </span>
                        </label>
                        );
                      })}
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
