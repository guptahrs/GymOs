import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, CreditCard, TrendingUp, XCircle, Clock } from "lucide-react";
import API from "../api/client";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

const STATUS_STYLES = {
  paid:    "bg-green-500/20 text-green-400 border border-green-500/30",
  failed:  "bg-red-500/20 text-red-400 border border-red-500/30",
  created: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
};

const STATUS_OPTIONS = ["all", "paid", "failed", "created"];

export default function SuperAdminPayments() {
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery(
    ["superadmin_payments", statusFilter, search],
    async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search.trim())          params.append("search", search.trim());
      const res = await API.get(`/subscriptions/payment/all/?${params}`);
      return res.data.data;
    },
    { keepPreviousData: true }
  );

  const payments = data?.payments || [];
  const summary  = data?.summary  || {};

  return (
    <SuperAdminLayout>
      <div className="w-full">

        {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Payments</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track all gym subscription payments
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Revenue",
              value: `₹${(summary.revenue || 0).toLocaleString()}`,
              icon:  TrendingUp,
              color: "text-primary bg-primary/10",
            },
            {
              label: "Paid",
              value: summary.paid || 0,
              icon:  CreditCard,
              color: "text-green-400 bg-green-500/10",
            },
            {
              label: "Failed",
              value: summary.failed || 0,
              icon:  XCircle,
              color: "text-red-400 bg-red-500/10",
            },
            {
              label: "Pending",
              value: summary.created || 0,
              icon:  Clock,
              color: "text-yellow-400 bg-yellow-500/10",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-gray-800 rounded-xl p-4 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">

          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by gym name..."
              className="input pl-9 w-full"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition ${
                  statusFilter === s
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-gray-500 text-sm">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center text-gray-600 text-sm">
              No payments found.
            </div>
          ) : (
            <table className="w-full table-auto text-sm text-left">
              <thead className="bg-[#0B1220] text-gray-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-4">Gym</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Razorpay Order</th>
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.order_id}
                    className="border-t border-gray-800 hover:bg-gray-800/30 transition"
                  >
                    {/* Gym */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {p.gym_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{p.gym_name}</span>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="p-4">
                      <span
                        className="px-2.5 py-1 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: p.plan_badge_color || "#3b82f6" }}
                      >
                        {p.plan_name}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <span className="text-white font-semibold">
                        ₹{p.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Razorpay Order ID */}
                    <td className="p-4">
                      <code className="text-xs text-gray-500 font-mono">
                        {p.razorpay_order_id}
                      </code>
                    </td>

                    {/* Payment ID */}
                    <td className="p-4">
                      <code className="text-xs text-gray-500 font-mono">
                        {p.razorpay_payment_id}
                      </code>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${STATUS_STYLES[p.status] || "bg-gray-700 text-gray-400"}`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-gray-400 text-xs">
                      {p.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}