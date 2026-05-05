import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CreditCard, FlaskConical, RefreshCw } from "lucide-react";

import API from "../api/client";
import DataTable from "../components/DataTable";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import { showSnackbar } from "../utils/snackbarService";

export default function SuperAdminSubscriptions() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [assignmentMode, setAssignmentMode] = useState("paid");
  const [trialDays, setTrialDays] = useState(7);

  const { data: gyms = [], isLoading: gymsLoading } = useQuery(
    ["superadmin_gyms"],
    async () => {
      const res = await API.get("/gyms/list");
      return res.data.data || [];
    }
  );

  const { data: plans = [] } = useQuery(["superadmin_plans"], async () => {
    const res = await API.get("/subscriptions/all-plans/");
    return res.data.data || [];
  });

  const assignMutation = useMutation(
    async ({ gymId, planId, accessType, days }) => {
      const payload = { gym_id: gymId, access_type: accessType };
      if (accessType === "trial") {
        payload.trial_days = days;
      } else {
        payload.plan_id = planId;
      }
      const res = await API.post("/subscriptions/assign/", payload);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || "Access assigned successfully", "success");
        setShowModal(false);
        setSelectedGym(null);
        setSelectedPlan("");
        setAssignmentMode("paid");
        setTrialDays(7);
        queryClient.invalidateQueries(["superadmin_gyms"]);
      },
      onError: (err) => {
        showSnackbar(err?.response?.data?.message || "Failed to assign access", "error");
      },
    }
  );

  const openAssign = (gym) => {
    setSelectedGym(gym);
    setSelectedPlan(gym.current_plan?.plan_id || "");
    setAssignmentMode("paid");
    setTrialDays(7);
    setShowModal(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (assignmentMode === "paid" && !selectedPlan) {
      return showSnackbar("Please select a plan", "error");
    }

    if (assignmentMode === "trial" && (!trialDays || Number(trialDays) <= 0)) {
      return showSnackbar("Please enter valid trial days", "error");
    }

    assignMutation.mutate({
      gymId: selectedGym.gym_id,
      planId: selectedPlan,
      accessType: assignmentMode,
      days: Number(trialDays),
    });
  };

  const columns = [
    {
      header: "Gym",
      accessor: "name",
      render: (gym) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {gym.name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{gym.name}</p>
            <p className="text-xs text-gray-500">{gym.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Current Plan",
      accessor: "current_plan",
      render: (gym) => {
        if (!gym.current_plan) {
          return <span className="text-xs italic text-gray-600">No plan assigned</span>;
        }

        return (
          <span
            className="rounded px-3 py-1 text-xs font-semibold text-white"
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
        const status = gym.subscription_active_status;
        const colorMap = {
          active: "border-green-700 bg-green-500/20 text-green-400",
          expired: "border-red-700 bg-red-500/20 text-red-400",
          trial: "border-yellow-700 bg-yellow-500/20 text-yellow-400",
          trial_expired: "border-orange-700 bg-orange-500/20 text-orange-400",
          no_plan: "border-gray-700 bg-gray-700/50 text-gray-400",
        };
        const cls = colorMap[status] || "border-gray-700 bg-gray-700/50 text-gray-400";
        return (
          <span className={`rounded border px-2 py-1 text-xs font-semibold capitalize ${cls}`}>
            {status || "-"}
          </span>
        );
      },
    },
    {
      header: "Expires",
      accessor: "subscription_end",
      render: (gym) =>
        gym.subscription_end ? (
          <span className="text-sm text-gray-300">
            {new Date(gym.subscription_end).toLocaleDateString("en-IN")}
          </span>
        ) : (
          <span className="text-xs text-gray-600">-</span>
        ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (gym) => (
        <button
          onClick={() => openAssign(gym)}
          className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20"
        >
          <RefreshCw size={12} />
          {gym.current_plan ? "Change Access" : "Assign Access"}
        </button>
      ),
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Gym Subscriptions</h1>
            <p className="mt-1 text-sm text-gray-400">
              Assign paid plans or launch custom trials for new gyms.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Total Gyms", value: gyms.length, icon: Building2, color: "text-primary bg-primary/10" },
            {
              label: "Paid Active",
              value: gyms.filter((gym) => gym.subscription_active_status === "active").length,
              icon: CreditCard,
              color: "text-green-400 bg-green-500/10",
            },
            {
              label: "Trial Active",
              value: gyms.filter((gym) => gym.subscription_active_status === "trial").length,
              icon: FlaskConical,
              color: "text-yellow-400 bg-yellow-500/10",
            },
            {
              label: "Needs Plan",
              value: gyms.filter((gym) =>
                ["no_plan", "expired", "trial_expired"].includes(gym.subscription_active_status)
              ).length,
              icon: RefreshCw,
              color: "text-cyan-400 bg-cyan-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-card p-4"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
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

      {showModal && selectedGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-gray-800 bg-card p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-semibold text-white">Assign Access</h3>
            <p className="mb-5 text-sm text-gray-400">
              Gym: <span className="font-medium text-white">{selectedGym.name}</span>
            </p>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAssignmentMode("paid")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    assignmentMode === "paid"
                      ? "border-primary bg-primary/10"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="text-sm font-semibold text-white">Paid Plan</div>
                  <div className="mt-1 text-xs text-gray-400">
                    Assign a normal subscription using an existing plan.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAssignmentMode("trial")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    assignmentMode === "trial"
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="text-sm font-semibold text-white">Trial Access</div>
                  <div className="mt-1 text-xs text-gray-400">
                    Start a custom onboarding trial for this gym.
                  </div>
                </button>
              </div>

              {assignmentMode === "paid" ? (
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
                          className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all ${
                            selectedPlan === planId
                              ? "border-primary bg-primary/10"
                              : "border-gray-700 hover:border-gray-500"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="rounded px-2 py-0.5 text-xs font-semibold text-white"
                              style={{ backgroundColor: plan.badge_color || "#3b82f6" }}
                            >
                              {plan.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {(plan.features || []).length} features · {plan.duration_days} days
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-white">Rs.{plan.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <label className="mb-3 block text-sm text-gray-300">Trial Duration</label>
                  <div className="mb-4 flex gap-2">
                    {[7, 15].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTrialDays(value)}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          Number(trialDays) === value
                            ? "bg-yellow-400 text-slate-950"
                            : "bg-white/5 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {value} days
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-[#0B1220] px-4 py-3 text-white outline-none focus:border-yellow-400"
                    placeholder="Enter custom trial days"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedGym(null);
                    setSelectedPlan("");
                    setAssignmentMode("paid");
                    setTrialDays(7);
                  }}
                  className="rounded-lg border border-gray-700 bg-card px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    assignMutation.isLoading ||
                    (assignmentMode === "paid" ? !selectedPlan : !trialDays)
                  }
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {assignMutation.isLoading
                    ? "Saving..."
                    : assignmentMode === "trial"
                      ? "Start Trial"
                      : "Assign Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
