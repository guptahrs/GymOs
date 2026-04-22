import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const name = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "";

  function handleLogout() {
    logout();
    localStorage.removeItem("user");
    localStorage.removeItem("gym_id");
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((s) => !s)} className="flex items-center gap-2 px-3 py-1 rounded-full bg-card hover:bg-gray-800 transition">
        <div className="w-6 h-6 rounded-full bg-gray-700 text-xs text-white flex items-center justify-center">{(user?.first_name || "")[0] || "U"}</div>
        <span className="hidden sm:inline text-sm">{name || "User"}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-gray-700 rounded-lg shadow-lg p-2 z-50">
          <div className="text-sm text-gray-300 px-3 py-2">{name || "User"}</div>
          <div className="border-t border-gray-700" />
          <button onClick={() => { setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800">Profile</button>
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800">Logout</button>
        </div>
      )}
    </div>
  );
}
