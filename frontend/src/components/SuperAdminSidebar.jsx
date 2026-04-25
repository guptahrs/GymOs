import { LayoutDashboard, Building2, CreditCard, Tag, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SuperAdminSidebar({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard",     path: "/super-admin",               icon: LayoutDashboard },
    { name: "Gyms",          path: "/super-admin/gyms",          icon: Building2 },
    { name: "Plans",         path: "/super-admin/plans",         icon: CreditCard },
    { name: "Features",      path: "/super-admin/features",      icon: Tag },
    { name: "Subscriptions", path: "/super-admin/subscriptions", icon: ShieldCheck },
  ];

  return (
    <div className="w-full bg-card min-h-screen p-4 border-r border-gray-800">
      <h2
        className={`text-xl font-bold mb-8 text-primary transition-all duration-200 ease-in-out ${
          collapsed ? "opacity-0 -translate-y-1 pointer-events-none" : "opacity-100 translate-y-0"
        }`}
      >
        Super Admin
      </h2>
      <ul className="space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/super-admin"
              ? location.pathname === "/super-admin"
              : location.pathname.startsWith(item.path);
          return (
            <li
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300
                ${collapsed ? "justify-center" : ""}
                ${isActive
                  ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                  : "text-gray-300 hover:bg-gray-800 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:text-white"
                }`}
            >
              <Icon size={20} />
              <span className={`${collapsed ? "hidden" : "inline"} text-sm`}>{item.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
