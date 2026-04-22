import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2 } from "lucide-react";
import API from "../api/client";
import MainLayout from "../layouts/MainLayout";
import DataTable from "../components/DataTable";
import { showSnackbar } from "../utils/snackbarService";

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [deletePlan, setDeletePlan] = useState(null);
  const [warning, setWarning] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDuration, setFormDuration] = useState(30);
  const [editingPlanId, setEditingPlanId] = useState(null);

  const queryClient = useQueryClient();

  const { data: plansData } = useQuery(["plans"], async () => {
    const res = await API.get("/members/plans/");
    return res.data.data || [];
  });

  useEffect(() => {
    if (plansData) setPlans(plansData);
  }, [plansData]);

  const openCreateModal = () => {
    setEditingPlanId(null);
    setFormName("");
    setFormPrice("");
    setFormDuration(30);
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlanId(plan.plan_id);
    setFormName(plan.name || "");
    setFormPrice(plan.price || "");
    setFormDuration(plan.duration_days || 30);
    setShowModal(true);
  };

  const onDeleteClick = (plan) => {
    setWarning("");
    setDeletePlan(plan);
  };

  const deleteMutation = useMutation(
    async (planId) => {
      const res = await API.delete(`/members/plans/${planId}/`);
      return res.data;
    },
    {
      onSuccess: (data) => {
        if (data?.status === "warning") {
          setWarning(data.message || "Plan is assigned and cannot be deleted");
          return;
        }

        setDeletePlan(null);
        queryClient.invalidateQueries(["plans"]);
        showSnackbar(data?.message || "Plan deleted", "success");
      },
      onError: (err) => {
        showSnackbar(err?.response?.data?.message || err.message || "Delete failed", "error");
      },
    }
  );

  const createUpdateMutation = useMutation(
    async (payload) => {
      if (payload.planId) {
        const res = await API.put(`/members/plans/${payload.planId}/`, payload.body);
        return res.data;
      }

      const res = await API.post("/members/plans/", payload.body);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || (editingPlanId ? "Plan updated" : "Plan created"), "success");
        setShowModal(false);
        queryClient.invalidateQueries(["plans"]);
      },
      onError: (err) => {
        showSnackbar(err?.response?.data?.message || err.message || "Operation failed", "error");
      },
    }
  );

  const confirmDelete = () => {
    if (!deletePlan) return;
    deleteMutation.mutate(deletePlan.plan_id);
  };

  const submitForm = (e) => {
    e.preventDefault();
    createUpdateMutation.mutate({
      planId: editingPlanId,
      body: {
        name: formName,
        price: formPrice,
        duration_days: parseInt(formDuration, 10),
      },
    });
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (plan) => <span className="text-white">{plan.name}</span>,
    },
    {
      header: "Price",
      accessor: "price",
      render: (plan) => <span>Rs {plan.price}</span>,
    },
    {
      header: "Duration (days)",
      accessor: "duration_days",
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (plan) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(plan)} aria-label={`Edit ${plan.name}`} className="rounded border border-gray-700 bg-card p-2 hover:bg-white/5">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDeleteClick(plan)} aria-label={`Delete ${plan.name}`} className="rounded bg-red-600 p-2 text-white hover:opacity-90">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold" />
          <button onClick={openCreateModal} className="rounded-lg bg-primary px-3 py-2 text-black">Add Plan</button>
        </div>

        <DataTable columns={columns} data={plans} entity="Plans" />

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <form onSubmit={submitForm} className="w-96 rounded-lg bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">{editingPlanId ? "Edit Plan" : "Add Plan"}</h3>

              <div className="mb-3">
                <label className="mb-1 block text-sm text-gray-300">Name</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full rounded border border-gray-700 bg-transparent px-3 py-2" required />
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-sm text-gray-300">Price</label>
                <input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full rounded border border-gray-700 bg-transparent px-3 py-2" required />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm text-gray-300">Duration (days)</label>
                <input type="number" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="w-full rounded border border-gray-700 bg-transparent px-3 py-2" required />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded border border-gray-700 bg-card px-3 py-2">Cancel</button>
                <button type="submit" disabled={createUpdateMutation.isLoading} className="rounded bg-primary px-3 py-2 text-black">
                  {editingPlanId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {deletePlan && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-lg bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">Delete Plan</h3>
              <p className="mb-4 text-sm text-gray-300">Are you sure you want to delete <strong>{deletePlan.name}</strong>?</p>
              {warning && <div className="mb-3 rounded bg-yellow-800 p-3 text-yellow-200">{warning}</div>}
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeletePlan(null)} className="rounded border border-gray-700 bg-card px-3 py-2">Cancel</button>
                <button onClick={confirmDelete} disabled={deleteMutation.isLoading} className="rounded bg-red-600 px-3 py-2 text-white">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
