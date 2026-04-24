import { useEffect, useState } from "react";
import API from "../api/client";
import { useQuery } from '@tanstack/react-query';
import { showSnackbar } from "../utils/snackbarService";
import MainLayout from "../layouts/MainLayout";
import Greeting from "../components/Greeting";
import Card from "../components/Card";
import KpiCard from "../components/KpiCard";
import { DollarSign, Users, TrendingUp, Wallet } from "lucide-react";
import RevenueChart from "../components/RevenueChart";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  // TODO dummy data for now, replace with API call
  const chartData = [
  { month: "Jan", revenue: 4000, expense: 2400 },
  { month: "Feb", revenue: 3000, expense: 1398 },
  { month: "Mar", revenue: 5000, expense: 3800 },
  { month: "Apr", revenue: 4780, expense: 2908 },
  { month: "May", revenue: 5890, expense: 3200 },
];
  const { data: dashboardData, isLoading, isError, error } = useQuery(['dashboard'], async () => {
    const res = await API.get('/dashboard/');
    return res.data.data;
  }, {
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message || 'Failed to load dashboard';
      showSnackbar(msg, 'error');
    }
  });

  useEffect(() => {
    if (dashboardData) setData(dashboardData);
  }, [dashboardData]);

  return (
    <MainLayout>
      <Greeting />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5">
        <KpiCard title="Revenue" value={data?.total_revenue} icon={DollarSign} color="text-success" trend={12} />
        <KpiCard title="Expense" value={data?.total_expense} icon={Wallet} color="text-danger" trend={-5} />
        <KpiCard title="Profit" value={data?.net_profit} icon={TrendingUp} color="text-primary" trend={8} />
        <KpiCard title="Members" value={data?.total_members} icon={Users} color="text-warning" trend={3} />
      </div>

      {/* Action Buttons Row */}
      <div className="flex gap-4 mt-8 mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition" onClick={() => navigate("/leads/create")}>Genrate Leads</button>
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-primary/80 transition" onClick={() => {navigate("/members/add");}}>Add Member</button>
        <button className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 transition" onClick={() => navigate("/staff/add")}>Add Staff</button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-yellow-600 transition" onClick={() => navigate("/trainer")}>Add trainer</button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 transition" onClick={() => navigate("/plan/add")}>Add Plan</button>
        {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition" onClick={() => navigate("/invoice/create")}>Create Invoice</button> */}
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition" onClick={() => navigate("/payment/record")}>Record Payment</button>
        <button className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-800 transition" onClick={() => navigate("/attendance/view")}>View Attendance</button>
      </div>

      {/* Revenue Trend Graph with Filter Bar */}
      <div className="bg-card p-6 rounded-2xl shadow-md mt-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-gray-300">Revenue Trend</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input type="checkbox" className="accent-primary" /> Compare YoY
            </label>
            <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
              <button className="px-3 py-1 rounded text-xs bg-primary text-white">Monthly</button>
              <button className="px-3 py-1 rounded text-xs text-gray-300 hover:bg-gray-700">Quarterly</button>
              <button className="px-3 py-1 rounded text-xs text-gray-300 hover:bg-gray-700">Yearly</button>
            </div>
          </div>
        </div>
        <RevenueChart data={chartData} />
      </div>

      {/* Upcoming Renewals Table with Filter Bar */}
      <div className="bg-card p-6 rounded-2xl shadow-md mt-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-gray-300">Upcoming Renewals</h2>
          <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
            <button className="px-3 py-1 rounded text-xs bg-primary text-white">Next 7 days</button>
            <button className="px-3 py-1 rounded text-xs text-gray-300 hover:bg-gray-700">14 days</button>
            <button className="px-3 py-1 rounded text-xs text-gray-300 hover:bg-gray-700">30 days</button>
          </div>
        </div>
        <table className="w-full table-auto text-sm text-left text-gray-300">
          <thead className="bg-[#0B1220] text-gray-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="p-2">Member</th>
              <th className="p-2">Plan</th>
              <th className="p-2">Renewal Date</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Dummy data for now, replace with API data */}
            {[
              { name: "Sarah Johnson", id: "IM58291", plan: "Premium Plus", renewal: "Aug 22, 2023", days: "3 days left", amount: "$89.99", status: "Pending" },
              { name: "Michael Chen", id: "IM41257", plan: "Standard", renewal: "Aug 23, 2023", days: "4 days left", amount: "$59.99", status: "Confirmed" },
              { name: "Robert Williams", id: "IM87823", plan: "Elite", renewal: "Aug 24, 2023", days: "5 days left", amount: "$129.99", status: "Payment Failed" },
              { name: "Emma Thompson", id: "IM39284", plan: "Standard", renewal: "Aug 25, 2023", days: "6 days left", amount: "$59.99", status: "Pending" },
            ].map((row, i) => (
              <tr key={i} className="border-b border-gray-700">
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">{row.name.split(" ")[0][0]}{row.name.split(" ")[1][0]}</div>
                    <div>
                      <div className="font-semibold text-white">{row.name}</div>
                      <div className="text-xs text-gray-400">ID: {row.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${row.plan === "Premium Plus" ? "bg-blue-500/20 text-blue-400" : row.plan === "Elite" ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"}`}>{row.plan}</span>
                </td>
                <td className="p-2">
                  <div>{row.renewal}</div>
                  <div className="text-xs text-red-400">{row.days}</div>
                </td>
                <td className="p-2">{row.amount}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${row.status === "Confirmed" ? "bg-green-500/20 text-green-400" : row.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>{row.status}</span>
                </td>
                <td className="p-2 flex gap-2">
                  <button className="bg-primary text-white px-3 py-1 rounded text-xs">Renew</button>
                  <button className="bg-gray-700 text-white px-3 py-1 rounded text-xs">Remind</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}