import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button aria-label="Notifications" onClick={() => setOpen((s) => !s)} className="p-2 rounded-md hover:bg-gray-800 transition">
        <Bell size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-card border border-gray-700 rounded-lg shadow-lg p-4 z-50">
          <div className="text-sm text-gray-400">No notifications</div>
        </div>
      )}
    </div>
  );
}
