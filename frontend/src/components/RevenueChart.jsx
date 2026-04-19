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
    <div className="bg-card p-6 rounded-2xl shadow-md mt-6 w-full">
      <h2 className="text-lg mb-4 text-gray-300">
        Revenue vs Expense
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          
          <XAxis dataKey="month" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />

          <Tooltip
            contentStyle={{
              backgroundColor: "#0F172A",
              border: "none",
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