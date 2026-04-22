import { LayoutDashboard, Users, Building2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SuperAdminSidebar({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/super-admin", icon: LayoutDashboard },
    { name: "Tenants", path: "/super-admin/gyms", icon: Building2 },
  ];

  return (
    <div className="w-full bg-card min-h-screen p-4 border-r border-gray-800">
      <h2 className={`text-xl font-bold mb-8 text-primary transition-all duration-200 ease-in-out ${collapsed ? 'opacity-0 -translate-y-1 pointer-events-none' : 'opacity-100 translate-y-0'}`}>Super Admin</h2>
      <ul className="space-y-2">
        {menu.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <li
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${collapsed ? 'justify-center' : ''} ${isActive ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'text-gray-300 hover:bg-gray-800 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:text-white'}`}
            >
              <Icon size={20} />
              <span className={`${collapsed ? 'hidden' : 'inline'}`}>{item.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
