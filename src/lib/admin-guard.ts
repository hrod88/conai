import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<{ error: Response } | { ok: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admins = (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim());
  if (!user || !admins.includes(user.email ?? "")) {
    return { error: Response.json({ error: "No autorizado" }, { status: 403 }) };
  }

  return { ok: true };
}
