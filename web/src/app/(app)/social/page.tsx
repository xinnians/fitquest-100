import { getMyFeed } from "@/lib/feed-actions";
import { getMyChallenges } from "@/lib/challenge-actions";
import { SocialClient } from "./social-client";

export default async function SocialPage() {
  const [feedResult, rawChallenges] = await Promise.all([
    getMyFeed(),
    getMyChallenges(),
  ]);

  const feed = feedResult && "data" in feedResult ? feedResult.data ?? [] : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const challenges = (rawChallenges as any[]).map((c) => ({
    id: c.id ?? "",
    name: c.name ?? "",
    member_count: c.member_count ?? 0,
    start_date: c.start_date ?? "",
    end_date: c.end_date ?? "",
  }));

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <SocialClient feed={feed} challenges={challenges} />
    </main>
  );
}
