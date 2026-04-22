import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="
        flex items-center justify-center
        h-9 px-4
        rounded-full
        border border-[#2ee6a8]
        text-[#2ee6a8]
        text-sm font-medium
        transition-all duration-200

        hover:bg-[#2ee6a810]
        hover:scale-105
        hover:shadow-[0_0_0_2px_#2ee6a820]

        active:scale-95
          "
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}