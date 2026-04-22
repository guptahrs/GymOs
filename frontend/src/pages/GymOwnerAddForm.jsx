
import { useState } from "react";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import { useParams } from "react-router-dom";
import FloatingInput from "../components/FloatingInput";
import FloatingPasswordInput from "../components/FloatingPasswordInput";
import { useSnackbar } from "../context/SnackbarContext";
import API from "../api/client";
import { useMutation } from '@tanstack/react-query';

export default function GymOwnerAddForm() {
  const { gymId } = useParams();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let err = {};
    if (!form.email) err.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Invalid email";
    if (!form.password) err.password = "Password required";
    else if (form.password.length < 6) err.password = "Min 6 chars";
    if (!form.first_name) err.first_name = "First name required";
    if (!form.last_name) err.last_name = "Last name required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await addOwner.mutateAsync({ gym_id: gymId, owner: form });
      showSnackbar(res.message || "Owner added successfully", "success");
      setForm({ email: "", password: "", first_name: "", last_name: "" });
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to add owner";
      setErrors({ api: msg });
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const { mutateAsync: addOwner } = useMutation(async (payload) => {
    const res = await API.post('/gyms/add-owner/', payload);
    return res.data;
  });

  return (
    <SuperAdminLayout>
      <h2 className="text-xl font-bold mb-4">Add Owner to Gym</h2>
      <form className="max-w-md space-y-4" onSubmit={handleSubmit}>
        {errors.api && <div className="text-red-400">{errors.api}</div>}
        <FloatingInput label="First Name" value={form.first_name} error={errors.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
        <FloatingInput label="Last Name" value={form.last_name} error={errors.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
        <FloatingInput label="Email" value={form.email} error={errors.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <FloatingPasswordInput label="Password" value={form.password} error={errors.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>{loading ? "Adding..." : "Add Owner"}</button>
      </form>
    </SuperAdminLayout>
  );
}
