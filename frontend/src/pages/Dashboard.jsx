import { useEffect, useState } from "react";
import API from "../api/client";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/Card";
import KpiCard from "../components/KpiCard";
import { DollarSign, Users, TrendingUp, Wallet } from "lucide-react";
import RevenueChart from "../components/RevenueChart";

export default function Dashboard() {
  const [data, setData] = useState(null);

  // TODO dummy data for now, replace with API call
  const chartData = [
  { month: "Jan", revenue: 4000, expense: 2400 },
  { month: "Feb", revenue: 3000, expense: 1398 },
  { month: "Mar", revenue: 5000, expense: 3800 },
  { month: "Apr", revenue: 4780, expense: 2908 },
  { month: "May", revenue: 5890, expense: 3200 },
];
  useEffect(() => {
    API.get("/dashboard/")
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5">
  
        <KpiCard
          title="Revenue"
          value={data?.total_revenue}
          icon={DollarSign}
          color="text-success"
          trend={12}
        />

        <KpiCard
          title="Expense"
          value={data?.total_expense}
          icon={Wallet}
          color="text-danger"
          trend={-5}
        />

        <KpiCard
          title="Profit"
          value={data?.net_profit}
          icon={TrendingUp}
          color="text-primary"
          trend={8}
        />

        <KpiCard
          title="Members"
          value={data?.total_members}
          icon={Users}
          color="text-warning"
          trend={3}
        />

      </div>
      <RevenueChart data={chartData} />
    </MainLayout>
  );
}