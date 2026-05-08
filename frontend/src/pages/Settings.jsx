import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  ChevronRight,
  Dumbbell,
  Bell,
  Monitor,
  Moon,
  Palette,
  Plus,
  SlidersHorizontal,
  Sun,
  Trash2,
  UserCog,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import API from "../api/client";
import { useBranding } from "../context/BrandingContext";
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
      className={`relative h-6 w-11 rounded-full transition ${enabled ? "bg-primary" : "theme-surface border border-gray-700"}`}
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
  const gymId = localStorage.getItem("gym_id");
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
  const { branding: appliedBranding } = useBranding();
  const [brandingForm, setBrandingForm] = useState({
    brand_name: "",
    logo_url: "",
    favicon_url: "",
    primary_color: "#3B82F6",
    accent_color: "#0F172A",
    theme_mode: "dark",
  });

  const { data: trainingTypes = [], isLoading: isTrainingTypesLoading } = useQuery({
    queryKey: ["training-types"],
    queryFn: async () => {
      const response = await API.get("/staff/training-types/");
      return response.data.data || [];
    },
    enabled: activeSection === "training",
  });

  const { data: brandingSettings } = useQuery({
    queryKey: ["gym_branding", gymId],
    queryFn: async () => {
      const response = await API.get("/gyms/branding/");
      return response.data.data || null;
    },
    enabled: activeSection === "general" && Boolean(gymId),
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

  const updateBrandingMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await API.put("/gyms/branding/", payload);
      return response.data;
    },
    onSuccess: (result) => {
      const updatedBranding = result?.data || null;
      queryClient.setQueryData(["gym_branding", gymId], updatedBranding);
      queryClient.invalidateQueries({ queryKey: ["gym_branding", gymId] });
      showSnackbar("Branding updated", "success");
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

  useEffect(() => {
    if (!brandingSettings) {
      return;
    }

    setBrandingForm({
      brand_name: brandingSettings.brand_name || "",
      logo_url: brandingSettings.logo_url || "",
      favicon_url: brandingSettings.favicon_url || "",
      primary_color: brandingSettings.primary_color || "#3B82F6",
      accent_color: brandingSettings.accent_color || "#0F172A",
      theme_mode: brandingSettings.theme_mode || "dark",
    });
  }, [brandingSettings]);

  const saveBranding = (event) => {
    event.preventDefault();
    updateBrandingMutation.mutate(brandingForm);
  };

  const canCustomizeBranding = Boolean(brandingSettings?.can_customize);

  return (
    <MainLayout>
      <div className="theme-panel min-h-[calc(100vh-96px)] min-w-0 overflow-hidden rounded-2xl border shadow-2xl shadow-black/10">
        <div className="theme-surface border-b border-gray-800 px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="theme-muted mb-2 flex items-center gap-2 text-sm">
                <span>Settings</span>
                <ChevronRight size={16} />
                <span className="theme-text">{currentSection.breadcrumb}</span>
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
                  <div className="theme-panel rounded-xl border p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="theme-text m-0 text-xl font-semibold">Training Type Settings</h2>
                        <p className="theme-muted text-sm">Manage trainer services, timing, capacity, and availability.</p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-800">
                      <table className="w-full table-fixed text-left text-sm">
                        <thead className="theme-surface theme-muted text-xs uppercase tracking-wide">
                          <tr>
                            <th className="w-[38%] px-4 py-3">Training Type</th>
                            <th className="w-[17%] px-4 py-3">Timing</th>
                            <th className="w-[17%] px-4 py-3">Capacity</th>
                            <th className="w-[14%] px-4 py-3">Active</th>
                            <th className="w-[14%] px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="theme-panel theme-muted divide-y divide-gray-800">
                          {trainingTypes.map((type) => (
                            <tr key={type.id} className="theme-muted hover:bg-white/5">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                    <Dumbbell size={18} />
                                  </div>
                                  <div>
                                    <div className="theme-text font-semibold">{type.name}</div>
                                    <div className="theme-soft text-xs">Trainer assignment ready</div>
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
                              <td colSpan="5" className="theme-soft px-4 py-10 text-center text-sm">
                                No training types added yet.
                              </td>
                            </tr>
                          )}
                          {isTrainingTypesLoading && (
                            <tr>
                              <td colSpan="5" className="theme-soft px-4 py-10 text-center text-sm">
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
                  <form onSubmit={addTrainingType} className="theme-panel rounded-xl border p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                        <Plus size={18} />
                      </div>
                      <div>
                        <h2 className="theme-text m-0 text-lg font-semibold">Add Type</h2>
                        <p className="theme-muted text-sm">Create a new trainer service.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block">
                        <span className="theme-muted mb-1 block text-sm">Name</span>
                        <input
                          value={form.name}
                          onChange={(event) => setForm({ ...form, name: event.target.value })}
                          className="input"
                          placeholder="Crossfit Batch"
                        />
                      </label>

                      <label className="block">
                        <span className="theme-muted mb-1 block text-sm">Timing</span>
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
                          <span className="theme-muted mb-1 block text-sm">Capacity</span>
                          <input
                            type="number"
                            min="1"
                            value={form.capacity}
                            onChange={(event) => setForm({ ...form, capacity: event.target.value })}
                            className="input"
                          />
                        </label>

                        <label className="block">
                          <span className="theme-muted mb-1 block text-sm">Price</span>
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

                  <div className="theme-panel rounded-xl border p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
                        <CalendarClock size={18} />
                      </div>
                      <div>
                        <h2 className="theme-text m-0 text-lg font-semibold">Default Timing</h2>
                        <p className="theme-muted text-sm">Applies to new trainer profiles.</p>
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
                              : "theme-surface theme-muted border-gray-800"
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

            {activeSection === "general" && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <form onSubmit={saveBranding} className="theme-panel rounded-xl border p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Palette size={18} />
                    </div>
                    <div>
                      <h2 className="theme-text m-0 text-xl font-semibold">White Label Branding</h2>
                      <p className="theme-muted text-sm">
                        Customize your brand identity, icon, and light or dark experience.
                      </p>
                    </div>
                  </div>

                  {!canCustomizeBranding && (
                    <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                      White labeling is not included in your current plan. Upgrade to unlock branding and theme controls.
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="block">
                      <span className="theme-muted mb-1 block text-sm">Brand Name</span>
                      <input
                        value={brandingForm.brand_name}
                        onChange={(event) => setBrandingForm({ ...brandingForm, brand_name: event.target.value })}
                        className="input"
                        disabled={!canCustomizeBranding}
                        placeholder="Atlas Fitness"
                      />
                    </label>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <label className="block">
                        <span className="theme-muted mb-1 block text-sm">Logo URL</span>
                        <input
                          value={brandingForm.logo_url}
                          onChange={(event) => setBrandingForm({ ...brandingForm, logo_url: event.target.value })}
                          className="input"
                          disabled={!canCustomizeBranding}
                          placeholder="https://..."
                        />
                      </label>

                      <label className="block">
                        <span className="theme-muted mb-1 block text-sm">Favicon URL</span>
                        <input
                          value={brandingForm.favicon_url}
                          onChange={(event) => setBrandingForm({ ...brandingForm, favicon_url: event.target.value })}
                          className="input"
                          disabled={!canCustomizeBranding}
                          placeholder="https://..."
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <label className="block">
                        <span className="theme-muted mb-1 block text-sm">Primary Color</span>
                        <input
                          type="color"
                          value={brandingForm.primary_color}
                          onChange={(event) => setBrandingForm({ ...brandingForm, primary_color: event.target.value })}
                          className="theme-panel h-12 w-full rounded-lg border p-2"
                          disabled={!canCustomizeBranding}
                        />
                      </label>

                      <label className="block">
                        <span className="theme-muted mb-1 block text-sm">Accent / Card Color</span>
                        <input
                          type="color"
                          value={brandingForm.accent_color}
                          onChange={(event) => setBrandingForm({ ...brandingForm, accent_color: event.target.value })}
                          className="theme-panel h-12 w-full rounded-lg border p-2"
                          disabled={!canCustomizeBranding}
                        />
                      </label>
                    </div>

                    <div>
                      <span className="theme-muted mb-2 block text-sm">Theme Mode</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: "light", label: "Light", icon: Sun },
                          { key: "dark", label: "Dark", icon: Moon },
                          { key: "system", label: "System", icon: Monitor },
                        ].map((mode) => {
                          const Icon = mode.icon;
                          const active = brandingForm.theme_mode === mode.key;
                          return (
                            <button
                              key={mode.key}
                              type="button"
                              disabled={!canCustomizeBranding}
                              onClick={() => setBrandingForm({ ...brandingForm, theme_mode: mode.key })}
                              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm transition ${
                                active
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "theme-muted border-gray-700 hover:border-gray-500"
                              } ${!canCustomizeBranding ? "cursor-not-allowed opacity-50" : ""}`}
                            >
                              <Icon size={16} />
                              {mode.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!canCustomizeBranding || updateBrandingMutation.isPending}
                      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updateBrandingMutation.isPending ? "Saving..." : "Save Branding"}
                    </button>
                  </div>
                </form>

                <aside className="space-y-5">
                  <div className="theme-panel rounded-xl border p-5">
                    <h2 className="theme-text m-0 text-lg font-semibold">Live Preview</h2>
                    <p className="theme-muted mt-1 text-sm">This is how your workspace branding will feel.</p>

                    <div
                      className="mt-5 rounded-3xl border p-5"
                      style={{
                        borderColor: `${brandingForm.primary_color}33`,
                        background:
                          brandingForm.theme_mode === "light"
                            ? "linear-gradient(180deg, #ffffff, #f8fafc)"
                            : `linear-gradient(180deg, ${brandingForm.accent_color}, #020617)`,
                      }}
                    >
                      <div className="mb-4 flex items-center gap-3">
                        {brandingForm.logo_url ? (
                          <img src={brandingForm.logo_url} alt="Logo preview" className="h-12 w-12 rounded-xl object-cover" />
                        ) : (
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold text-white"
                            style={{ backgroundColor: brandingForm.primary_color }}
                          >
                            {(brandingForm.brand_name || appliedBranding.gym_name || "G").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold" style={{ color: brandingForm.theme_mode === "light" ? "#0f172a" : "#f8fafc" }}>
                            {brandingForm.brand_name || appliedBranding.gym_name || "Gym SaaS"}
                          </div>
                          <div style={{ color: brandingForm.theme_mode === "light" ? "#475569" : "#94a3b8" }} className="text-sm">
                            {brandingForm.theme_mode} mode workspace
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2].map((item) => (
                          <div
                            key={item}
                            className="rounded-2xl p-4"
                            style={{
                              backgroundColor: brandingForm.theme_mode === "light" ? "#e2e8f0" : "rgba(255,255,255,0.06)",
                            }}
                          >
                            <div className="text-xs uppercase tracking-wide" style={{ color: brandingForm.primary_color }}>
                              KPI
                            </div>
                            <div className="mt-2 text-xl font-semibold" style={{ color: brandingForm.theme_mode === "light" ? "#0f172a" : "#f8fafc" }}>
                              24
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {activeSection !== "training" && activeSection !== "general" && (
              <div className="grid gap-5 lg:grid-cols-2">
                {currentSection.cards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="theme-panel rounded-xl border p-6">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Icon size={20} />
                      </div>
                      <h2 className="theme-text m-0 text-xl font-semibold">{item.title}</h2>
                      <p className="theme-muted mt-2 text-sm">{item.text}</p>
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
