"use client";

import { useToastStore } from "@/store/toast";

const icons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const colors = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-indigo-500",
};

export default function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed bottom-20 right-4 z-[200] flex flex-col gap-2 md:bottom-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in flex items-center gap-3 bg-white dark:bg-[#1a1a2e] border border-gray-100 dark:border-[#2d2d4e] rounded-xl shadow-lg px-4 py-3 min-w-[240px] max-w-xs"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${colors[t.type]}`}>
            {icons[t.type]}
          </span>
          <p className="text-sm font-semibold text-[var(--text)] flex-1">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            className="text-gray-300 hover:text-gray-500 dark:text-[#4b5563] dark:hover:text-gray-300 text-lg leading-none ml-1"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
