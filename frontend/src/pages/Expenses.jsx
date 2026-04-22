import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2 } from "lucide-react";
import API from "../api/client";
import DataTable from "../components/DataTable";
import MainLayout from "../layouts/MainLayout";
import { showSnackbar } from "../utils/snackbarService";

const emptyForm = {
  title: "",
  amount: "",
  category: "",
  expense_date: "",
  description: "",
};

const categories = [
  { label: "Salary", value: "salary" },
  { label: "Rent", value: "rent" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Other", value: "other" },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const queryClient = useQueryClient();

  const { data: expensesData } = useQuery(["expenses"], async () => {
    const res = await API.get("/expenses/");
    const payload = res.data?.data;
    return Array.isArray(payload) ? payload : payload?.results || [];
  });

  useEffect(() => {
    if (expensesData) setExpenses(expensesData);
  }, [expensesData]);

  function openCreateModal() {
    setEditingExpenseId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(expense) {
    setEditingExpenseId(expense.id);
    setForm({
      title: expense.title || "",
      amount: expense.amount || "",
      category: expense.category || "",
      expense_date: expense.expense_date || "",
      description: expense.description || "",
    });
    setFormError("");
    setShowModal(true);
  }

  const saveMutation = useMutation(
    async (payload) => {
      if (payload.expenseId) {
        const res = await API.put(`/expenses/${payload.expenseId}/update/`, payload.body);
        return res.data;
      }
      const res = await API.post("/expenses/create/", payload.body);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || "Expense saved", "success");
        setShowModal(false);
        queryClient.invalidateQueries(["expenses"]);
      },
      onError: (err) => {
        showSnackbar(err.response?.data?.message || err.message || "Failed to save expense", "error");
      },
    }
  );

  const deleteMutation = useMutation(
    async (expenseId) => {
      const res = await API.delete(`/expenses/${expenseId}/delete/`);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || "Expense deleted", "success");
        setDeleteExpense(null);
        queryClient.invalidateQueries(["expenses"]);
      },
      onError: (err) => {
        showSnackbar(err.response?.data?.message || err.message || "Failed to delete expense", "error");
      },
    }
  );

  function submitForm(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setFormError("Valid amount is required");
      return;
    }
    if (!form.category) {
      setFormError("Category is required");
      return;
    }
    if (!form.expense_date) {
      setFormError("Expense date is required");
      return;
    }

    saveMutation.mutate({
      expenseId: editingExpenseId,
      body: {
        title: form.title,
        amount: form.amount,
        category: form.category,
        expense_date: form.expense_date,
        description: form.description,
      },
    });
  }

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (row) => <span className="text-white">{row.title}</span>,
    },
    {
      header: "Amount",
      accessor: "amount",
      render: (row) => <span>Rs {row.amount}</span>,
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => <span className="capitalize">{row.category}</span>,
    },
    { header: "Date", accessor: "expense_date" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(row)} aria-label={`Edit ${row.title}`} className="rounded border border-gray-700 bg-card p-2 hover:bg-white/5">
            <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleteExpense(row)} aria-label={`Delete ${row.title}`} className="rounded bg-red-600 p-2 text-white hover:opacity-90">
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
          <button onClick={openCreateModal} className="rounded-lg bg-primary px-3 py-2 text-black">Add Expense</button>
        </div>

        <DataTable columns={columns} data={expenses} entity="Expenses" />

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <form onSubmit={submitForm} className="w-[440px] rounded-lg bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">{editingExpenseId ? "Edit Expense" : "Add Expense"}</h3>

              <ExpenseInput label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />

              <div className="grid grid-cols-2 gap-3">
                <ExpenseInput type="number" label="Amount" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
                <ExpenseInput type="date" label="Expense Date" value={form.expense_date} onChange={(value) => setForm({ ...form, expense_date: value })} />
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-sm text-gray-300">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded border border-gray-700 bg-card px-3 py-2 text-white"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-sm text-gray-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="min-h-24 w-full rounded border border-gray-700 bg-transparent px-3 py-2 text-white"
                />
              </div>

              {formError && <div className="mb-3 text-xs text-red-400">{formError}</div>}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded border border-gray-700 bg-card px-3 py-2">Cancel</button>
                <button type="submit" disabled={saveMutation.isLoading} className="rounded bg-primary px-3 py-2 text-black disabled:opacity-50">
                  {saveMutation.isLoading ? "Saving..." : editingExpenseId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {deleteExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-lg bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">Delete Expense</h3>
              <p className="mb-4 text-sm text-gray-300">Are you sure you want to delete <strong>{deleteExpense.title}</strong>?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteExpense(null)} className="rounded border border-gray-700 bg-card px-3 py-2">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteExpense.id)} disabled={deleteMutation.isLoading} className="rounded bg-red-600 px-3 py-2 text-white disabled:opacity-50">
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

function ExpenseInput({ type = "text", label, value, onChange }) {
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
