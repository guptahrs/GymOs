export default function KpiCard({ title, value, icon: Icon, color, trend }) {
  const hasTrend = trend !== undefined && trend !== null;
  const trendColor =
    trend > 0 ? "text-success" : trend < 0 ? "text-danger" : "theme-muted";
  const trendArrow = trend > 0 ? "▲" : trend < 0 ? "▼" : "→";

  return (
    <div className="theme-panel group cursor-pointer rounded-2xl border p-5 shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.18)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="theme-muted text-sm">{title}</h2>
        <Icon className={`text-xl ${color}`} />
      </div>

      <div className="theme-text text-2xl font-bold">{value || 0}</div>

      {hasTrend ? (
        <div className={`mt-2 text-sm ${trendColor}`}>
          {trendArrow} {Math.abs(trend)}%
        </div>
      ) : (
        <div className="theme-soft mt-2 text-sm">No prior baseline</div>
      )}
    </div>
  );
}
