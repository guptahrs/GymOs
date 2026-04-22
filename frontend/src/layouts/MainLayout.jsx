import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import HeaderActions from "../components/HeaderActions";
import TopHeader from "../components/TopHeader";

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark text-white">

      {/* Sidebar */}
      <div className={`${collapsed ? "w-20" : "w-64"} min-h-screen bg-card transition-all duration-300 relative`}>
        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((s) => !s)}
          className="absolute right-[-14px] top-4 bg-card border border-gray-700 rounded-full p-1 shadow-md hover:bg-gray-800"
        >
          <Menu size={18} />
        </button>
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full p-6">
        <TopHeader />
        {children}
      </div>

    </div>
  );
}