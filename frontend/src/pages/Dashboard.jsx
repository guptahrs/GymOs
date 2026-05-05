import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Lock, TrendingUp, Users, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

import API from "../api/client";
import Greeting from "../components/Greeting";
import KpiCard from "../components/KpiCard";
import RevenueChart from "../components/RevenueChart";
import { useSubscriptionAccess } from "../hooks/useSubscriptionAccess";
import MainLayout from "../layouts/MainLayout";
import { showSnackbar } from "../utils/snackbarService";

function PeriodFilter({ active, onChange }) {
  const options = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ];

  return (
    <div className="flex gap-2 rounded-lg bg-gray-800 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded px-3 py-1 text-xs transition ${
            active === option.value
              ? "bg-primary text-white"
              : "text-gray-300 hover:bg-gray-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function DaysFilter({ active, onChange, disabled = false }) {
  return (
    <div className={`flex gap-2 rounded-lg p-1 ${disabled ? "bg-gray-900/80" : "bg-gray-800"}`}>
      {[7, 14, 30].map((day) => (
        <button
          key={day}
          disabled={disabled}
          onClick={() => onChange(day)}
          className={`rounded px-3 py-1 text-xs transition ${
            active === day
              ? "bg-primary text-white"
              : "text-gray-300 hover:bg-gray-700"
          } ${disabled ? "cursor-not-allowed opacity-40 hover:bg-transparent" : ""}`}
        >
          {day === 7 ? "Next 7 days" : `${day} days`}
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-green-500/20 text-green-400",
    expired: "bg-red-500/20 text-red-400",
    pending: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <span className={`rounded px-2 py-1 text-xs capitalize ${map[status] || "bg-gray-700 text-gray-400"}`}>
      {status}
    </span>
  );
}

function AccessBanner({ subscription }) {
  if (subscription.access_status === "trial") {
    return (
      <div className="mt-5 rounded-3xl border border-orange-400/20 bg-[linear-gradient(135deg,rgba(251,146,60,0.18),rgba(217,70,239,0.14))] p-4 text-white">
        <p className="text-sm font-semibold">Trial active</p>
        <p className="mt-1 text-sm text-slate-200">
          You have {subscription.days_left} days left. Pick a paid plan before trial expiry to avoid read-only mode.
        </p>
      </div>
    );
  }

  if (!subscription.is_read_only) {
    return null;
  }

  return (
    <div className="mt-5 rounded-3xl border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(14,165,233,0.1))] p-4 text-white">
      <p className="text-sm font-semibold">Workspace is in read-only mode</p>
      <p className="mt-1 text-sm text-slate-200">
        KPIs and charts stay visible, but new changes are locked until a plan is activated.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("monthly");
  const [days, setDays] = useState(7);
  const { data: subscription } = useSubscriptionAccess();

  const { data: kpi, isLoading: kpiLoading } = useQuery(
    ["dashboard_kpi"],
    async () => {
      const res = await API.get("/dashboard/kpis/");
      return res.data.data;
    },
    {
      onError: (err) =>
        showSnackbar(err?.response?.data?.message || "Failed to load KPIs", "error"),
    }
  );

  const { data: chartData = [], isLoading: chartLoading } = useQuery(
    ["dashboard_chart", period],
    async () => {
      const res = await API.get(`/dashboard/chart/?period=${period}`);
      return res.data.data || [];
    },
    {
      onError: () => showSnackbar("Failed to load chart data", "error"),
    }
  );

  const renewalsEnabled = Boolean(subscription?.can_manage_data);
  const { data: renewals = [], isLoading: renewalsLoading } = useQuery(
    ["dashboard_renewals", days],
    async () => {
      const res = await API.get(`/dashboard/renewals/?days=${days}`);
      return res.data.data || [];
    },
    {
      enabled: renewalsEnabled,
      onError: () => showSnackbar("Failed to load renewals", "error"),
    }
  );

  const actionButtons = [
    { label: "Generate Lead", path: "/leads/create", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Add Member", path: "/members/add", color: "bg-primary hover:bg-primary/80" },
    { label: "Add Staff", path: "/staff/add", color: "bg-pink-600 hover:bg-pink-700" },
    { label: "Add Trainer", path: "/trainer", color: "bg-yellow-500 hover:bg-yellow-600" },
    { label: "Add Plan", path: "/plan/add", color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Record Payment", path: "/payment/record", color: "bg-green-600 hover:bg-green-700" },
    { label: "View Attendance", path: "/attendance/view", color: "bg-gray-700 hover:bg-gray-800" },
  ];

  return (
    <MainLayout>
      <Greeting />
      <AccessBanner subscription={subscription || {}} />

      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
        <KpiCard
          title="Revenue"
          value={kpiLoading ? "..." : `Rs.${kpi?.total_revenue?.toLocaleString() ?? 0}`}
          icon={DollarSign}
          color="text-success"
          trend={kpi?.trends?.revenue}
        />
        <KpiCard
          title="Expense"
          value={kpiLoading ? "..." : `Rs.${kpi?.total_expense?.toLocaleString() ?? 0}`}
          icon={Wallet}
          color="text-danger"
          trend={kpi?.trends?.expense}
        />
        <KpiCard
          title="Net Profit"
          value={kpiLoading ? "..." : `Rs.${kpi?.net_profit?.toLocaleString() ?? 0}`}
          icon={TrendingUp}
          color="text-primary"
          trend={kpi?.trends?.net_profit}
        />
        <KpiCard
          title="Members"
          value={kpiLoading ? "..." : kpi?.total_members ?? 0}
          icon={Users}
          color="text-warning"
          trend={kpi?.trends?.members}
        />
      </div>

      <div className="mb-6 mt-8 flex flex-wrap gap-3">
        {actionButtons.map((button) => {
          const disabled = !subscription?.can_manage_data && button.label !== "View Attendance";
          return (
            <button
              key={button.label}
              disabled={disabled}
              onClick={() => navigate(button.path)}
              className={`${button.color} rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition ${
                disabled ? "cursor-not-allowed opacity-40 hover:bg-inherit" : ""
              }`}
            >
              {disabled ? `${button.label} Locked` : button.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 w-full rounded-2xl bg-card p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-gray-300">Revenue Trend</h2>
          <PeriodFilter active={period} onChange={setPeriod} />
        </div>
        {chartLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-500">
            Loading chart...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-600">
            No data yet for this period.
          </div>
        ) : (
          <RevenueChart data={chartData} />
        )}
      </div>

      <div className="mt-6 w-full rounded-2xl bg-card p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-gray-300">Upcoming Renewals</h2>
          <DaysFilter
            active={days}
            onChange={setDays}
            disabled={!renewalsEnabled}
          />
        </div>

        {!renewalsEnabled ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-[#0B1220] text-center">
            <Lock size={24} className="mb-3 text-gray-500" />
            <p className="text-sm font-medium text-gray-300">Upcoming renewals are disabled</p>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Activate a paid plan to manage renewal operations and other write actions again.
            </p>
          </div>
        ) : renewalsLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading renewals...</div>
        ) : renewals.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-600">
            No renewals in the next {days} days.
          </div>
        ) : (
          <table className="w-full table-auto text-left text-sm text-gray-300">
            <thead className="bg-[#0B1220] text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="p-2">Member</th>
                <th className="p-2">Plan</th>
                <th className="p-2">Renewal Date</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Remaining</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {renewals.map((row) => (
                <tr
                  key={row.member_id}
                  className="border-b border-gray-700 transition hover:bg-gray-800/40"
                >
                  <td className="p-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {row.name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{row.name}</div>
                        <div className="text-xs text-gray-500">{row.days_left} days left</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary">
                      {row.plan}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="text-white">{row.renewal_date}</div>
                    <div className={`text-xs ${row.days_left <= 3 ? "text-red-400" : "text-gray-500"}`}>
                      {row.days_left} day{row.days_left !== 1 ? "s" : ""} left
                    </div>
                  </td>
                  <td className="p-2 font-medium text-white">Rs.{row.amount}</td>
                  <td className="p-2">
                    {row.remaining > 0 ? (
                      <span className="text-xs text-red-400">Rs.{row.remaining} due</span>
                    ) : (
                      <span className="text-xs text-green-400">Paid</span>
                    )}
                  </td>
                  <td className="p-2">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => navigate(`/members/${row.member_id}/renew`)}
                      className="rounded bg-primary px-3 py-1 text-xs text-white transition hover:bg-primary/80"
                    >
                      Renew
                    </button>
                    <button className="rounded bg-gray-700 px-3 py-1 text-xs text-white transition hover:bg-gray-600">
                      Remind
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
}
