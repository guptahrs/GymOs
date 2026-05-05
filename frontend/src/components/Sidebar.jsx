import {
  BadgeCheck,
  BanknoteArrowDown,
  Bell,
  ChevronDown,
  Cog,
  Dumbbell,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import API from "../api/client";
import PricingModal from "../components/PricingModal";
import { useSubscriptionAccess } from "../hooks/useSubscriptionAccess";

const defaultSubscription = {
  access_status: "no_plan",
  is_read_only: true,
  days_left: 0,
  plan_name: null,
  trial_days: null,
  duration_days: null,
};

function PlanCard({ subscription = defaultSubscription, onOpenPricing }) {
  const isTrial = subscription.access_status === "trial";
  const hasPaidPlan = subscription.access_status === "active";
  const isReadOnly = subscription.is_read_only;

  if (hasPaidPlan) {
    return (
      <div className="mt-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black p-[1px] shadow-[0_18px_48px_rgba(15,23,42,0.45)]">
        <div className="rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_40%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.96))] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full border border-blue-400/25 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
              Current Plan
            </span>
            <span className="text-xs text-slate-400">{subscription.days_left} days left</span>
          </div>
          <h3 className="text-lg font-semibold text-white">{subscription.plan_name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            Keep your team moving with uninterrupted access.
          </p>
          {subscription.days_left <= 7 && (
            <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200">
              Your plan is expiring soon. Renew early to avoid read-only mode.
            </div>
          )}
          <button
            onClick={onOpenPricing}
            className="mt-4 w-full rounded-2xl bg-white py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            Change Plan
          </button>
        </div>
      </div>
    );
  }

  if (isTrial) {
    return (
      <div className="mt-4 rounded-3xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 p-[1px] shadow-[0_18px_50px_rgba(244,114,182,0.35)]">
        <div className="rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.32),_transparent_35%),linear-gradient(180deg,_rgba(30,27,75,0.98),_rgba(17,24,39,0.98))] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-100">
              <Sparkles size={12} />
              Trial Active
            </span>
            <span className="text-xs font-medium text-orange-200">{subscription.days_left} days left</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Your gym is in trial mode</h3>
          <p className="mt-1 text-sm text-slate-300">
            Explore everything now, then switch to a paid plan before the trial ends.
          </p>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
            Trial length: {subscription.trial_days || subscription.duration_days || "-"} days
          </div>
          <button
            onClick={onOpenPricing}
            className="mt-4 w-full rounded-2xl bg-white py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            Choose Paid Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-3xl bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-500 p-[1px] shadow-[0_20px_60px_rgba(34,211,238,0.25)]">
      <div className="rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.35),_transparent_34%),linear-gradient(180deg,_rgba(5,10,20,0.98),_rgba(12,18,33,0.98))] p-4">
        <div className="mb-3 inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
          {isReadOnly ? "Read Only" : "No Plan"}
        </div>
        <h3 className="text-lg font-semibold text-white">
          {subscription.access_status === "trial_expired"
            ? "Your trial has ended"
            : subscription.access_status === "expired"
              ? "Your subscription has ended"
              : "Activate your first plan"}
        </h3>
        <p className="mt-1 text-sm text-slate-300">
          {isReadOnly
            ? "You can still review dashboards, but new data changes are locked until a plan is active."
            : "Unlock member management, renewals, and daily operations with a paid plan."}
        </p>
        <button
          onClick={onOpenPricing}
          className="mt-4 w-full rounded-2xl bg-white py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          Buy a Plan
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [pricingOpen, setPricingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith("/settings")
  );

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", path: "/leads", icon: UserPlus },
    { name: "Members", path: "/members", icon: Users },
    { name: "Membership Plans", path: "/plans", icon: BadgeCheck },
    { name: "Staff", path: "/staff", icon: UserCog },
    { name: "Trainer", path: "/trainer", icon: Dumbbell },
    { name: "Expenses", path: "/expenses", icon: BanknoteArrowDown },
  ];

  const settingsMenu = [
    { name: "Training Type", path: "/settings", icon: Dumbbell },
    { name: "General", path: "/settings/general", icon: Cog },
    { name: "Account", path: "/settings/account", icon: UserCog },
    { name: "Notifications", path: "/settings/notifications", icon: Bell },
  ];

  const { data: gymData } = useQuery(
    ["gym_detail"],
    async () => {
      const gymId = localStorage.getItem("gym_id");
      const res = await API.get(`/gyms/detail/${gymId}/`);
      return res.data.data;
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: subscription = defaultSubscription } = useSubscriptionAccess();

  const renderMenuItem = (item, index) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <li
        key={`${item.path}-${index}`}
        onClick={() => navigate(item.path)}
        className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
          collapsed ? "justify-center" : ""
        } ${
          isActive
            ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]"
            : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
        }`}
      >
        <Icon size={20} />
        <span className={collapsed ? "hidden" : "inline"}>{item.name}</span>
      </li>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col border-r border-gray-800 bg-card p-4">
      <h2
        className={`mb-8 text-xl font-bold text-primary transition-all duration-200 ${
          collapsed
            ? "pointer-events-none -translate-y-1 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        {gymData?.name || "Gym SaaS"}
      </h2>

      <ul className="space-y-2">{menu.map(renderMenuItem)}</ul>

      <div className="my-6 h-px bg-gray-800" />

      <button
        type="button"
        onClick={() => setSettingsOpen((prev) => !prev)}
        className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-300 ${
          collapsed ? "justify-center" : ""
        } ${
          settingsOpen
            ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Settings size={20} />
        <span className={collapsed ? "hidden" : "inline"}>Settings</span>
        {!collapsed && (
          <ChevronDown
            size={16}
            className={`ml-auto transition ${settingsOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {settingsOpen && !collapsed && (
        <ul className="mt-2 space-y-1 border-l border-gray-800 pl-4">
          {settingsMenu.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li
                key={`${item.path}-${index}`}
                onClick={() => navigate(item.path)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-auto" />

      {!collapsed && (
        <PlanCard
          subscription={subscription}
          onOpenPricing={() => setPricingOpen(true)}
        />
      )}

      <PricingModal
        isOpen={pricingOpen}
        onClose={() => setPricingOpen(false)}
        currentPlan={subscription?.plan_name}
      />
    </div>
  );
}
