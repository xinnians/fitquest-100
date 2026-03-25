import { BottomNav } from "@/components/ui/bottom-nav";
import { NotificationBell } from "@/components/features/notification-bell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      <div className="fixed right-4 top-4 z-30">
        <NotificationBell />
      </div>
      {children}
      <BottomNav />
    </div>
  );
}
