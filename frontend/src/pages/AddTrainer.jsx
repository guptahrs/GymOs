import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import MainLayout from "../layouts/MainLayout";
import BackButton from "../components/BackButton";
import API from "../api/client";
import { showSnackbar } from "../utils/snackbarService";

const BASIC = 1;
const TRAINING = 2;
const ADDRESS = 3;

export default function AddTrainer() {
  const [step, setStep] = useState(BASIC);
  const [basic, setBasic] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" });
  const [training, setTraining] = useState({ specialization: "", shift: "BOTH", experience_years: 0, certification: "", bio: "", max_clients: "" });
  const [address, setAddress] = useState({ address_line_1: "", address_line_2: "", city: "", state: "", country: "", pincode: "", landmark: "" });
  const [trainerId, setTrainerId] = useState(null);

  const createMutation = useMutation(async (body) => {
    const res = await API.post("/staff/trainers/", body);
    return res.data;
  }, {
    onSuccess: (data) => {
      showSnackbar(data?.message || "Trainer created", "success");
      const id = data?.data?.trainer_id;
      setTrainerId(id);
      setStep(ADDRESS);
    },
    onError: (err) => showSnackbar(err.response?.data?.message || err.message || "Failed to create trainer", "error"),
  });

  const updateMutation = useMutation(async ({ id, body }) => {
    const res = await API.put(`/staff/trainers/${id}/`, body);
    return res.data;
  }, {
    onSuccess: (data) => {
      showSnackbar(data?.message || "Trainer updated", "success");
      setStep(BASIC);
      setBasic({ first_name: "", last_name: "", email: "", phone: "", password: "" });
      setTraining({ specialization: "", shift: "BOTH", experience_years: 0, certification: "", bio: "", max_clients: "" });
      setAddress({ address_line_1: "", address_line_2: "", city: "", state: "", country: "", pincode: "", landmark: "" });
      setTrainerId(null);
    },
    onError: (err) => showSnackbar(err.response?.data?.message || err.message || "Failed to update trainer", "error"),
  });

  function submitBasic(e) {
    e.preventDefault();
    if (!basic.first_name.trim()) return showSnackbar("First name is required", "error");
    if (!basic.email.trim()) return showSnackbar("Email is required", "error");
    setStep(TRAINING);
  }

  function submitTraining(e) {
    e.preventDefault();
    const body = {
      ...basic,
      specialization: training.specialization,
      shift: training.shift,
      experience_years: training.experience_years || 0,
      certification: training.certification,
      bio: training.bio,
      max_clients: training.max_clients || null,
    };
    createMutation.mutate(body);
  }

  function submitAddress(e) {
    e.preventDefault();
    if (!trainerId) return showSnackbar("Trainer id missing", "error");
    updateMutation.mutate({ id: trainerId, body: address });
  }

  return (
    <MainLayout>
      <BackButton />
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add Trainer</h2>

        {step === BASIC && (
          <form onSubmit={submitBasic} className="grid grid-cols-2 gap-3 max-w-2xl">
            <Input label="First Name" value={basic.first_name} onChange={(v) => setBasic({ ...basic, first_name: v })} />
            <Input label="Last Name" value={basic.last_name} onChange={(v) => setBasic({ ...basic, last_name: v })} />
            <Input label="Email" value={basic.email} onChange={(v) => setBasic({ ...basic, email: v })} />
            <Input label="Phone" value={basic.phone} onChange={(v) => setBasic({ ...basic, phone: v })} />
            <Input type="password" label="Password" value={basic.password} onChange={(v) => setBasic({ ...basic, password: v })} />
            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setStep(BASIC)} className="rounded border border-gray-700 bg-card px-3 py-2">Cancel</button>
              <button type="submit" className="rounded bg-primary px-3 py-2 text-black">Next</button>
            </div>
          </form>
        )}

        {step === TRAINING && (
          <form onSubmit={submitTraining} className="grid grid-cols-2 gap-3 max-w-2xl">
            <Input label="Specialization" value={training.specialization} onChange={(v) => setTraining({ ...training, specialization: v })} />
            <Input label="Shift" value={training.shift} onChange={(v) => setTraining({ ...training, shift: v })} />
            <Input type="number" label="Experience Years" value={training.experience_years} onChange={(v) => setTraining({ ...training, experience_years: Number(v) })} />
            <Input label="Certification" value={training.certification} onChange={(v) => setTraining({ ...training, certification: v })} />
            <div className="col-span-2">
              <label className="mb-1 block text-sm text-gray-300">Bio</label>
              <textarea value={training.bio} onChange={(e) => setTraining({ ...training, bio: e.target.value })} className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 text-white" />
            </div>
            <Input type="number" label="Max Clients" value={training.max_clients} onChange={(v) => setTraining({ ...training, max_clients: v })} />

            <div className="col-span-2 flex justify-between">
              <button type="button" onClick={() => setStep(BASIC)} className="rounded border border-gray-700 bg-card px-3 py-2">Back</button>
              <button type="submit" disabled={createMutation.isLoading} className="rounded bg-primary px-3 py-2 text-black">{createMutation.isLoading ? "Creating..." : "Create Trainer"}</button>
            </div>
          </form>
        )}

        {step === ADDRESS && (
          <form onSubmit={submitAddress} className="grid grid-cols-2 gap-3 max-w-2xl">
            <Input label="Address Line 1" value={address.address_line_1} onChange={(v) => setAddress({ ...address, address_line_1: v })} />
            <Input label="Address Line 2" value={address.address_line_2} onChange={(v) => setAddress({ ...address, address_line_2: v })} />
            <Input label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
            <Input label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
            <Input label="Country" value={address.country} onChange={(v) => setAddress({ ...address, country: v })} />
            <Input label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} />
            <Input label="Landmark" value={address.landmark} onChange={(v) => setAddress({ ...address, landmark: v })} />

            <div className="col-span-2 flex justify-between">
              <button type="button" onClick={() => setStep(TRAINING)} className="rounded border border-gray-700 bg-card px-3 py-2">Back</button>
              <button type="submit" disabled={updateMutation.isLoading} className="rounded bg-primary px-3 py-2 text-black">{updateMutation.isLoading ? "Saving..." : "Save Address"}</button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

function Input({ type = "text", label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm text-gray-300">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 text-white" />
    </div>
  );
}
