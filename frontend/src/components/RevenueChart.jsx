import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ data }) {
  return (
    <div className="theme-panel mt-6 w-full rounded-2xl border p-6 shadow-md">
      <h2 className="theme-muted mb-4 text-lg">Revenue vs Expense</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="month" stroke="var(--color-text-soft)" />
          <YAxis stroke="var(--color-text-soft)" />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border-app)",
              color: "var(--color-text-app)",
              borderRadius: "12px",
            }}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#22C55E"
            strokeWidth={2}
          />

          <Line
            type="monotone"
            dataKey="expense"
            stroke="#EF4444"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
