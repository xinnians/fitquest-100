import { getNotificationPreferences } from "@/lib/notification-actions";
import { NotificationSettingsClient } from "./notifications-client";

export default async function NotificationSettingsPage() {
  const prefs = await getNotificationPreferences();

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <h1 className="font-heading text-3xl font-extrabold">通知設定</h1>
      <p className="mt-1 text-sm text-muted">管理你的通知偏好</p>
      <NotificationSettingsClient prefs={prefs} />
    </main>
  );
}
