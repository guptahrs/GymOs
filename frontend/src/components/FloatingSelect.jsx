import React from "react";

export default function FloatingSelect({ label, value, onChange, error, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`peer w-full px-4 py-2 rounded-lg bg-card border ${error ? "border-red-500" : "border-gray-700"} text-white outline-none focus:ring-1 focus:ring-primary`}
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label className="absolute left-3 top-2 text-gray-400 text-sm transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs">
        {label}
      </label>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
