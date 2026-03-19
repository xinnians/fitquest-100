import { getProfile, getWeightHistory } from "@/lib/profile-actions";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const [profile, weightHistory] = await Promise.all([
    getProfile(),
    getWeightHistory(),
  ]);

  if (!profile) {
    return (
      <main className="mx-auto max-w-md px-4 pt-8">
        <p className="text-muted">無法載入個人資料。</p>
      </main>
    );
  }

  return <ProfileClient profile={profile} weightHistory={weightHistory} />;
}
