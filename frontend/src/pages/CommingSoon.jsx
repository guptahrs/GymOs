import { useEffect, useState, useRef } from "react";

const LAUNCH_DATE = new Date("2026-05-29T00:00:00");

const FEATURES = [
  { icon: "🏋️", name: "Member Management", desc: "Full lifecycle — onboard, track, retain", badge: "Ready", badgeColor: "lime" },
  { icon: "📊", name: "Smart Dashboard",    desc: "Revenue, attendance & growth insights",  badge: "Ready", badgeColor: "lime" },
  { icon: "👥", name: "Staff & Roles",      desc: "Permissions, schedules & payroll",        badge: "Beta",  badgeColor: "amber" },
  { icon: "📲", name: "WhatsApp Alerts",    desc: "Automated renewals & reminders",          badge: "Soon",  badgeColor: "gray" },
];

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [ticked, setTicked]     = useState(null);

  useEffect(() => {
    const calc = () => {
      const diff = target - new Date();
      if (diff <= 0){
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000)  / 60000);
      const s = Math.floor((diff % 60000)    / 1000);
      setTimeLeft((prev) => {
        if (prev.s !== s) setTicked(s);
        return { d, h, m, s };
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  return { timeLeft, ticked };
}

function CountBlock({ value, label, flash }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-lg border border-[#1E1E1E] bg-[#141414] px-3 py-6 overflow-hidden transition-all duration-300"
      style={{ boxShadow: flash ? "0 0 0 1px #C8F53A22" : "none" }}
    >
      {/* top lime bar flashes on tick */}
      <span
        className="absolute top-0 left-0 right-0 h-[2px] bg-[#C8F53A] transition-transform duration-300 origin-left"
        style={{ transform: flash ? "scaleX(1)" : "scaleX(0)" }}
      />
      <span
        className="font-['Bebas_Neue'] text-5xl leading-none text-white tracking-wide"
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 text-[0.6rem] tracking-[0.18em] uppercase text-[#555]">
        {label}
      </span>
    </div>
  );
}

export default function ComingSoon() {
  const { timeLeft, ticked } = useCountdown(LAUNCH_DATE);
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const progressRef = useRef(null);

  // animate progress bar on mount
  useEffect(() => {
    const t = setTimeout(() => setProgressVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleNotify = () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError(true);
      setTimeout(() => setError(false), 1000);
      return;
    }
    // TODO: POST to your backend or email service
    setSubmitted(true);
  };

  const badgeStyle = {
    lime:  "bg-[#C8F53A14] text-[#C8F53A] border border-[#C8F53A33]",
    amber: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    gray:  "bg-white/5 text-gray-500 border border-white/10",
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#F5F5F0] font-sans overflow-hidden">

      {/* ── Glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute rounded-full"
          style={{
            width: 600, height: 600,
            top: -200, right: -100,
            background: "radial-gradient(circle, rgba(200,245,58,0.18) 0%, transparent 70%)",
            filter: "blur(120px)",
            animation: "pulse 6s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400, height: 400,
            bottom: -100, left: -100,
            background: "radial-gradient(circle, rgba(200,245,58,0.08) 0%, transparent 70%)",
            filter: "blur(120px)",
            animation: "pulse 6s ease-in-out infinite alternate",
            animationDelay: "-3s",
          }}
        />
      </div>

      {/* ── Grid layout ── */}
      <div className="relative z-10 grid min-h-screen md:grid-cols-2">

        {/* ══ LEFT ══ */}
        <div className="flex flex-col justify-between border-r border-[#1E1E1E] px-8 py-12 md:px-14">

          {/* Logo */}
          <div
            className="font-['Bebas_Neue'] text-[2rem] tracking-widest"
            style={{ color: "#C8F53A" }}
          >
            GYM<span className="text-white">ORA</span>
          </div>

          {/* Hero text */}
          <div className="flex flex-col py-14">
            <span
              className="mb-7 flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.25em]"
              style={{ color: "#C8F53A",
                animation: "fadeUp 0.8s 0.2s both" }}
            >
              <span className="h-px w-6 bg-[#C8F53A]" />
              Something big is coming
            </span>

            <h1
              className="font-['Bebas_Neue'] leading-[0.9] tracking-wide"
              style={{
                fontSize: "clamp(5rem, 10vw, 9rem)",
                animation: "fadeUp 0.8s 0.4s both",
              }}
            >
              TRAIN<br />
              <span style={{ color: "#C8F53A" }}>SMARTER.</span><br />
              GROW<br />
              FASTER.
            </h1>

            <p
              className="mt-8 max-w-sm text-base font-light leading-relaxed text-[#555]"
              style={{ animation: "fadeUp 0.8s 0.6s both" }}
            >
              The{" "}
              <strong className="font-normal text-white">
                all-in-one gym management platform
              </strong>{" "}
              built for modern fitness businesses. Members, staff, leads,
              subscriptions — all in one place.
            </p>
          </div>

          {/* Email form */}
          <div style={{ animation: "fadeUp 0.8s 0.8s both" }}>
            {!submitted ? (
              <>
                <span className="mb-3 block text-[0.72rem] uppercase tracking-[0.15em] text-[#555]">
                  Get early access
                </span>
                <div
                  className="flex overflow-hidden rounded-lg border transition-colors duration-300"
                  style={{
                    borderColor: error ? "#ef4444" : "#2A2A2A",
                  }}
                  onFocus={() => {}}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNotify()}
                    placeholder="your@email.com"
                    className="flex-1 bg-[#141414] px-5 py-3.5 text-sm text-white outline-none placeholder:text-[#444]"
                  />
                  <button
                    onClick={handleNotify}
                    className="font-['Bebas_Neue'] px-5 text-base tracking-widest text-[#0A0A0A] transition-colors"
                    style={{ background: "#C8F53A" }}
                    onMouseEnter={(e) => (e.target.style.background = "#d4ff3d")}
                    onMouseLeave={(e) => (e.target.style.background = "#C8F53A")}
                  >
                    Notify Me
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 py-3 text-sm" style={{ color: "#C8F53A" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#C8F53A" strokeWidth="1.5"/>
                  <path d="M5 8l2 2 4-4" stroke="#C8F53A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                You're on the list! We'll notify you at launch.
              </div>
            )}

            {/* Bottom row */}
            <p className="text-xs text-[#555] leading-relaxed mt-6 max-w-xs">
                {/* Built from scratch with passion by the founder.<br/> */}
                Want early access or partnership? Let’s connect on harsh.gupta@gymora.co.in / support@gymora.co.in
            </p>
            <div className="mt-7 flex items-center justify-between">
              <div className="flex gap-3">
                {[
                { label: "IG", href: "https://instagram.com" },
                { label: "TW", href: "https://twitter.com" },
                { label: "IN", href: "https://linkedin.com" },
                ].map((s) => (
                    <a key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#222] text-xs text-[#555] transition-colors hover:border-[#C8F53A] hover:text-[#C8F53A]"
                >
                    {s.label}
                </a>
                ))}
              </div>
              <span className="text-[0.7rem] uppercase tracking-[0.15em] text-[#2A2A2A]">
                gymora.co.in
              </span>
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div
          className="relative flex flex-col justify-between overflow-hidden bg-[#111111] px-8 py-12 md:px-14"
        >
          {/* Corner deco */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-bl-[200px] border border-[#1E1E1E] opacity-50"
          />

          {/* Countdown */}
          <div style={{ animation: "fadeUp 0.8s 0.5s both" }}>
            <p className="mb-8 text-[0.68rem] uppercase tracking-[0.2em] text-[#555]">
              Launching in
            </p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: timeLeft.d, label: "Days",    flash: ticked !== null },
                { value: timeLeft.h, label: "Hours",   flash: ticked !== null },
                { value: timeLeft.m, label: "Mins",    flash: ticked !== null },
                { value: timeLeft.s, label: "Secs",    flash: true },
              ].map((c) => (
                <CountBlock key={c.label} value={c.value} label={c.label} flash={c.flash} />
              ))}
            </div>
          </div>

          {/* Features */}
          <div
            className="flex flex-col py-8"
            style={{ animation: "fadeUp 0.8s 0.9s both" }}
          >
            <p className="mb-5 text-[0.68rem] uppercase tracking-[0.2em] text-[#555]">
              What's coming
            </p>
            <div className="flex flex-col gap-2.5">
              {FEATURES.map((f) => (
                <div
                  key={f.name}
                  className="group flex cursor-default items-center gap-4 rounded-lg border border-[#1E1E1E] bg-[#141414] px-4 py-3.5 transition-all duration-250 hover:translate-x-1 hover:border-[#2E2E2E]"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#C8F53A1A] text-base">
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{f.name}</p>
                    <p className="mt-0.5 text-[0.72rem] text-[#555]">{f.desc}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded px-2 py-0.5 text-[0.6rem] uppercase tracking-widest ${badgeStyle[f.badgeColor]}`}
                  >
                    {f.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ animation: "fadeUp 0.8s 1.1s both" }}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[0.68rem] uppercase tracking-[0.15em] text-[#555]">
                Development progress
              </span>
              <span className="font-['Bebas_Neue'] text-base" style={{ color: "#C8F53A" }}>
                78%
              </span>
            </div>
            <div className="h-[3px] overflow-hidden rounded-full bg-[#1E1E1E]">
              <div
                className="h-full rounded-full transition-all duration-[2000ms] ease-out"
                style={{
                  width: progressVisible ? "78%" : "0%",
                  background: "#C8F53A",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Keyframes injected globally ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          from { transform: scale(1);    opacity: 0.8; }
          to   { transform: scale(1.15); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}