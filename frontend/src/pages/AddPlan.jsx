import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import BackButton from "../components/BackButton";
import API from "../api/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showSnackbar } from "../utils/snackbarService";

export default function AddPlan() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const planId = params.get("planId");

  const queryClient = useQueryClient();

  const { data: planData, isLoading: planLoading } = useQuery(
    ['plan', planId],
    async () => {
      const res = await API.get(`/members/plans/${planId}/`);
      return res.data.data;
    },
    {
      enabled: !!planId,
      onError: (err) => showSnackbar(err?.response?.data?.message || err.message || 'Failed to load plan', 'error')
    }
  );

  useEffect(() => {
    if (planData) {
      setName(planData.name || "");
      setPrice(planData.price || "");
      setDuration(planData.duration_days || 30);
    }
  }, [planData]);

  const mutation = useMutation(async (payload) => {
    if (payload.planId) {
      const res = await API.put(`/members/plans/${payload.planId}/`, payload.body);
      return res.data;
    }
    const res = await API.post(`/members/plans/`, payload.body);
    return res.data;
  }, {
    onSuccess: (data) => {
      showSnackbar(data?.message || (planId ? 'Plan updated' : 'Plan created'), 'success');
      queryClient.invalidateQueries(['plans']);
      navigate('/plans');
    },
    onError: (err) => {
      showSnackbar(err?.response?.data?.message || err.message || 'Operation failed', 'error');
    }
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = { planId, body: { name, price, duration_days: parseInt(duration, 10) } };
    mutation.mutate(payload);
  };

  return (
    <MainLayout>
      {/* <BackButton /> */}
      <div className="w-full max-w-xl">
        {/* <h1 className="text-2xl font-semibold mb-4">{planId ? 'Edit Plan' : 'Add Plan'}</h1> */}
        <form onSubmit={onSubmit} className="bg-card p-6 rounded-lg border border-gray-800">
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded bg-transparent border border-gray-700" />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Price</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 rounded bg-transparent border border-gray-700" />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Duration (days)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 rounded bg-transparent border border-gray-700" />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => navigate('/plans')} type="button" className="px-3 py-2 bg-card border border-gray-700 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-black rounded">{planId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
