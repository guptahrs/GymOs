import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import DataTable from "../components/DataTable";
import { useSnackbar } from "../context/SnackbarContext";
import API from "../api/client";

const emptyLeadForm = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  gender: "",
  dob: "",
};

const emptyAddress = {
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  landmark: "",
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyLeadForm);
  const [errors, setErrors] = useState({});
  const { showSnackbar } = useSnackbar();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [joinStep, setJoinStep] = useState(0);
  const [address, setAddress] = useState(emptyAddress);
  const [planForm, setPlanForm] = useState({ plan_id: "", amount_paid: "" });
  const [joinErrors, setJoinErrors] = useState({});
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchPlans();
  }, []);

  async function fetchLeads() {
    try {
      const res = await API.get("/members/leads/");
      setLeads(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchPlans() {
    try {
      const res = await API.get("/members/plans/");
      setPlans(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function openJoinModal(lead) {
    setSelectedLead(lead);
    setJoinStep(0);
    setAddress(emptyAddress);
    setPlanForm({ plan_id: "", amount_paid: "" });
    setJoinErrors({});
    setShowJoinModal(true);
  }

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: "email" },
    { header: "Gender", accessor: "gender" },
    { header: "DOB", accessor: "dob" },
    { header: "Status", accessor: "status" },
    {
      header: "Action",
      accessor: "action",
      render: (row) => (
        <button className="btn-primary" onClick={() => openJoinModal(row)}>
          Mark as Joined
        </button>
      ),
    },
  ];

  function validateAddress() {
    const err = {};
    if (!address.address_line_1.trim()) err.address_line_1 = "Address required";
    if (!address.city.trim()) err.city = "City required";
    if (!address.state.trim()) err.state = "State required";
    if (!address.country.trim()) err.country = "Country required";
    if (!address.pincode.trim()) err.pincode = "Pincode required";
    else if (!/^[0-9]{6}$/.test(address.pincode)) err.pincode = "Enter valid 6 digit pincode";
    setJoinErrors(err);
    return Object.keys(err).length === 0;
  }

  function validatePlan() {
    const err = {};
    if (planForm.amount_paid && Number(planForm.amount_paid) < 0) {
      err.amount_paid = "Paid amount cannot be negative";
    }
    if (!planForm.plan_id && planForm.amount_paid) {
      err.plan_id = "Select a plan before entering paid amount";
    }
    setJoinErrors(err);
    return Object.keys(err).length === 0;
  }

  async function submitJoin() {
    if (!selectedLead) return;
    try {
      setIsJoining(true);
      const leadId = selectedLead.lead_id || selectedLead.id;
      const payload = {
        address,
        gym_id: selectedLead.gym_id || localStorage.getItem("gym_id") || undefined,
        plan_id: planForm.plan_id || undefined,
        amount_paid: planForm.plan_id ? planForm.amount_paid || 0 : 0,
      };

      const res = await API.post(`/members/leads/${leadId}/convert/`, payload);
      setLeads((prev) => prev.filter((lead) => (lead.lead_id || lead.id) !== leadId));
      showSnackbar(res.data?.message || "Lead marked as joined", "success");
      setShowJoinModal(false);
      setSelectedLead(null);
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || "Failed to mark lead as joined", "error");
    } finally {
      setIsJoining(false);
    }
  }

  function validateLead() {
    const err = {};
    if (!form.first_name.trim()) err.first_name = "First name required";
    if (!form.last_name.trim()) err.last_name = "Last name required";
    if (!form.phone) err.phone = "Phone required";
    if (!form.email) err.email = "Email required";
    if (!form.gender) err.gender = "Gender required";
    if (!form.dob) err.dob = "DOB required";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function handleAddLead(e) {
    e.preventDefault();
    if (!validateLead()) return;

    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name || "",
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
        gym_id: localStorage.getItem("gym_id") || undefined,
      };

      const res = await API.post("/members/leads/", payload);
      const newLead = {
        lead_id: res.data?.data?.lead_id || Date.now().toString(),
        name: `${form.first_name} ${form.last_name}`.trim(),
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email,
        gender: form.gender,
        dob: form.dob,
        status: "lead",
      };

      setLeads((prev) => [newLead, ...prev]);
      setShowModal(false);
      setForm(emptyLeadForm);
      setErrors({});
      showSnackbar(res.data?.message || "Lead created", "success");
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || "An error occurred", "error");
    }
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div />
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Lead</button>
      </div>

      <DataTable columns={columns} data={leads} entity="Leads" />

      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65">
          <form onSubmit={handleAddLead} className="w-[340px] rounded-2xl bg-[#181c24] p-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Lead</h2>
              <button type="button" aria-label="Close" onClick={() => setShowModal(false)} className="text-2xl leading-none text-white">&times;</button>
            </div>
            <LeadInput placeholder="First Name" value={form.first_name} error={errors.first_name} onChange={(value) => setForm({ ...form, first_name: value })} />
            <LeadInput placeholder="Last Name" value={form.last_name} error={errors.last_name} onChange={(value) => setForm({ ...form, last_name: value })} />
            <LeadInput placeholder="Phone" value={form.phone} error={errors.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <LeadInput placeholder="Email" value={form.email} error={errors.email} onChange={(value) => setForm({ ...form, email: value })} />
            <div className="mb-3">
              <select className="w-full rounded border border-gray-700 bg-card p-2 text-white" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <div className="mt-1 text-xs text-red-400">{errors.gender}</div>}
            </div>
            <LeadInput type="date" value={form.dob} error={errors.dob} onChange={(value) => setForm({ ...form, dob: value })} />
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-primary">Add Lead</button>
              <button type="button" className="rounded bg-gray-700 px-4 py-2 text-white" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showJoinModal && selectedLead && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/65">
          <div className="w-[560px] rounded-xl bg-[#181c24] p-6 text-white">
            <h2 className="mb-2 text-lg font-semibold">Mark as Joined: {selectedLead.name || selectedLead.first_name}</h2>
            <div className="mb-4 flex gap-2 text-sm">
              <span className={`rounded px-3 py-1 ${joinStep === 0 ? "bg-primary text-black" : "bg-gray-700 text-white"}`}>Address</span>
              <span className={`rounded px-3 py-1 ${joinStep === 1 ? "bg-primary text-black" : "bg-gray-700 text-white"}`}>Plan</span>
            </div>

            <div className="min-h-[260px]">
              {joinStep === 0 && (
                <div>
                  <h3 className="mb-2 font-medium">Step 1 - Address</h3>
                  <JoinInput placeholder="Address line 1" value={address.address_line_1} error={joinErrors.address_line_1} onChange={(value) => setAddress({ ...address, address_line_1: value })} />
                  <JoinInput placeholder="Address line 2" value={address.address_line_2} onChange={(value) => setAddress({ ...address, address_line_2: value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <JoinInput placeholder="City" value={address.city} error={joinErrors.city} onChange={(value) => setAddress({ ...address, city: value })} />
                    <JoinInput placeholder="State" value={address.state} error={joinErrors.state} onChange={(value) => setAddress({ ...address, state: value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <JoinInput placeholder="Country" value={address.country} error={joinErrors.country} onChange={(value) => setAddress({ ...address, country: value })} />
                    <JoinInput placeholder="Pincode" value={address.pincode} error={joinErrors.pincode} onChange={(value) => setAddress({ ...address, pincode: value })} />
                  </div>
                  <JoinInput placeholder="Landmark" value={address.landmark} onChange={(value) => setAddress({ ...address, landmark: value })} />
                </div>
              )}

              {joinStep === 1 && (
                <div>
                  <h3 className="mb-2 font-medium">Step 2 - Plan</h3>
                  <div className="mb-2">
                    <select value={planForm.plan_id} onChange={(e) => setPlanForm({ ...planForm, plan_id: e.target.value, amount_paid: "" })} className="w-full rounded border border-gray-700 bg-card p-2 text-white">
                      <option value="">No plan selected - payment due</option>
                      {plans.map((plan) => (
                        <option key={plan.plan_id} value={plan.plan_id}>
                          {plan.name} - Rs {plan.price} / {plan.duration_days} days
                        </option>
                      ))}
                    </select>
                    {joinErrors.plan_id && <div className="mt-1 text-xs text-red-400">{joinErrors.plan_id}</div>}
                  </div>
                  {planForm.plan_id && (
                    <JoinInput
                      type="number"
                      placeholder="Paid amount (optional)"
                      value={planForm.amount_paid}
                      error={joinErrors.amount_paid}
                      onChange={(value) => setPlanForm({ ...planForm, amount_paid: value })}
                    />
                  )}
                  {!planForm.plan_id && <p className="mt-2 text-sm text-gray-400">Member will be created with payment status due.</p>}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <button className="rounded bg-gray-700 px-3 py-1 text-white" onClick={() => { setShowJoinModal(false); setSelectedLead(null); }}>Cancel</button>
              <div>
                {joinStep > 0 && <button className="mr-2 rounded bg-gray-700 px-3 py-1 text-white" onClick={() => setJoinStep(0)}>Back</button>}
                {joinStep === 0 && <button className="btn-primary" onClick={() => { if (validateAddress()) setJoinStep(1); }}>Next</button>}
                {joinStep === 1 && (
                  <button className="btn-primary disabled:opacity-50" disabled={isJoining} onClick={() => { if (validatePlan()) submitJoin(); }}>
                    {isJoining ? "Saving..." : "Mark as Joined"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

function LeadInput({ type = "text", placeholder = "", value, error, onChange }) {
  return (
    <div className="mb-3">
      <input type={type} className="w-full rounded border border-gray-700 bg-card p-2 text-white" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <div className="mt-1 text-xs text-red-400">{error}</div>}
    </div>
  );
}

function JoinInput({ type = "text", placeholder, value, error, onChange }) {
  return (
    <div className="mb-2">
      <input type={type} min={type === "number" ? "0" : undefined} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-gray-700 bg-card p-2 text-white" />
      {error && <div className="mt-1 text-xs text-red-400">{error}</div>}
    </div>
  );
}
