"use client";

const brands = [
  { name: "Apple", icon: "🍎" },
  { name: "Samsung", icon: "📱" },
  { name: "Xiaomi", icon: "📲" },
  { name: "Philips", icon: "💡" },
  { name: "Garmin", icon: "⌚" },
  { name: "Dyson", icon: "🌀" },
  { name: "DJI", icon: "🚁" },
  { name: "Withings", icon: "❤️" },
  { name: "Foreo", icon: "✨" },
  { name: "iRobot", icon: "🤖" },
  { name: "Nest", icon: "🏠" },
  { name: "Oura", icon: "💍" },
];

export default function BrandsTicker() {
  const items = [...brands, ...brands];
  return (
    <div className="overflow-hidden py-6 border-y" style={{ borderColor: "var(--border)" }}>
      <div
        className="flex items-center gap-10"
        style={{ animation: "tickerH 28s linear infinite", width: "max-content" }}
      >
        {items.map((b, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">{b.icon}</span>
            <span className="text-sm font-black text-[var(--text-muted)] tracking-wide">{b.name}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes tickerH {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
