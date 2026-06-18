import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Si no hay usuario logueado, no hay dirección que devolver.
    if (!user) {
      return Response.json({ address: null });
    }

    // Leer la dirección del usuario. El RLS garantiza que solo
    // puede leer las suyas (auth.uid() = user_id).
    const { data, error } = await supabase
      .from("user_addresses")
      .select("name, phone, address, city, region")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Si falla la lectura, devolvemos null en vez de romper el checkout.
      console.error("Error leyendo dirección:", error);
      return Response.json({ address: null });
    }

    return Response.json({ address: data ?? null });
  } catch (err) {
    console.error("my-address error:", err);
    return Response.json({ address: null });
  }
}