import { CalendarDays, CreditCard, Mail, Phone } from "lucide-react";
import InfoCard from "./InfoCard";

export default function MemberDetailsCard({ member, trigger }) {
  const initials = `${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`.toUpperCase();

  return (
    <InfoCard
      trigger={trigger}
      title={member.name}
      subtitle={member.current_plan_name || "Member"}
      avatar={initials || "M"}
      avatarColor="bg-primary/20 text-primary border-primary/30"
      rows={[
        { icon: <Mail size={11} />, label: "Email", value: member.email || "Not provided" },
        { icon: <Phone size={11} />, label: "Phone", value: member.phone || "Not provided" },
        { icon: <CreditCard size={11} />, label: "Remaining", value: formatAmount(member.remaining_amount) },
        { icon: <CalendarDays size={11} />, label: "Valid till", value: formatDate(member.plan_valid_till) },
        { icon: <CalendarDays size={11} />, label: "Estimated due date", value: formatDate(member.estimated_due_date) },
      ]}
    />
  );
}

function formatAmount(amount) {
  if (amount === null || amount === undefined || amount === "") {
    return "No due";
  }

  return `Rs ${amount}`;
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
