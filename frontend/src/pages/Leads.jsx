import MainLayout from "../layouts/MainLayout";
import DataTable from "../components/DataTable";
import BackButton from "../components/BackButton";
import { useSnackbar } from "../context/SnackbarContext";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "", gender: "", dob: "" });
  const [errors, setErrors] = useState({});
  const { showSnackbar } = useSnackbar();
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [convertStep, setConvertStep] = useState(0); // 0: address, 1: payment

  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", country: "", pincode: "" });
  const [payment, setPayment] = useState({ amount: "", payment_mode: "cash", transaction_id: "" });
  const [convertErrors, setConvertErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/members/leads/`);
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error((json && json.message) || res.statusText || 'Failed to fetch leads');
        setLeads((json && json.data) || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

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
        <button
          className="btn-primary"
          onClick={() => {
            setSelectedLead(row);
            setConvertStep(0);
            setAddress({ line1: "", line2: "", city: "", state: "", country: "", pincode: "" });
            setPayment({ amount: "", payment_mode: "cash", transaction_id: "" });
            setConvertErrors({});
            setShowConvertModal(true);
          }}
        >
          Convert
        </button>
      ),
    },
  ];

  function validateAddress() {
    let err = {};
    if (!address.line1.trim()) err.line1 = "Address required";
    if (!address.city.trim()) err.city = "City required";
    if (!address.pincode.trim()) err.pincode = "Pincode required";
    setConvertErrors(err);
    return Object.keys(err).length === 0;
  }

  function validatePayment() {
    let err = {};
    if (!payment.amount || Number(payment.amount) <= 0) err.amount = "Valid amount required";
    if (!payment.payment_mode) err.payment_mode = "Payment mode required";
    setConvertErrors(err);
    return Object.keys(err).length === 0;
  }

  async function submitConvert() {
    if (!selectedLead) return;
    try {
      const leadId = selectedLead.lead_id || selectedLead.id;
      const payload = {
        address,
        payment,
        gym_id: selectedLead.gym_id || undefined,
      };

      const res = await fetch(`${API_BASE}/api/members/leads/${leadId}/convert/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error((data && data.message) || res.statusText || 'Convert failed');

      setLeads(prev => prev.map(l => (l.lead_id === leadId || l.id === leadId) ? { ...l, status: 'converted' } : l));
      showSnackbar('Lead converted to member', 'success');
      setShowConvertModal(false);
      setSelectedLead(null);
    } catch (err) {
      showSnackbar(err.message || 'An error occurred during convert', 'error');
    }
  }

  function validate() {
    let err = {};
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
    if (!validate()) return;

    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name || "",
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
      };

      const res = await fetch(`${API_BASE}/api/members/leads/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error((data && data.message) || res.statusText || 'Failed to create lead');

      const newLead = { lead_id: data.data?.lead_id || Date.now().toString(), name: `${form.first_name} ${form.last_name}`.trim(), first_name: form.first_name, last_name: form.last_name, phone: form.phone, email: form.email, gender: form.gender, dob: form.dob, status: 'lead' };
      setLeads(prev => [newLead, ...prev]);
      setShowModal(false);
      setForm({ first_name: "", last_name: "", phone: "", email: "", gender: "", dob: "" });
      setErrors({});
    } catch (err) {
      showSnackbar(err.message || 'An error occurred', 'error');
    }
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 mb-6">
          {/* <BackButton />
          <h1 className="text-2xl font-semibold tracking-tight leading-none">
            Leads
          </h1> */}
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Lead</button>
      </div>

      <DataTable columns={columns} data={leads} />

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleAddLead} style={{ background: '#181c24', padding: 32, borderRadius: 16, minWidth: 340, boxShadow: '0 4px 32px #0008' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Lead</h2>
              <button type="button" aria-label="Close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, lineHeight: 1, cursor: 'pointer', marginLeft: 8 }}>&times;</button>
            </div>
            <div className="mb-3">
              <input className="w-full p-2 rounded bg-card border border-gray-700 text-white" placeholder="First Name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              {errors.first_name && <div className="text-red-400 text-xs mt-1">{errors.first_name}</div>}
            </div>
            <div className="mb-3">
              <input className="w-full p-2 rounded bg-card border border-gray-700 text-white" placeholder="Last Name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              {errors.last_name && <div className="text-red-400 text-xs mt-1">{errors.last_name}</div>}
            </div>
            <div className="mb-3">
              <input className="w-full p-2 rounded bg-card border border-gray-700 text-white" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              {errors.phone && <div className="text-red-400 text-xs mt-1">{errors.phone}</div>}
            </div>
            <div className="mb-3">
              <input className="w-full p-2 rounded bg-card border border-gray-700 text-white" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              {errors.email && <div className="text-red-400 text-xs mt-1">{errors.email}</div>}
            </div>
            <div className="mb-3">
              <select className="w-full p-2 rounded bg-card border border-gray-700 text-white" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <div className="text-red-400 text-xs mt-1">{errors.gender}</div>}
            </div>
            <div className="mb-3">
              <input type="date" className="w-full p-2 rounded bg-card border border-gray-700 text-white" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
              {errors.dob && <div className="text-red-400 text-xs mt-1">{errors.dob}</div>}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn-primary">Add Lead</button>
              <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showConvertModal && selectedLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#181c24', padding: 24, borderRadius: 12, width: 520, color: '#fff' }}>
            <h2 className="text-lg font-semibold mb-2">Convert Lead: {selectedLead.name || selectedLead.first_name}</h2>
            <div style={{ minHeight: 180 }}>
              {convertStep === 0 && (
                <div>
                  <h3 className="font-medium mb-2">Step 1 — Address</h3>
                  <div className="mb-2"><input placeholder="Address line 1" value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} className="w-full p-2 rounded bg-card border border-gray-700 text-white" /></div>
                  {convertErrors.line1 && <div className="text-red-400 text-xs mb-2">{convertErrors.line1}</div>}
                  <div className="mb-2"><input placeholder="Address line 2" value={address.line2} onChange={e => setAddress({ ...address, line2: e.target.value })} className="w-full p-2 rounded bg-card border border-gray-700 text-white" /></div>
                  <div className="mb-2"><input placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="w-full p-2 rounded bg-card border border-gray-700 text-white" /></div>
                  {convertErrors.city && <div className="text-red-400 text-xs mb-2">{convertErrors.city}</div>}
                  <div className="mb-2"><input placeholder="State" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="w-full p-2 rounded bg-card border border-gray-700 text-white" /></div>
                  <div className="mb-2"><input placeholder="Country" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} className="w-full p-2 rounded bg-card border border-gray-700 text-white" /></div>
                  <div className="mb-2"><input placeholder="Pincode" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} className="w-full p-2 rounded bg-card border border-gray-700 text-white" /></div>
                  {convertErrors.pincode && <div className="text-red-400 text-xs mb-2">{convertErrors.pincode}</div>}
                </div>
              )}

              {convertStep === 1 && (
                <div>
                  <h3 className="font-medium mb-2">Step 2 — Payment</h3>
                  <div className="mb-2"><input placeholder="Amount" value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} className="w-full p-2 rounded bg-card border border-gray-700 text-white" /></div>
                  {convertErrors.amount && <div className="text-red-400 text-xs mb-2">{convertErrors.amount}</div>}
                  <div className="mb-2">
                    <select value={payment.payment_mode} onChange={e => setPayment({ ...payment, payment_mode: e.target.value })} className="w-full p-2 rounded bg-card border border-gray-700 text-white">
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                  <div className="mb-2"><input placeholder="Transaction ID (optional)" value={payment.transaction_id} onChange={e => setPayment({ ...payment, transaction_id: e.target.value })} className="w-full p-2 rounded bg-card border border-gray-700 text-white" /></div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <div>
                <button className="px-3 py-1 rounded bg-gray-700 text-white mr-2" onClick={() => { setShowConvertModal(false); setSelectedLead(null); }}>Cancel</button>
              </div>
              <div>
                {convertStep > 0 && <button className="px-3 py-1 rounded bg-gray-700 text-white mr-2" onClick={() => setConvertStep(s => Math.max(0, s-1))}>Back</button>}
                {convertStep === 0 && <button className="btn-primary" onClick={() => { if (validateAddress()) setConvertStep(1); }}>Next</button>}
                {convertStep === 1 && <button className="btn-primary" onClick={() => { if (validatePayment()) submitConvert(); }}>Finish</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
