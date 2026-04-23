import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  ChevronRight,
  Dumbbell,
  Bell,
  Plus,
  SlidersHorizontal,
  Trash2,
  UserCog,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import API from "../api/client";
import MainLayout from "../layouts/MainLayout";
import { showSnackbar } from "../utils/snackbarService";

const sectionDetails = {
  training: {
    breadcrumb: "Training Type Setting",
    title: "Training Type Setting",
    cards: [],
  },
  general: {
    breadcrumb: "General Setting",
    title: "General Setting",
    cards: [
      {
        title: "Workspace Preferences",
        icon: SlidersHorizontal,
        text: "Gym defaults, billing labels, branch settings, and trainer service behavior.",
      },
    ],
  },
  account: {
    breadcrumb: "Account",
    title: "Account",
    cards: [
      {
        title: "Account Controls",
        icon: UserCog,
        text: "Owner profile, login security, and staff permissions.",
      },
    ],
  },
  notifications: {
    breadcrumb: "Notifications",
    title: "Notifications",
    cards: [
      {
        title: "Notification Rules",
        icon: Bell,
        text: "Member reminders, trainer alerts, payment nudges, and daily gym summaries.",
      },
    ],
  },
};

function Toggle({ enabled, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition ${enabled ? "bg-primary" : "bg-gray-700"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

export default function Settings() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const sectionFromPath = location.pathname.includes("account")
    ? "account"
    : location.pathname.includes("notifications")
      ? "notifications"
      : location.pathname.includes("general")
        ? "general"
      : "training";
  const [activeSection, setActiveSection] = useState(sectionFromPath);
  const currentSection = sectionDetails[activeSection];
  const [form, setForm] = useState({
    name: "",
    shift: "BOTH",
    capacity: 10,
    price: "",
  });

  const { data: trainingTypes = [], isLoading: isTrainingTypesLoading } = useQuery({
    queryKey: ["training-types"],
    queryFn: async () => {
      const response = await API.get("/staff/training-types/");
      return response.data.data || [];
    },
    enabled: activeSection === "training",
  });

  const createTrainingTypeMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await API.post("/staff/training-types/", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-types"] });
      showSnackbar("Training type created", "success");
      setForm({ name: "", shift: "BOTH", capacity: 10, price: "" });
    },
  });

  const toggleTrainingTypeMutation = useMutation({
    mutationFn: async ({ id, is_active }) => {
      const response = await API.patch(`/staff/training-types/${id}/`, { is_active });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-types"] });
      showSnackbar("Training type updated", "success");
    },
  });

  const deleteTrainingTypeMutation = useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/staff/training-types/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-types"] });
      showSnackbar("Training type deleted", "success");
    },
  });

  const addTrainingType = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const gym_id = localStorage.getItem("gym_id");

    if (!name) return;

    createTrainingTypeMutation.mutate({
      name,
      gym_id,
      shift: form.shift,
      capacity: Number(form.capacity) || 1,
      price: Number(form.price) || 0,
    });
  };

  const toggleTrainingType = (trainingType) => {
    toggleTrainingTypeMutation.mutate({
      id: trainingType.id,
      is_active: !trainingType.is_active,
    });
  };

  const removeTrainingType = (id) => {
    deleteTrainingTypeMutation.mutate(id);
  };

  useEffect(() => {
    setActiveSection(sectionFromPath);
  }, [sectionFromPath]);

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-96px)] min-w-0 overflow-hidden rounded-2xl border border-gray-800 bg-[#080d18] shadow-2xl shadow-black/30">
        <div className="border-b border-gray-800 bg-gradient-to-r from-[#101828] via-[#0b1220] to-[#111827] px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                <span>Settings</span>
                <ChevronRight size={16} />
                <span className="text-white">{currentSection.breadcrumb}</span>
              </div>
              {/* <h1 className="m-0 text-3xl font-semibold text-white">{currentSection.title}</h1> */}
            </div>

            <div className="grid shrink-0 grid-cols-3 gap-3">
              {/* {[
                { label: "Types", value: trainingTypes.length },
                { label: "Active", value: trainingTypes.filter((type) => type.active).length },
                { label: "Shifts", value: "3" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.04] px-1 py-2 text-center">
                  <div className="text-xl font-semibold text-white">{item.value}</div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">{item.label}</div>
                </div>
              ))} */}
            </div>
          </div>
        </div>

        <div className="min-h-[680px] min-w-0">
          <main className="min-w-0 p-5 lg:p-8">
            {activeSection === "training" && (
              <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <section className="min-w-0 space-y-5">
                  <div className="rounded-xl border border-gray-800 bg-card p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="m-0 text-xl font-semibold text-white">Training Type Settings</h2>
                        <p className="text-sm text-gray-400">Manage trainer services, timing, capacity, and availability.</p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-800">
                      <table className="w-full table-fixed text-left text-sm">
                        <thead className="bg-[#0b1220] text-xs uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="w-[38%] px-4 py-3">Training Type</th>
                            <th className="w-[17%] px-4 py-3">Timing</th>
                            <th className="w-[17%] px-4 py-3">Capacity</th>
                            <th className="w-[14%] px-4 py-3">Active</th>
                            <th className="w-[14%] px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 bg-[#0f172a]/70">
                          {trainingTypes.map((type) => (
                            <tr key={type.id} className="text-gray-300">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                    <Dumbbell size={18} />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-white">{type.name}</div>
                                    <div className="text-xs text-gray-500">Trainer assignment ready</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                                  {type.shift.charAt(0) + type.shift.slice(1).toLowerCase()}
                                </span>
                              </td>
                              <td className="px-4 py-4">{type.capacity} members</td>
                              <td className="px-4 py-4">
                                <Toggle
                                  enabled={type.is_active}
                                  label={`Toggle ${type.name}`}
                                  onClick={() => toggleTrainingType(type)}
                                />
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button
                                  type="button"
                                  aria-label={`Delete ${type.name}`}
                                  onClick={() => removeTrainingType(type.id)}
                                  className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {!isTrainingTypesLoading && trainingTypes.length === 0 && (
                            <tr>
                              <td colSpan="5" className="px-4 py-10 text-center text-sm text-gray-500">
                                No training types added yet.
                              </td>
                            </tr>
                          )}
                          {isTrainingTypesLoading && (
                            <tr>
                              <td colSpan="5" className="px-4 py-10 text-center text-sm text-gray-500">
                                Loading training types...
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <aside className="min-w-0 space-y-5">
                  <form onSubmit={addTrainingType} className="rounded-xl border border-gray-800 bg-card p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                        <Plus size={18} />
                      </div>
                      <div>
                        <h2 className="m-0 text-lg font-semibold text-white">Add Type</h2>
                        <p className="text-sm text-gray-400">Create a new trainer service.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block">
                        <span className="mb-1 block text-sm text-gray-300">Name</span>
                        <input
                          value={form.name}
                          onChange={(event) => setForm({ ...form, name: event.target.value })}
                          className="input"
                          placeholder="Crossfit Batch"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-sm text-gray-300">Timing</span>
                        <select
                          value={form.shift}
                          onChange={(event) => setForm({ ...form, shift: event.target.value })}
                          className="input"
                        >
                          <option value="MORNING">Morning</option>
                          <option value="EVENING">Evening</option>
                          <option value="BOTH">Both</option>
                        </select>
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="mb-1 block text-sm text-gray-300">Capacity</span>
                          <input
                            type="number"
                            min="1"
                            value={form.capacity}
                            onChange={(event) => setForm({ ...form, capacity: event.target.value })}
                            className="input"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-sm text-gray-300">Price</span>
                          <input
                            type="number"
                            min="0"
                            value={form.price}
                            onChange={(event) => setForm({ ...form, price: event.target.value })}
                            className="input"
                            placeholder="999"
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={createTrainingTypeMutation.isPending}
                        className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Plus size={16} />
                        {createTrainingTypeMutation.isPending ? "Adding..." : "Add Training Type"}
                      </button>
                    </div>
                  </form>

                  <div className="rounded-xl border border-gray-800 bg-card p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
                        <CalendarClock size={18} />
                      </div>
                      <div>
                        <h2 className="m-0 text-lg font-semibold text-white">Default Timing</h2>
                        <p className="text-sm text-gray-400">Applies to new trainer profiles.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["Morning", "Evening", "Both"].map((shift) => (
                        <button
                          key={shift}
                          type="button"
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            shift === "Both"
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-gray-800 bg-[#0b1220] text-gray-400"
                          }`}
                        >
                          {shift}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {activeSection !== "training" && (
              <div className="grid gap-5 lg:grid-cols-2">
                {currentSection.cards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-xl border border-gray-800 bg-card p-6">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Icon size={20} />
                      </div>
                      <h2 className="m-0 text-xl font-semibold text-white">{item.title}</h2>
                      <p className="mt-2 text-sm text-gray-400">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
