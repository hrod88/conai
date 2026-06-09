"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "register";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email o contraseña incorrectos.");
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Revisa tu email para confirmar tu cuenta.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black gradient-text">
            conAI
          </Link>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: "var(--surface-alt)" }}
        >
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setMessage(""); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                mode === m
                  ? "text-[var(--text)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              style={mode === m ? { background: "var(--surface)" } : {}}
            >
              {m === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-[var(--text)]"
              style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-[var(--text)]"
              style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm mt-1"
          >
            {loading
              ? "Cargando..."
              : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Al continuar aceptas nuestros{" "}
          <span className="text-indigo-500 cursor-pointer hover:underline">términos de servicio</span>
        </p>
      </div>
    </div>
  );
}
