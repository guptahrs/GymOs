import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2 } from "lucide-react";
import API from "../api/client";
import DataTable from "../components/DataTable";
import MainLayout from "../layouts/MainLayout";
import { showSnackbar } from "../utils/snackbarService";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "",
  salary: "",
  password: "",
};

export default function AddStaff() {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [deleteStaff, setDeleteStaff] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const queryClient = useQueryClient();

  const { data: staffData } = useQuery(["staff"], async () => {
    const res = await API.get("/staff/");
    return res.data?.data || [];
  });

  useEffect(() => {
    if (staffData) setStaff(staffData);
  }, [staffData]);

  function openCreateModal() {
    setEditingStaffId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(row) {
    setEditingStaffId(row.staff_id);
    setForm({
      first_name: row.first_name || "",
      last_name: row.last_name || "",
      email: row.email || "",
      phone: row.phone || "",
      role: row.role || "",
      salary: row.salary || "",
      password: "",
    });
    setFormError("");
    setShowModal(true);
  }

  const saveMutation = useMutation(
    async (payload) => {
      if (payload.staffId) {
        const res = await API.put(`/staff/${payload.staffId}/`, payload.body);
        return res.data;
      }
      const res = await API.post("/staff/", payload.body);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || "Staff saved", "success");
        setShowModal(false);
        queryClient.invalidateQueries(["staff"]);
      },
      onError: (err) => {
        showSnackbar(err.response?.data?.message || err.message || "Failed to save staff", "error");
      },
    }
  );

  const deleteMutation = useMutation(
    async (staffId) => {
      const res = await API.delete(`/staff/${staffId}/`);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || "Staff deleted", "success");
        setDeleteStaff(null);
        queryClient.invalidateQueries(["staff"]);
      },
      onError: (err) => {
        showSnackbar(err.response?.data?.message || err.message || "Failed to delete staff", "error");
      },
    }
  );

  function submitForm(e) {
    e.preventDefault();
    if (!form.first_name.trim()) {
      setFormError("First name is required");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email is required");
      return;
    }

    const body = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      salary: form.salary || null,
    };

    if (!editingStaffId && form.password) {
      body.password = form.password;
    }

    saveMutation.mutate({ staffId: editingStaffId, body });
  }

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Role", accessor: "role" },
    {
      header: "Salary",
      accessor: "salary",
      render: (row) => <span>{row.salary ? `Rs ${row.salary}` : "-"}</span>,
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(row)} aria-label={`Edit ${row.name}`} className="rounded border border-gray-700 bg-card p-2 hover:bg-white/5">
            <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleteStaff(row)} aria-label={`Delete ${row.name}`} className="rounded bg-red-600 p-2 text-white hover:opacity-90">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <div />
          <button onClick={openCreateModal} className="rounded-lg bg-primary px-3 py-2 text-black">Add Staff</button>
        </div>

        <DataTable columns={columns} data={staff} entity="Staff" />

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <form onSubmit={submitForm} className="w-[440px] rounded-lg bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">{editingStaffId ? "Edit Staff" : "Add Staff"}</h3>

              <div className="grid grid-cols-2 gap-3">
                <StaffInput label="First Name" value={form.first_name} onChange={(value) => setForm({ ...form, first_name: value })} />
                <StaffInput label="Last Name" value={form.last_name} onChange={(value) => setForm({ ...form, last_name: value })} />
              </div>

              <StaffInput label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
              <StaffInput label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />

              <div className="grid grid-cols-2 gap-3">
                <StaffInput label="Role" value={form.role} onChange={(value) => setForm({ ...form, role: value })} />
                <StaffInput type="number" label="Salary" value={form.salary} onChange={(value) => setForm({ ...form, salary: value })} />
              </div>

              {!editingStaffId && (
                <StaffInput type="password" label="Password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
              )}

              {formError && <div className="mb-3 text-xs text-red-400">{formError}</div>}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded border border-gray-700 bg-card px-3 py-2">Cancel</button>
                <button type="submit" disabled={saveMutation.isLoading} className="rounded bg-primary px-3 py-2 text-black disabled:opacity-50">
                  {saveMutation.isLoading ? "Saving..." : editingStaffId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {deleteStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-lg bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">Delete Staff</h3>
              <p className="mb-4 text-sm text-gray-300">Are you sure you want to delete <strong>{deleteStaff.name}</strong>?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteStaff(null)} className="rounded border border-gray-700 bg-card px-3 py-2">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteStaff.staff_id)} disabled={deleteMutation.isLoading} className="rounded bg-red-600 px-3 py-2 text-white disabled:opacity-50">
                  {deleteMutation.isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function StaffInput({ type = "text", label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        min={type === "number" ? "0" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-700 bg-transparent px-3 py-2 text-white"
      />
    </div>
  );
}
