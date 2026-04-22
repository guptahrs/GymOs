import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";

export default function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <ProfileMenu />
    </div>
  );
}
