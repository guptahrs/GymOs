import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

export default function Snackbar({ message, type, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log("Snackbar:", message, type);
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // wait for animation
      }, 4000); // ⏱️ increased time

      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message) return null;

  const config = {
    success: {
      icon: CheckCircle,
      color: "text-green-400",
      glow: "shadow-[0_0_15px_rgba(34,197,94,0.4)]",
    },
    error: {
      icon: XCircle,
      color: "text-red-400",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]",
    },
    info: {
      icon: Info,
      color: "text-blue-400",
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    },
  };

  const { icon: Icon, color, glow } = config[type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300
      ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-gray-700 backdrop-blur-md
        ${glow}`}
      >
        <Icon className={`${color}`} size={20} />
        <span className="text-sm text-white">{message}</span>
      </div>
    </div>
  );
}