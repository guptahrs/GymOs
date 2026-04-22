import { useEffect, useState } from "react";
import API from "../api/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showSnackbar } from "../utils/snackbarService";
import { Edit2, Trash2 } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletePlan, setDeletePlan] = useState(null);
  const [warning, setWarning] = useState("");

  // modal/form state
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDuration, setFormDuration] = useState(30);
  const [editingPlanId, setEditingPlanId] = useState(null);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data: plansData, isLoading: queryLoading } = useQuery(['plans'], async () => {
    const res = await API.get('/members/plans/');
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

  const openEditModal = (p) => {
    setEditingPlanId(p.plan_id);
    setFormName(p.name || "");
    setFormPrice(p.price || "");
    setFormDuration(p.duration_days || 30);
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
        if (data?.status === 'warning') {
          setWarning(data.message || 'Plan is assigned and cannot be deleted');
        } else {
          setDeletePlan(null);
          queryClient.invalidateQueries(['plans']);
          showSnackbar(data?.message || 'Plan deleted', 'success');
        }
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || err.message || 'Delete failed';
        showSnackbar(msg, 'error');
      }
    }
  );

  const confirmDelete = () => {
    if (!deletePlan) return;
    deleteMutation.mutate(deletePlan.plan_id);
  };

  const createUpdateMutation = useMutation(
    async (payload) => {
      if (payload.planId) {
        const res = await API.put(`/members/plans/${payload.planId}/`, payload.body);
        return res.data;
      } else {
        const res = await API.post(`/members/plans/`, payload.body);
        return res.data;
      }
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || (editingPlanId ? 'Plan updated' : 'Plan created'), 'success');
        setShowModal(false);
        queryClient.invalidateQueries(['plans']);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || err.message || 'Operation failed';
        showSnackbar(msg, 'error');
      }
    }
  );

  const submitForm = (e) => {
    e.preventDefault();
    const payload = { planId: editingPlanId, body: { name: formName, price: formPrice, duration_days: parseInt(formDuration, 10) } };
    createUpdateMutation.mutate(payload);
  };

  return (
    <MainLayout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold"></h1>
          <button onClick={openCreateModal} className="px-3 py-2 bg-primary text-black rounded-lg">Add Plan</button>
        </div>

        <div className="bg-card rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-[#0B1220] text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Duration (days)</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans?.length > 0 ? plans.map((p, i) => (
                <tr key={i} className="border-t border-gray-800 hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 text-white">{p.name}</td>
                  <td className="px-6 py-4">₹{p.price}</td>
                  <td className="px-6 py-4">{p.duration_days}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(p)} aria-label={`Edit ${p.name}`} className="p-2 rounded bg-card border border-gray-700 hover:bg-white/5">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDeleteClick(p)} aria-label={`Delete ${p.name}`} className="p-2 rounded bg-red-600 text-white hover:opacity-90">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">No plans found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Form Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <form onSubmit={submitForm} className="bg-card p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-3">{editingPlanId ? 'Edit Plan' : 'Add Plan'}</h3>

              <div className="mb-3">
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 rounded bg-transparent border border-gray-700" required />
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-300 mb-1">Price</label>
                <input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full px-3 py-2 rounded bg-transparent border border-gray-700" required />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">Duration (days)</label>
                <input type="number" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="w-full px-3 py-2 rounded bg-transparent border border-gray-700" required />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-2 bg-card border border-gray-700 rounded">Cancel</button>
                <button type="submit" disabled={loading} className="px-3 py-2 bg-primary text-black rounded">{editingPlanId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Modal */}
        {deletePlan && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-card p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-3">Delete plan</h3>
              <p className="text-sm text-gray-300 mb-4">Are you sure you want to delete <strong>{deletePlan.name}</strong>?</p>
              {warning && <div className="p-3 mb-3 bg-yellow-800 text-yellow-200 rounded">{warning}</div>}
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeletePlan(null)} className="px-3 py-2 bg-card border border-gray-700 rounded">Cancel</button>
                <button onClick={confirmDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
