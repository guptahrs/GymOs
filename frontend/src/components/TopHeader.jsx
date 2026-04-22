import BackButton from "./BackButton";
import { useLocation } from "react-router-dom";
import HeaderActions from "./HeaderActions";

function humanizePath(path) {
  if (!path || path === "/") return "Dashboard";
  if (path === "/super-admin") return "Dashboard";
  if (path === "/plans") return "Membership Plans";
  const parts = path.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  // replace dashes with spaces and capitalize
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TopHeader({ title }) {
  const location = useLocation();
  const path = location.pathname;
  const showBack = !(path === "/" || path === "/super-admin");
  const derivedTitle = title || humanizePath(path);

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        {showBack && <BackButton />}
        <h2 className="text-lg font-semibold">{derivedTitle}</h2>
      </div>
      <HeaderActions />
    </div>
  );
}
