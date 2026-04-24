import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Dumbbell, MapPin, Check } from "lucide-react";
import API from "../api/client";
import { showSnackbar } from "../utils/snackbarService";

const BASIC = 1;
const TRAINING = 2;
const ADDRESS = 3;

export default function TrainerForm({ initialData = null, onClose = () => {}, onSaved = () => {} }) {
  const [step, setStep] = useState(BASIC);
  const [basic, setBasic] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" });
  const [training, setTraining] = useState({ specialization: "", shift: "BOTH", experience_years: 0, certification: "", bio: "", max_clients: "" });
  const [address, setAddress] = useState({ address_line_1: "", address_line_2: "", city: "", state: "", country: "", pincode: "", landmark: "" });
  const [trainerId, setTrainerId] = useState(null);

  useEffect(() => {
    if (initialData) {
      // populate fields for edit
      setBasic({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        password: "",
      });
      setTraining({
        specialization: initialData.specialization || "",
        shift: initialData.shift || "BOTH",
        experience_years: initialData.experience_years || 0,
        certification: initialData.certification || "",
        bio: initialData.bio || "",
        max_clients: initialData.max_clients || "",
      });
      setTrainerId(initialData.trainer_id || null);
      setStep(BASIC);
    }
  }, [initialData]);

  // Unified POST-based onboarding mutation
  const postOnboard = useMutation(async (body) => {
    const res = await API.post("/staff/trainers/", body);
    return res.data;
  }, {
    onSuccess: (data, variables) => {
      const id = data?.data?.trainer_id;
      if (id) setTrainerId(id);
      onSaved(data?.data);
    },
    onError: (err) => showSnackbar(err.response?.data?.message || err.message || "Failed to save trainer step", "error"),
  });

  // For editing full trainer from list, still allow PUT as fall-back
  const putSave = useMutation(async ({ id, body }) => {
    const res = await API.put(`/staff/trainers/${id}/`, body);
    return res.data;
  }, {
    onSuccess: (data) => {
      showSnackbar(data?.message || "Trainer saved", "success");
      onSaved(data?.data);
      onClose();
    },
    onError: (err) => showSnackbar(err.response?.data?.message || err.message || "Failed to save trainer", "error"),
  });

  const [basicLocked, setBasicLocked] = useState(false);
  const [trainingLocked, setTrainingLocked] = useState(false);

  function submitBasic(e) {
    if (e) e.preventDefault();
    if (!basic.first_name.trim()) return showSnackbar("First name is required", "error");
    if (!basic.email.trim()) return showSnackbar("Email is required", "error");

    const body = {
      onboarding_step: "basic",
      trainer_id: trainerId,
      first_name: basic.first_name,
      last_name: basic.last_name,
      email: basic.email,
      phone: basic.phone,
      password: basic.password,
      gym_id: basic.gym_id,
    };

    postOnboard.mutate(body, {
      onSuccess: () => {
        setBasicLocked(true);
        setStep(TRAINING);
      },
    });
  }

  function submitTraining(e) {
    if (e) e.preventDefault();

    const body = {
      onboarding_step: "training",
      trainer_id: trainerId,
      specialization: training.specialization,
      shift: training.shift,
      experience_years: training.experience_years || 0,
      certification: training.certification,
      bio: training.bio,
      max_clients: training.max_clients || null,
    };

    // Use POST onboarding endpoint to save training step
    postOnboard.mutate(body, {
      onSuccess: () => {
        setTrainingLocked(true);
        setStep(ADDRESS);
      },
    });
  }

  function submitAddress(e) {
    if (e) e.preventDefault();
    if (!trainerId) return showSnackbar("Trainer id missing", "error");

    const body = {
      onboarding_step: "address",
      trainer_id: trainerId,
      ...address,
    };

    postOnboard.mutate(body, {
      onSuccess: () => {
        // finished
        onClose();
      },
    });
  }

  return (
    <div className="w-[760px] bg-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{trainerId ? "Edit Trainer" : "Add Trainer"}</h3>
        <div className="flex gap-2">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">Close</button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          {/* Stepper */}
          <div className="flex items-center w-full">
            {[
              { id: BASIC, icon: User, label: "Basic" },
              { id: TRAINING, icon: Dumbbell, label: "Training" },
              { id: ADDRESS, icon: MapPin, label: "Address" },
            ].map((s, idx, arr) => {
              const Icon = s.icon;
              const active = step === s.id;
              const done = step > s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center w-full">
                    <div className="relative">
                      <div className={`w-11 h-11 flex items-center justify-center rounded-full ${active ? 'bg-primary text-black' : done ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                        {done ? <Check size={18} /> : <Icon size={18} />}
                      </div>
                      {idx < arr.length - 1 && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 w-40 h-0.5 bg-gray-700 ml-3" />
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-300">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {step === BASIC && (
        <form onSubmit={submitBasic} className="grid grid-cols-2 gap-3">
          <Input label="First Name" value={basic.first_name} disabled={basicLocked} onChange={(v) => setBasic({ ...basic, first_name: v })} />
          <Input label="Last Name" value={basic.last_name} disabled={basicLocked} onChange={(v) => setBasic({ ...basic, last_name: v })} />
          <Input label="Email" value={basic.email} disabled={basicLocked} onChange={(v) => setBasic({ ...basic, email: v })} />
          <Input label="Phone" value={basic.phone} disabled={basicLocked} onChange={(v) => setBasic({ ...basic, phone: v })} />
          <Input type="password" label="Password" value={basic.password} disabled={basicLocked} onChange={(v) => setBasic({ ...basic, password: v })} />
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded border border-gray-700 bg-card px-3 py-2">Cancel</button>
            <button type="submit" className="rounded bg-primary px-3 py-2 text-black">Next</button>
          </div>
        </form>
      )}

      {step === TRAINING && (
        <form onSubmit={submitTraining} className="grid grid-cols-2 gap-3">
          <Input label="Specialization" value={training.specialization} disabled={trainingLocked} onChange={(v) => setTraining({ ...training, specialization: v })} />
          <Input label="Shift" value={training.shift} disabled={trainingLocked} onChange={(v) => setTraining({ ...training, shift: v })} />
          <Input type="number" label="Experience Years" value={training.experience_years} disabled={trainingLocked} onChange={(v) => setTraining({ ...training, experience_years: Number(v) })} />
          <Input label="Certification" value={training.certification} disabled={trainingLocked} onChange={(v) => setTraining({ ...training, certification: v })} />
          <div className="col-span-2">
            <label className="mb-1 block text-sm text-gray-300">Bio</label>
            <textarea value={training.bio} disabled={trainingLocked} onChange={(e) => setTraining({ ...training, bio: e.target.value })} className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 text-white" />
          </div>
          <Input type="number" label="Max Clients" value={training.max_clients} disabled={trainingLocked} onChange={(v) => setTraining({ ...training, max_clients: v })} />

          <div className="col-span-2 flex justify-between">
            <button type="button" onClick={() => setStep(BASIC)} className="rounded border border-gray-700 bg-card px-3 py-2">Back</button>
            <button type="submit" disabled={postOnboard.isLoading || putSave.isLoading} className="rounded bg-primary px-3 py-2 text-black">{(postOnboard.isLoading || putSave.isLoading) ? "Saving..." : trainerId ? "Save" : "Create"}</button>
          </div>
        </form>
      )}

      {step === ADDRESS && (
        <form onSubmit={submitAddress} className="grid grid-cols-2 gap-3">
          <Input label="Address Line 1" value={address.address_line_1} onChange={(v) => setAddress({ ...address, address_line_1: v })} />
          <Input label="Address Line 2" value={address.address_line_2} onChange={(v) => setAddress({ ...address, address_line_2: v })} />
          <Input label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
          <Input label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
          <Input label="Country" value={address.country} onChange={(v) => setAddress({ ...address, country: v })} />
          <Input label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} />
          <Input label="Landmark" value={address.landmark} onChange={(v) => setAddress({ ...address, landmark: v })} />

          <div className="col-span-2 flex justify-between">
            <button type="button" onClick={() => setStep(TRAINING)} className="rounded border border-gray-700 bg-card px-3 py-2">Back</button>
            <button type="submit" disabled={postOnboard.isLoading || putSave.isLoading} className="rounded bg-primary px-3 py-2 text-black">{(postOnboard.isLoading || putSave.isLoading) ? "Saving..." : "Save Address"}</button>
          </div>
        </form>
      )}
    </div>
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
