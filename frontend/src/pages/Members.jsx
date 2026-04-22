import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/client";
import MainLayout from "../layouts/MainLayout";
import DataTable from "../components/DataTable";
import { showSnackbar } from "../utils/snackbarService";
import { BadgeCheck, CreditCard, Edit2, Trash2 } from "lucide-react";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [plans, setPlans] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [planForm, setPlanForm] = useState({ plan_id: "", amount_paid: "", remaining_amount: "" });
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", phone: "", gender: "", dob: "" });
  const [deleteMember, setDeleteMember] = useState(null);
  const [formError, setFormError] = useState("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: membersData } = useQuery(
    ["members", { search: debouncedSearch, page }],
    async () => {
      const res = await API.get(`/members/?search=${debouncedSearch}&page=${page}`);
      return res.data.data;
    },
    { keepPreviousData: true }
  );

  useEffect(() => {
    if (membersData) {
      setMembers(membersData.results || []);
      setCount(membersData.count || 0);
    }
  }, [membersData]);

  async function openPlanModal(member) {
    setSelectedMember(member);
    setPlanForm({ plan_id: "", amount_paid: "", remaining_amount: "" });
    setFormError("");
    try {
      const res = await API.get("/members/plans/");
      setPlans(res.data?.data || []);
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to fetch plans", "error");
    }
  }

  function openEditModal(member) {
    setEditingMember(member);
    setEditForm({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      email: member.email || "",
      phone: member.phone || "",
      gender: member.gender || "",
      dob: member.dob || "",
    });
    setFormError("");
  }

  async function updateMember(e) {
    e.preventDefault();
    if (!editingMember) return;
    if (!editForm.first_name.trim()) {
      setFormError("First name is required");
      return;
    }
    if (!editForm.email.trim()) {
      setFormError("Email is required");
      return;
    }

    try {
      setIsSavingMember(true);
      const res = await API.put(`/members/${editingMember.member_id}/`, editForm);
      showSnackbar(res.data?.message || "Member updated", "success");
      setEditingMember(null);
      queryClient.invalidateQueries(["members"]);
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || "Failed to update member", "error");
    } finally {
      setIsSavingMember(false);
    }
  }

  async function confirmDeleteMember() {
    if (!deleteMember) return;

    try {
      setIsDeletingMember(true);
      const res = await API.delete(`/members/${deleteMember.member_id}/`);
      showSnackbar(res.data?.message || "Member deleted", "success");
      setDeleteMember(null);
      queryClient.invalidateQueries(["members"]);
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || "Failed to delete member", "error");
    } finally {
      setIsDeletingMember(false);
    }
  }

  async function assignPlan() {
    if (!selectedMember) return;
    if (!planForm.plan_id) {
      setFormError("Select a plan");
      return;
    }
    if (planForm.amount_paid && Number(planForm.amount_paid) < 0) {
      setFormError("Paid amount cannot be negative");
      return;
    }
    if (planForm.remaining_amount && Number(planForm.remaining_amount) < 0) {
      setFormError("Remaining amount cannot be negative");
      return;
    }

    try {
      setIsSavingPlan(true);
      const res = await API.post("/members/assign-plan/", {
        member_id: selectedMember.member_id,
        plan_id: planForm.plan_id,
        amount_paid: planForm.amount_paid || undefined,
        remaining_amount: planForm.remaining_amount || undefined,
      });

      showSnackbar(res.data?.message || "Plan assigned", "success");
      setSelectedMember(null);
      queryClient.invalidateQueries(["members"]);
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || "Failed to assign plan", "error");
    } finally {
      setIsSavingPlan(false);
    }
  }

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      header: "Action",
      accessor: "action",
      render: (row) => (
        <div className="flex items-center gap-2">
          {String(row.payment_status).toLowerCase() === "due" ? (
            <button
              title="Select Plan"
              aria-label={`Pay plan for ${row.name}`}
              className="rounded-lg bg-primary p-2 text-black hover:opacity-90"
              onClick={() => openPlanModal(row)}
            >
              <CreditCard size={16} />
            </button>
          ) : (
            <button
              disabled
              title="Plan activated"
              aria-label={`Plan activated for ${row.name}`}
              className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-green-300 disabled:cursor-not-allowed disabled:opacity-80"
            >
              <BadgeCheck size={16} />
            </button>
          )}
          <button onClick={() => openEditModal(row)} aria-label={`Edit ${row.name}`} className="rounded border border-gray-700 bg-card p-2 hover:bg-white/5">
            <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleteMember(row)} aria-label={`Delete ${row.name}`} className="rounded bg-red-600 p-2 text-white hover:opacity-90">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(count / 10));

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex w-full items-center gap-3">
            <input
              type="text"
              placeholder="Search members..."
              className="w-80 rounded-lg border border-gray-700 bg-card px-4 py-2 text-white outline-none focus:ring-1 focus:ring-primary"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-gray-700 bg-card px-3 py-2 hover:bg-white/5">Filter</button>
            <button className="rounded-lg border border-gray-700 bg-card px-3 py-2 hover:bg-white/5">Sort</button>
          </div>
        </div>

        <DataTable columns={columns} data={members} entity="Members" />

        <div className="mt-6 flex items-center justify-between">
          <button
            className="rounded-lg border border-gray-700 bg-card px-4 py-2 hover:bg-white/5 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>

          <button
            className="rounded-lg border border-gray-700 bg-card px-4 py-2 hover:bg-white/5 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/65">
          <div className="w-[420px] rounded-xl bg-[#181c24] p-6 text-white shadow-2xl">
            <h2 className="mb-1 text-lg font-semibold">Buy Plan</h2>
            <p className="mb-4 text-sm text-gray-400">{selectedMember.name}</p>

            <div className="mb-3">
              <select
                value={planForm.plan_id}
                onChange={(e) => setPlanForm({ ...planForm, plan_id: e.target.value })}
                className="w-full rounded border border-gray-700 bg-card p-2 text-white"
              >
                <option value="">Select plan</option>
                {plans.map((plan) => (
                  <option key={plan.plan_id} value={plan.plan_id}>
                    {plan.name} - Rs {plan.price} / {plan.duration_days} days
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <input
                type="number"
                min="0"
                placeholder="Amount received (blank = plan price)"
                value={planForm.amount_paid}
                onChange={(e) => setPlanForm({ ...planForm, amount_paid: e.target.value })}
                className="w-full rounded border border-gray-700 bg-card p-2 text-white"
              />
              <p className="mt-1 text-xs text-gray-500">Use the actual amount received after any bargaining.</p>
            </div>

            <div className="mb-3">
              <input
                type="number"
                min="0"
                placeholder="Remaining amount (blank = full payment)"
                value={planForm.remaining_amount}
                onChange={(e) => setPlanForm({ ...planForm, remaining_amount: e.target.value })}
                className="w-full rounded border border-gray-700 bg-card p-2 text-white"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty when full payment is received.</p>
            </div>

            {formError && <div className="mb-3 text-xs text-red-400">{formError}</div>}

            <div className="flex justify-end gap-2">
              <button className="rounded bg-gray-700 px-3 py-2 text-white" onClick={() => setSelectedMember(null)}>Cancel</button>
              <button className="btn-primary disabled:opacity-50" disabled={isSavingPlan} onClick={assignPlan}>
                {isSavingPlan ? "Saving..." : "Assign Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/65">
          <form onSubmit={updateMember} className="w-[420px] rounded-xl bg-[#181c24] p-6 text-white shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold">Edit Member</h2>

            <div className="grid grid-cols-2 gap-3">
              <MemberInput label="First Name" value={editForm.first_name} onChange={(value) => setEditForm({ ...editForm, first_name: value })} />
              <MemberInput label="Last Name" value={editForm.last_name} onChange={(value) => setEditForm({ ...editForm, last_name: value })} />
            </div>

            <MemberInput label="Email" value={editForm.email} onChange={(value) => setEditForm({ ...editForm, email: value })} />
            <MemberInput label="Phone" value={editForm.phone} onChange={(value) => setEditForm({ ...editForm, phone: value })} />

            <div className="mb-3">
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full rounded border border-gray-700 bg-card p-2 text-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <MemberInput type="date" label="" value={editForm.dob || ""} onChange={(value) => setEditForm({ ...editForm, dob: value })} />

            {formError && <div className="mb-3 text-xs text-red-400">{formError}</div>}

            <div className="flex justify-end gap-2">
              <button type="button" className="rounded bg-gray-700 px-3 py-2 text-white" onClick={() => setEditingMember(null)}>Cancel</button>
              <button type="submit" className="btn-primary disabled:opacity-50" disabled={isSavingMember}>
                {isSavingMember ? "Saving..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteMember && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/65">
          <div className="w-[420px] rounded-xl bg-[#181c24] p-6 text-white shadow-2xl">
            <h2 className="mb-3 text-lg font-semibold">Delete Member</h2>
            <p className="mb-4 text-sm text-gray-300">Are you sure you want to delete <strong>{deleteMember.name}</strong>?</p>
            <div className="flex justify-end gap-2">
              <button className="rounded bg-gray-700 px-3 py-2 text-white" onClick={() => setDeleteMember(null)}>Cancel</button>
              <button className="rounded bg-red-600 px-3 py-2 text-white disabled:opacity-50" disabled={isDeletingMember} onClick={confirmDeleteMember}>
                {isDeletingMember ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

function MemberInput({ type = "text", label, value, onChange }) {
  return (
    <div className="mb-3">
      {label && <label className="mb-1 block text-sm text-gray-300">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-700 bg-card p-2 text-white"
      />
    </div>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "").toLowerCase();
  const styles = normalized === "active"
    ? "bg-green-500/20 text-green-400"
    : normalized === "payment due"
      ? "bg-amber-500/20 text-amber-300"
      : normalized === "partial payment"
        ? "bg-sky-500/20 text-sky-300"
        : "bg-red-500/20 text-red-400";

  return (
    <span className={`rounded px-2 py-1 text-xs ${styles}`}>
      {status}
    </span>
  );
}
