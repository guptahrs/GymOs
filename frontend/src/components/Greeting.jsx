// import { useEffect, useState } from "react";

// export default function Greeting() {
//   const [user, setUser] = useState(null);
//   const [timePhrase, setTimePhrase] = useState("");

//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem("user");
//       if (raw) setUser(JSON.parse(raw));
//     } catch (e) {
//       // ignore
//     }

//     const hour = new Date().getHours();
//     if (hour >= 5 && hour < 12) setTimePhrase("Good Morning");
//     else if (hour >= 12 && hour < 17) setTimePhrase("Good Afternoon");
//     else setTimePhrase("Good Evening");
//   }, []);

//   const first = user?.first_name || "";
//   const last = user?.last_name || "";
//   const name = `${first} ${last}`.trim();

//   return (
//     <div className="mb-6">
//       <div className="text-sm text-gray-400">Welcome{name ? "," : ","} <span className="sr-only">to your dashboard</span></div>
//       <div className="flex items-baseline gap-4">
//         <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight transition-all duration-300">
//           {name || ""}
//         </h1>
//         <span className="text-sm text-gray-400">{timePhrase}</span>
//       </div>
//       <p className="mt-2 text-sm text-gray-400 max-w-xl">Here's a quick overview of your gym — revenue, members, and upcoming actions.</p>
//     </div>
//   );
// }



import { useEffect, useState } from "react";

export default function Greeting() {
  const [user, setUser] = useState(null);
  const [timePhrase, setTimePhrase] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimePhrase("Morning");
    else if (hour < 17) setTimePhrase("Afternoon");
    else setTimePhrase("Evening");
  }, []);

  const first = user?.first_name || "";

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        
        {/* LEFT */}
        <div>
          {/* <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1> */}
          <p className="text-sm text-gray-400">
            Good {timePhrase}, {first} 👋
          </p>
        </div>

        {/* RIGHT (Primary Action) */}
        {/* <button className="h-9 px-4 rounded-lg bg-[#2ee6a8] text-black text-sm font-medium hover:opacity-90 transition">
          + Add Member
        </button> */}
        {/* OPTIONAL: Quick Stats Row */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>💰 Revenue: ₹25,000</span>
          <span>👥 Members: 120</span>
          <span>⚠️ Expiring: 8</span>
        </div>
      </div>
    </div>
  );
}