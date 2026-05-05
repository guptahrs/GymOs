export default function KpiCard({ title, value, icon: Icon, color, trend }) {
  const hasTrend = trend !== undefined && trend !== null;
  const trendColor =
    trend > 0 ? "text-success" : trend < 0 ? "text-danger" : "text-gray-400";
  const trendArrow = trend > 0 ? "▲" : trend < 0 ? "▼" : "→";

  return (
    <div
      className="group cursor-pointer rounded-2xl border border-gray-800 bg-card p-5 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm text-gray-400">{title}</h2>
        <Icon className={`text-xl ${color}`} />
      </div>

      <div className="text-2xl font-bold text-white">{value || 0}</div>

      {hasTrend ? (
        <div className={`mt-2 text-sm ${trendColor}`}>
          {trendArrow} {Math.abs(trend)}%
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-500">No prior baseline</div>
      )}
    </div>
  );
}
