import {
  BadgeCheck,
  BanknoteArrowDown,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Settings,
  UserCog,
  UserPlus,
  Users,
  Dumbbell,
  Cog,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Sidebar({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith("/settings"));

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

  const renderMenuItem = (item, index) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <li
        key={`${item.path}-${index}`}
        onClick={() => navigate(item.path)}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${collapsed ? 'justify-center' : ''} ${isActive ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'text-gray-300 hover:bg-gray-800 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:text-white'}`}
      >
        <Icon size={20} />
        <span className={`${collapsed ? 'hidden' : 'inline'}`}>{item.name}</span>
      </li>
    );
  };

  return (
    <div className="w-full bg-card min-h-screen p-4 border-r border-gray-800">

      {/* Logo */}
      <h2 className={`text-xl font-bold mb-8 text-primary transition-all duration-200 ease-in-out ${collapsed ? 'opacity-0 -translate-y-1 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        Gym SaaS
      </h2>

      {/* Menu */}
      <ul className="space-y-2">
        {menu.map(renderMenuItem)}
      </ul>

      <div className="my-6 h-px bg-gray-800" />

      <button
        type="button"
        onClick={() => setSettingsOpen(prev => !prev)}
        className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-300 ${collapsed ? "justify-center" : ""} ${settingsOpen ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
      >
        <Settings size={20} />
        <span className={`${collapsed ? "hidden" : "inline"}`}>Settings</span>
        {!collapsed && <ChevronDown size={16} className={`ml-auto transition ${settingsOpen ? "rotate-180" : ""}`} />}
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
                  isActive ? "bg-primary/15 text-primary" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
