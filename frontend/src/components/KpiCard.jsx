export default function KpiCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="group bg-card p-5 rounded-2xl border border-gray-800
            shadow-md
            hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]
            hover:border-blue-500/40
            hover:scale-[1.02]
            transition-all duration-300 cursor-pointer">
      
      {/* Top */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm text-gray-400">{title}</h2>
        <Icon className={`text-xl ${color}`} />
      </div>

      {/* Value */}
      <div className="text-2xl font-bold text-white">
        {value || 0}
      </div>

      {/* Trend */}
      {trend && (
        <div
          className={`text-sm mt-2 ${
            trend > 0 ? "text-success" : "text-danger"
          }`}
        >
          {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}