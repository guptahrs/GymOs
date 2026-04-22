
import { useState } from "react";
import { useSnackbar } from "../context/SnackbarContext";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import Stepper from "../components/Stepper";
import FloatingInput from "../components/FloatingInput";
import API from "../api/client";
import { useMutation } from '@tanstack/react-query';

export default function GymAddForm() {
  const { showSnackbar } = useSnackbar();
  const [step, setStep] = useState(1);
  const [gymId, setGymId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [address, setAddress] = useState({
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    landmark: "",
  });
  const [errors, setErrors] = useState({});

  const validateBasic = () => {
    let err = {};
    if (!form.name.trim()) err.name = "Name required";
    if (!form.email) {
      err.email = "Email required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      err.email = "Invalid email";
    }
    if (!form.phone) {
      err.phone = "Phone required";
    } else if (!/^[0-9]{10,15}$/.test(form.phone)) {
      err.phone = "Enter valid phone number";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateAddress = () => {
    let err = {};
    if (!address.address_line_1) err.address_line_1 = "Required";
    if (!address.city) err.city = "Required";
    if (!address.state) err.state = "Required";
    if (!address.country) err.country = "Required";
    if (!address.pincode) {
      err.pincode = "Required";
    } else if (!/^[0-9]{6}$/.test(address.pincode)) {
      err.pincode = "Invalid pincode";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleBasic = async () => {
    if (!validateBasic()) return;
    try {
      const res = await createGym.mutateAsync(form);
      setGymId(res.data.gym_id);
      setStep(2);
      showSnackbar(res.message || "Gym basic details saved", "success");
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Failed to create gym";
      setErrors({ api: msg });
      showSnackbar(msg, "error");
    }
  };

  const handleAddress = async () => {
    if (!validateAddress()) return;
    try {
      const res = await addAddress.mutateAsync({ gym_id: gymId, ...address });
      showSnackbar(res.message || "Gym address added successfully 🚀", "success");
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Failed to add address";
      setErrors({ api: msg });
      showSnackbar(msg, "error");
    }
  };

  const { mutateAsync: createGym } = useMutation(async (payload) => {
    const res = await API.post('/gyms/create/', payload);
    return res.data;
  });

  const { mutateAsync: addAddress } = useMutation(async (payload) => {
    const res = await API.post('/gyms/add-address/', payload);
    return res.data;
  });

  return (
    <SuperAdminLayout>
      <h2 className="text-xl font-bold mb-4">Add Gym</h2>
      <Stepper step={step} setStep={setStep} />
      <div className="max-w-md space-y-4">
        {errors.api && <div className="text-red-400">{errors.api}</div>}
        {step === 1 && (
          <>
            <FloatingInput label="Gym Name" value={form.name} error={errors.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <FloatingInput label="Email" value={form.email} error={errors.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <FloatingInput label="Phone" value={form.phone} error={errors.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <button onClick={handleBasic} className="btn-primary w-full mt-2">Next →</button>
          </>
        )}
        {step === 2 && (
          <>
            <FloatingInput label="Address Line 1" value={address.address_line_1} error={errors.address_line_1} onChange={e => setAddress({ ...address, address_line_1: e.target.value })} />
            <FloatingInput label="Address Line 2" value={address.address_line_2} error={errors.address_line_2} onChange={e => setAddress({ ...address, address_line_2: e.target.value })} />
            <FloatingInput label="City" value={address.city} error={errors.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
            <FloatingInput label="State" value={address.state} error={errors.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
            <FloatingInput label="Country" value={address.country} error={errors.country} onChange={e => setAddress({ ...address, country: e.target.value })} />
            <FloatingInput label="Pincode" value={address.pincode} error={errors.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} />
            <FloatingInput label="Landmark" value={address.landmark} error={errors.landmark} onChange={e => setAddress({ ...address, landmark: e.target.value })} />
            <button onClick={handleAddress} className="btn-primary w-full mt-2">Submit</button>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}
