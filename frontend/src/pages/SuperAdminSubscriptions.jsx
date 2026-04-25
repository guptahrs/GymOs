import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, CreditCard, RefreshCw } from "lucide-react";
import API from "../api/client";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import DataTable from "../components/DataTable";
import { showSnackbar } from "../utils/snackbarService";

export default function SuperAdminSubscriptions() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");

  // Fetch gyms
  const { data: gyms = [], isLoading: gymsLoading } = useQuery(["superadmin_gyms"], async () => {
    const res = await API.get("/gyms/list");
    return res.data.data || [];
  });

  // Fetch plans
  const { data: plans = [] } = useQuery(["superadmin_plans"], async () => {
    const res = await API.get("/subscriptions/active-subscriptions/");
    return res.data.data || [];
  });

  // Assign / change plan
  const assignMutation = useMutation(
    async ({ gymId, planId }) => {
      const res = await API.post("/subscriptions/assign/", { gym_id: gymId, plan_id: planId });
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || "Plan assigned successfully", "success");
        setShowModal(false);
        setSelectedGym(null);
        setSelectedPlan("");
        queryClient.invalidateQueries(["superadmin_gyms"]);
      },
      onError: (err) => {
        showSnackbar(err?.response?.data?.message || "Failed to assign plan", "error");
      },
    }
  );

  const openAssign = (gym) => {
    setSelectedGym(gym);
    setSelectedPlan(gym.current_plan?.plan_id || gym.current_plan_id || "");
    setShowModal(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!selectedPlan) return showSnackbar("Please select a plan", "error");
    assignMutation.mutate({ gymId: selectedGym.gym_id, planId: selectedPlan });
  };

  const columns = [
    {
      header: "Gym",
      accessor: "name",
      render: (gym) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {gym.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium">{gym.name}</p>
            <p className="text-xs text-gray-500">{gym.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Current Plan",
      accessor: "current_plan",
      render: (gym) => {
        if (!gym.current_plan)
          return <span className="text-xs text-gray-600 italic">No plan assigned</span>;
        return (
          <span
            className="px-3 py-1 rounded text-xs font-semibold text-white"
            style={{ backgroundColor: gym.current_plan?.badge_color || "#3b82f6" }}
          >
            {gym.current_plan?.name || gym.current_plan}
          </span>
        );
      },
    },
    {
      header: "Subscription Status",
      accessor: "subscription_status",
      render: (gym) => {
        const status = gym.subscription_status;
        const colorMap = {
          active:   "bg-green-500/20 text-green-400 border-green-700",
          expired:  "bg-red-500/20 text-red-400 border-red-700",
          trial:    "bg-yellow-500/20 text-yellow-400 border-yellow-700",
        };
        const cls = colorMap[status] || "bg-gray-700/50 text-gray-400 border-gray-700";
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold border capitalize ${cls}`}>
            {status || "—"}
          </span>
        );
      },
    },
    {
      header: "Expires",
      accessor: "subscription_end",
      render: (gym) =>
        gym.subscription_end ? (
          <span className="text-sm text-gray-300">{new Date(gym.subscription_end).toLocaleDateString("en-IN")}</span>
        ) : (
          <span className="text-gray-600 text-xs">—</span>
        ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (gym) => (
        <button
          onClick={() => openAssign(gym)}
          className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary font-medium hover:bg-primary/20 transition-all"
        >
          <RefreshCw size={12} />
          {gym.current_plan ? "Change Plan" : "Assign Plan"}
        </button>
      ),
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Gym Subscriptions</h1>
            <p className="text-sm text-gray-400 mt-1">
              Assign subscription plans to gyms
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Gyms", value: gyms.length, icon: Building2, color: "text-primary bg-primary/10" },
            { label: "Active Plans", value: gyms.filter((g) => g.subscription_status === "active").length, icon: CreditCard, color: "text-green-400 bg-green-500/10" },
            { label: "No Plan", value: gyms.filter((g) => !g.current_plan).length, icon: RefreshCw, color: "text-yellow-400 bg-yellow-500/10" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {gymsLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">Loading gyms...</div>
        ) : (
          <DataTable columns={columns} data={gyms} entity="Gyms" />
        )}
      </div>

      {/* ── Assign Plan Modal ── */}
      {showModal && selectedGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-card border border-gray-800 p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-semibold text-white">Assign Subscription Plan</h3>
            <p className="mb-5 text-sm text-gray-400">
              Gym:{" "}
              <span className="text-white font-medium">{selectedGym.name}</span>
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">Select Plan</label>
                <div className="space-y-2">
                  {plans.map((plan) => {
                      const planId = plan.plan_id || plan.id;
                      return (
                      <button
                        key={planId}
                        type="button"
                        onClick={() => setSelectedPlan(planId)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left ${
                          selectedPlan === planId
                            ? "border-primary bg-primary/10"
                            : "border-gray-700 hover:border-gray-500"
                        }`}
                      >
                      <div className="flex items-center gap-3">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: plan.badge_color || "#3b82f6" }}
                        >
                          {plan.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {(plan.features || []).length} features · {plan.duration_days} days
                        </span>
                      </div>
                      <span className="text-white font-semibold text-sm">₹{plan.price}</span>
                    </button>
                  )})}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSelectedGym(null); setSelectedPlan(""); }}
                  className="rounded-lg border border-gray-700 bg-card px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignMutation.isLoading || !selectedPlan}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-white font-medium disabled:opacity-60"
                >
                  {assignMutation.isLoading ? "Assigning..." : "Assign Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
