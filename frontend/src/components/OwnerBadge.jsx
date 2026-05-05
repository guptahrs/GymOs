import { Mail, Phone, User, Crown } from "lucide-react";
import InfoCard from "./InfoCard";

export default function OwnerBadge({ owner }) {
  const initials = `${owner.first_name?.[0] || ""}${owner.last_name?.[0] || ""}`.toUpperCase();

  return (
    <InfoCard
      trigger={
        <span className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-violet-500/20 text-violet-400 border-violet-500/30 hover:scale-105 transition-transform">
          <Crown size={10} />
          {owner.name}
        </span>
      }
      title={owner.name}
      subtitle="Gym Owner"
      avatar={initials}
      avatarColor="bg-violet-500/20 text-violet-400 border-violet-500/30"
      rows={[
        { icon: <Mail size={11} />, label: "Email", value: owner.email },
        { icon: <Phone size={11} />, label: "Phone", value: owner.phone || "Not provided" },
        { icon: <User size={11} />, label: "ID", value: owner.user_id },
      ]}
      footer={
        <a href={`mailto:${owner.email}`} className="text-[0.7rem] font-medium" style={{ color: "#C8F53A" }}>
          Send email →
        </a>
      }
    />
  );
}