"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-full border text-sm font-bold transition-colors hover:border-red-300 hover:text-red-500"
      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
    >
      Cerrar sesión
    </button>
  );
}
