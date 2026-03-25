import { getMyFeed } from "@/lib/feed-actions";
import { getMyChallenges } from "@/lib/challenge-actions";
import { getCurrentBossBattle } from "@/lib/boss-battle-actions";
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

  // Fetch active boss for each challenge (in parallel)
  const bossResults = await Promise.all(
    challenges.map(async (c) => {
      try {
        const result = await getCurrentBossBattle(c.id);
        if ("data" in result && result.data) {
          return {
            challengeId: c.id,
            bossName: result.data.boss_name,
            bossEmoji: result.data.boss_emoji,
            currentHp: result.data.current_hp,
            maxHp: result.data.max_hp,
            status: result.data.status as "active" | "defeated" | "expired",
            daysRemaining: result.data.days_remaining,
            hoursRemaining: result.data.hours_remaining,
          };
        }
      } catch {
        // Skip if boss fetch fails
      }
      return null;
    })
  );

  const activeBosses = bossResults.filter(
    (b): b is NonNullable<typeof b> => b !== null && (b.status === "active" || b.status === "defeated")
  );

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <SocialClient feed={feed} challenges={challenges} activeBosses={activeBosses} />
    </main>
  );
}
