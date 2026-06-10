export type Category =
  | "salud"
  | "belleza"
  | "hogar"
  | "wearables"
  | "mascotas"
  | "gadgets"
  | "audio"
  | "oficina";

export type ProductTag = "bestseller" | "nuevo" | "descuento" | null;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  icon: string;
  tag: ProductTag;
  stock: number;
  rating?: number;
  review_count?: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered";
  transbank_token: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}
