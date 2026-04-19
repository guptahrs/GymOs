import React from "react";

export default function FloatingDatePicker({ label, value, onChange, error }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={onChange}
        placeholder=" "
        className={`peer w-full px-4 py-2 rounded-lg bg-card border ${error ? "border-red-500" : "border-gray-700"} text-white outline-none focus:ring-1 focus:ring-primary`}
      />
      <label className="absolute left-3 top-2 text-gray-400 text-sm transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs">
        {label}
      </label>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
