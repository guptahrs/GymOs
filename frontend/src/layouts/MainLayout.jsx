import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-dark text-white">

      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-card">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full p-6">
        {children}
      </div>

    </div>
  );
}