import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admins = (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim());
  if (!user || !admins.includes(user.email ?? "")) redirect("/");

  const adminSupabase = createAdminClient();

  const [{ data: products }, { data: orders }, { data: coupons }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    adminSupabase.from("coupons").select("*").order("created_at", { ascending: false }),
  ]);

  return <AdminClient products={products ?? []} orders={orders ?? []} coupons={coupons ?? []} />;
}
