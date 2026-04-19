import { useState } from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import Stepper from "../components/Stepper";
import FloatingInput from "../components/FloatingInput";
import FloatingSelect from "../components/FloatingSelect";
import FloatingDatePicker from "../components/FloatingDatePicker";
import API from "../api/client";


export default function AddMember() {
  const [step, setStep] = useState(1);
  const [memberId, setMemberId] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
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

  // Add errors state
  const [errors, setErrors] = useState({});

  const validateBasic = () => {
    let err = {};

    if (!form.first_name.trim()) err.first_name = "First name required";
    if (!form.last_name.trim()) err.last_name = "Last name required";

    if (!form.email) {
      err.email = "Email required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      err.email = "Invalid email";
    }

    if (!form.phone) {
      err.phone = "Phone required";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      err.phone = "Enter valid 10 digit number";
    }

    if (!form.gender) err.gender = "Select gender";
    if (!form.dob) err.dob = "DOB required";

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
    const res = await API.post("/members/create/", form);
    setMemberId(res.data.data.id);
    setStep(2);
  };

  const handleAddress = async () => {
    if (!validateAddress()) return;
    await API.post("/members/address/", {
      member_id: memberId,
      ...address,
    });
    alert("Done 🚀");
  };

  return (
    <MainLayout>

      <Stepper step={step} setStep={setStep} />

      {/* Progress 
      <div className="w-full bg-gray-800 h-2 rounded mb-6">
        <div
          className="bg-primary h-2 rounded transition-all duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div> */}

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 max-w-md"
      >

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <FloatingInput label="First Name" value={form.first_name}
              error={errors.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })} />

            <FloatingInput label="Last Name" value={form.last_name}
              error={errors.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })} />

            <FloatingInput label="Email" value={form.email}
              error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />

            <FloatingInput label="Phone" value={form.phone}
              error={errors.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />

            <FloatingSelect
              label="Gender"
              value={form.gender}
              error={errors.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
              ]}
            />

            <FloatingDatePicker
              label="DOB"
              value={form.dob}
              error={errors.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />

            <button
              onClick={handleBasic}
              disabled={!form.first_name || !form.email || !form.phone || !form.gender || !form.dob}
              className="btn-primary w-full disabled:opacity-50">
              Next →
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <FloatingInput label="Address Line 1" value={address.address_line_1}
              error={errors.address_line_1}
              onChange={(e) => setAddress({ ...address, address_line_1: e.target.value })} />

            <FloatingInput label="Address Line 2" value={address.address_line_2}
              error={errors.address_line_2}
              onChange={(e) => setAddress({ ...address, address_line_2: e.target.value })} />

            <FloatingInput label="City" value={address.city}
              error={errors.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })} />

            <FloatingInput label="State" value={address.state}
              error={errors.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })} />

            <FloatingInput label="Country" value={address.country}
              error={errors.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })} />

            <FloatingInput label="Pincode" value={address.pincode}
              error={errors.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />

            <FloatingInput label="Landmark" value={address.landmark}
              error={errors.landmark}
              onChange={(e) => setAddress({ ...address, landmark: e.target.value })} />

            <button onClick={handleAddress} className="btn-primary w-full disabled:opacity-50"
              disabled={!address.address_line_1 || !address.city || !address.state || !address.country || !address.pincode}>
              Save 🚀
            </button>
          </>
        )}

      </motion.div>
    </MainLayout>
  );
}