"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export default function PagoExitoPage() {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center flex flex-col gap-6 items-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl">
          ✅
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1a1a2e]">¡Pago exitoso!</h1>
          <p className="text-gray-400 text-sm mt-2">
            Tu pedido fue confirmado. Te enviaremos un email con los detalles.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 w-full text-left flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚚</span>
            <div>
              <p className="text-sm font-bold text-[#1a1a2e]">Envío en camino</p>
              <p className="text-xs text-gray-400">3–5 días hábiles a todo Chile</p>
            </div>
          </div>
          <hr className="border-gray-100" />
          <div className="flex items-center gap-3">
            <span className="text-xl">📧</span>
            <div>
              <p className="text-sm font-bold text-[#1a1a2e]">Confirmación enviada</p>
              <p className="text-xs text-gray-400">Revisa tu bandeja de entrada</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/productos"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-full text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors"
          >
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
