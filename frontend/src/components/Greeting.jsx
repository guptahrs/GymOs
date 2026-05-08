import { useEffect, useState } from "react";

export default function Greeting() {
  const [user, setUser] = useState(null);
  const [timePhrase, setTimePhrase] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore malformed local user
    }

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimePhrase("Morning");
    else if (hour < 17) setTimePhrase("Afternoon");
    else setTimePhrase("Evening");
  }, []);

  const first = user?.first_name || "";

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="theme-muted text-sm">
            Good {timePhrase}, {first} <span aria-hidden="true">👋</span>
          </p>
        </div>
      </div>
    </div>
  );
}
