import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<{ error: Response } | { ok: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { error: Response.json({ error: "No autorizado" }, { status: 403 }) };
  }

  return { ok: true };
}
