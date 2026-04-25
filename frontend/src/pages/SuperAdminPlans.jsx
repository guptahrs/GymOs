import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2, Plus, ChevronDown, ChevronUp, Check } from "lucide-react";
import API from "../api/client";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import DataTable from "../components/DataTable";
import { showSnackbar } from "../utils/snackbarService";

const FEATURE_CODES = [
  { code: "members",   label: "Members Management" },
  { code: "staff",     label: "Staff Management" },
  { code: "dashboard", label: "Dashboard" },
  { code: "leads",     label: "Leads / Visitors" },
  { code: "expenses",  label: "Expenses" },
  { code: "trainers",  label: "Trainers" },
  { code: "whatsapp",  label: "WhatsApp Notifications" },
];

const BADGE_COLORS = [
  { label: "Blue",   value: "#3b82f6" },
  { label: "Green",  value: "#22c55e" },
  { label: "Purple", value: "#a855f7" },
  { label: "Amber",  value: "#f59e0b" },
  { label: "Red",    value: "#ef4444" },
  { label: "Teal",   value: "#14b8a6" },
];

const emptyForm = {
  name: "",
  price: "",
  duration_days: 30,
  badge_color: "#3b82f6",
  features: [],
};

export default function SuperAdminPlans() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(emptyForm);
  const [editingId, setEditingId]       = useState(null);
  const [deletePlan, setDeletePlan]     = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);

  // ── Fetch subscription plans (super admin endpoint)
  const { data: plans = [], isLoading } = useQuery(["superadmin_plans"], async () => {
    const res = await API.get("/subscriptions/all-plans/");
    return res.data.data || [];
  });

  // ── Fetch global features
  const { data: globalFeatures = [] } = useQuery(["global_features"], async () => {
    const res = await API.get("/auth/features/");
    return res.data.data || [];
  });

  // ── Create / Update
  const saveMutation = useMutation(
    async (payload) => {
      if (editingId) {
        const res = await API.put(`/subscriptions/plans/${editingId}/`, payload);
        return res.data;
      }
      const res = await API.post("/subscriptions/plans/create/", payload);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || (editingId ? "Plan updated" : "Plan created"), "success");
        setShowModal(false);
        setForm(emptyForm);
        setEditingId(null);
        queryClient.invalidateQueries(["superadmin_plans"]);
      },
      onError: (err) => {
        showSnackbar(err?.response?.data?.message || "Operation failed", "error");
      },
    }
  );

  // ── Delete
  const deleteMutation = useMutation(
    async (id) => {
      const res = await API.delete(`/subscriptions/plans/${id}/`);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || "Plan deleted", "success");
        setDeletePlan(null);
        queryClient.invalidateQueries(["superadmin_plans"]);
      },
      onError: (err) => {
        showSnackbar(err?.response?.data?.message || "Delete failed", "error");
      },
    }
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan.plan_id || plan.id);
    setForm({
      name:          plan.name || "",
      price:         plan.price || "",
      duration_days: plan.duration_days || 30,
      badge_color:   plan.badge_color || "#3b82f6",
      features: (plan.features || []).map((f) =>
        typeof f === "string" ? f : (f.code ?? "")
      ).filter(Boolean),
    });
    setShowModal(true);
  };

  const toggleFeature = (code) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(code)
        ? prev.features.filter((c) => c !== code)
        : [...prev.features, code],
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showSnackbar("Plan name is required", "error");
    if (!form.price)        return showSnackbar("Price is required", "error");
    saveMutation.mutate({
      name:         form.name,
      price:        parseFloat(form.price),
      duration_days: parseInt(form.duration_days, 10),
      badge_color:  form.badge_color,
      feature_codes: form.features,
    });
  };

  const columns = [
    {
      header: "Plan",
      accessor: "name",
      render: (plan) => (
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded text-xs font-semibold text-white"
            style={{ backgroundColor: plan.badge_color || "#3b82f6" }}
          >
            {plan.name}
          </span>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (plan) => <span className="text-white font-medium">₹{plan.price}</span>,
    },
    {
      header: "Duration",
      accessor: "duration_days",
      render: (plan) => <span>{plan.duration_days} days</span>,
    },
    {
      header: "Features",
      accessor: "features",
      render: (plan) => {
        const features = plan.features || [];
        const isOpen = expandedPlan === plan.id;
        return (
          <div>
            <button
              onClick={() => setExpandedPlan(isOpen ? null : plan.id)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {features.length} feature{features.length !== 1 ? "s" : ""}
              {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {isOpen && (
              <div className="mt-2 flex flex-wrap gap-1">
                {features.map((f) => (
                  <span
                    key={f.code || f}
                    className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    {f.name || f.code || f}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (plan) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(plan)}
            className="rounded border border-gray-700 bg-card p-2 hover:bg-white/5"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setDeletePlan(plan)}
            className="rounded bg-red-600/20 border border-red-700 p-2 text-red-400 hover:bg-red-600/30"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Subscription Plans</h1>
            <p className="text-sm text-gray-400 mt-1">Manage plans and their feature access</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white font-medium hover:shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all"
          >
            <Plus size={16} /> Add Plan
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">Loading plans...</div>
        ) : (
          <DataTable columns={columns} data={plans} entity="Plans" />
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-card border border-gray-800 shadow-2xl flex flex-col max-h-[90vh]">

            <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingId ? "Edit Plan" : "Create Plan"}
                </h3>
                {/* Name */}
              <div>
                <label className="mb-1 block text-sm text-gray-400">Plan Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Premium Plus"
                  className="input"
                  required
                />
              </div>

              {/* Price + Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Price (₹)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="2499"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Duration (days)</label>
                  <input
                    type="number"
                    value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              {/* Badge Color */}
              <div>
                <label className="mb-2 block text-sm text-gray-400">Badge Color</label>
                <div className="flex gap-2 flex-wrap">
                  {BADGE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, badge_color: c.value })}
                      className="relative w-8 h-8 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c.value,
                        borderColor: form.badge_color === c.value ? "#fff" : "transparent",
                      }}
                      title={c.label}
                    >
                      {form.badge_color === c.value && (
                        <Check size={14} className="absolute inset-0 m-auto text-white" />
                      )}
                    </button>
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-2">
                  <span
                    className="px-3 py-1 rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: form.badge_color }}
                  >
                    {form.name || "Preview"}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Features Included
                  <span className="ml-2 text-xs text-gray-600">({form.features.length} selected)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FEATURE_CODES.map((f) => {
                    const selected = form.features.includes(f.code);
                    return (
                      <button
                        key={f.code}
                        type="button"
                        onClick={() => toggleFeature(f.code)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-700 bg-transparent text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                            selected ? "bg-primary" : "border border-gray-600"
                          }`}
                        >
                          {selected && <Check size={10} className="text-white" />}
                        </div>
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              </div> {/* end scrollable body */}

              {/* Sticky footer */}
              <div className="flex justify-end gap-2 p-4 border-t border-gray-800 bg-card flex-shrink-0">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(emptyForm); setEditingId(null); }}
                  className="rounded-lg border border-gray-700 bg-card px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isLoading}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-white font-medium disabled:opacity-60"
                >
                  {saveMutation.isLoading ? "Saving..." : editingId ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deletePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-96 rounded-xl bg-card border border-gray-800 p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-white">Delete Plan</h3>
            <p className="mb-5 text-sm text-gray-400">
              Are you sure you want to delete{" "}
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                style={{ backgroundColor: deletePlan.badge_color || "#3b82f6" }}
              >
                {deletePlan.name}
              </span>
              ? This will remove access for all gyms on this plan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletePlan(null)}
                className="rounded-lg border border-gray-700 bg-card px-4 py-2 text-sm text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletePlan.id)}
                disabled={deleteMutation.isLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white font-medium disabled:opacity-60"
              >
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
