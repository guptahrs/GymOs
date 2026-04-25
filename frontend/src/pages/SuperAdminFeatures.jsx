import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2, Plus, Tag } from "lucide-react";
import API from "../api/client";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import DataTable from "../components/DataTable";
import { showSnackbar } from "../utils/snackbarService";

const FEATURE_CODE_OPTIONS = [
  "members",
  "staff",
  "dashboard",
  "leads",
  "expenses",
  "trainers",
  "whatsapp",
];

const emptyForm = { name: "", code: "" };

export default function SuperAdminFeatures() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [editingId, setEditingId]   = useState(null);
  const [deleteFeature, setDeleteFeature] = useState(null);

  const { data: features = [], isLoading } = useQuery(["global_features"], async () => {
    const res = await API.get("/auth/features/");
    return res.data.data || [];
  });

  const saveMutation = useMutation(
    async (payload) => {
      if (editingId) {
        const res = await API.put(`/auth/features/${editingId}/`, payload);
        return res.data;
      }
      const res = await API.post("/auth/features/", payload);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || (editingId ? "Feature updated" : "Feature created"), "success");
        setShowModal(false);
        setForm(emptyForm);
        setEditingId(null);
        queryClient.invalidateQueries(["global_features"]);
      },
      onError: (err) => {
        showSnackbar(err?.response?.data?.message || "Operation failed", "error");
      },
    }
  );

  const deleteMutation = useMutation(
    async (id) => {
      const res = await API.delete(`/auth/features/${id}/`);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || "Feature deleted", "success");
        setDeleteFeature(null);
        queryClient.invalidateQueries(["global_features"]);
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

  const openEdit = (feature) => {
    setEditingId(feature.id);
    setForm({ name: feature.name || "", code: feature.code || "" });
    setShowModal(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showSnackbar("Feature name is required", "error");
    if (!form.code.trim()) return showSnackbar("Feature code is required", "error");
    saveMutation.mutate({ name: form.name, code: form.code });
  };

  const columns = [
    {
      header: "Feature Name",
      accessor: "name",
      render: (f) => (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-primary" />
          <span className="text-white font-medium">{f.name}</span>
        </div>
      ),
    },
    {
      header: "Code",
      accessor: "code",
      render: (f) => (
        <code className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono border border-primary/20">
          {f.code}
        </code>
      ),
    },
    {
      header: "Used in Plans",
      accessor: "plans",
      render: (f) => {
        const plans = f.plans || [];
        if (!plans.length)
          return <span className="text-xs text-gray-600">No plans</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {plans.map((p) => (
              <span
                key={p.id || p}
                className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                style={{ backgroundColor: p.badge_color || "#3b82f6" }}
              >
                {p.name || p}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (f) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(f)}
            className="rounded border border-gray-700 bg-card p-2 hover:bg-white/5"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => setDeleteFeature(f)}
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
            <h1 className="text-2xl font-semibold text-white">Features</h1>
            <p className="text-sm text-gray-400 mt-1">
              Global features that can be assigned to subscription plans
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white font-medium hover:shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all"
          >
            <Plus size={16} /> Add Feature
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            Loading features...
          </div>
        ) : (
          <DataTable columns={columns} data={features} entity="Features" />
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-card border border-gray-800 p-6 shadow-2xl">
            <h3 className="mb-5 text-lg font-semibold text-white">
              {editingId ? "Edit Feature" : "Create Feature"}
            </h3>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm text-gray-400">Feature Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Leads / Visitors"
                  className="input"
                  required
                />
              </div>

              {/* Code — dropdown of known enums */}
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Feature Code
                  <span className="ml-1 text-xs text-gray-600">(must match backend FeatureCode enum)</span>
                </label>
                <select
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="input"
                  required
                  disabled={!!editingId}
                >
                  <option value="" disabled>Select code</option>
                  {FEATURE_CODE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {editingId && (
                  <p className="mt-1 text-xs text-yellow-500">
                    Code cannot be changed after creation.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  {saveMutation.isLoading ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-96 rounded-xl bg-card border border-gray-800 p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-white">Delete Feature</h3>
            <p className="mb-5 text-sm text-gray-400">
              Are you sure you want to delete{" "}
              <code className="px-1 rounded bg-primary/10 text-primary text-xs">
                {deleteFeature.code}
              </code>
              ? This will remove it from all plans.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteFeature(null)}
                className="rounded-lg border border-gray-700 bg-card px-4 py-2 text-sm text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteFeature.id)}
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
