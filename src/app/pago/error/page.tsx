import Link from "next/link";

export default function PagoErrorPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center flex flex-col gap-6 items-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-4xl">
          ❌
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1a1a2e]">Pago no completado</h1>
          <p className="text-gray-400 text-sm mt-2">
            El pago fue rechazado o cancelado. Tu carrito sigue guardado.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full text-left">
          <p className="text-sm font-semibold text-amber-700">¿Qué puede haber pasado?</p>
          <ul className="text-xs text-amber-600 mt-2 flex flex-col gap-1 list-disc list-inside">
            <li>Fondos insuficientes en la tarjeta</li>
            <li>Cancelaste el proceso de pago</li>
            <li>Timeout en la sesión de Transbank</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="/carrito"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-sky-400 text-white font-bold rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Volver al carrito
          </Link>
          <Link
            href="/contacto"
            className="px-6 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-full text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors"
          >
            Contactar soporte
          </Link>
        </div>
      </div>
    </div>
  );
}
