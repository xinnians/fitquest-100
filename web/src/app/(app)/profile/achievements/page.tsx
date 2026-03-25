import { getMyAchievements } from "@/lib/achievement-actions";
import { ACHIEVEMENTS } from "@/lib/achievements";
import Link from "next/link";

const RARITY_COLORS = {
  common: "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800",
  rare: "border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/30",
  epic: "border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/30",
  legendary: "border-yellow-400 bg-yellow-50 dark:border-yellow-500 dark:bg-yellow-900/30",
};

const RARITY_LABELS = {
  common: "普通",
  rare: "稀有",
  epic: "史詩",
  legendary: "傳說",
};

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  streak: { label: "連續打卡", emoji: "🔥" },
  exercise: { label: "運動多樣性", emoji: "🏃" },
  social: { label: "社交互動", emoji: "🤝" },
  calories: { label: "卡路里", emoji: "💥" },
  boss: { label: "Boss 戰", emoji: "👹" },
};

export default async function AchievementsPage() {
  const userAchievements = await getMyAchievements();
  const unlockedIds = new Set(userAchievements.map((a) => a.achievement_id));

  const categories = [...new Set(ACHIEVEMENTS.map((a) => a.category))];

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold">成就徽章</h1>
          <p className="mt-1 text-sm text-muted">
            已解鎖 {unlockedIds.size} / {ACHIEVEMENTS.length}
          </p>
        </div>
        <Link href="/profile" className="text-sm text-muted hover:text-foreground">
          ← 返回
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
          style={{ width: `${Math.round((unlockedIds.size / ACHIEVEMENTS.length) * 100)}%` }}
        />
      </div>

      <div className="mt-6 space-y-6">
        {categories.map((cat) => {
          const catInfo = CATEGORY_LABELS[cat];
          const achievements = ACHIEVEMENTS.filter((a) => a.category === cat);

          return (
            <section key={cat}>
              <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold">
                <span>{catInfo?.emoji}</span>
                {catInfo?.label}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((achievement) => {
                  const isUnlocked = unlockedIds.has(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`rounded-xl border p-3 transition-all ${
                        isUnlocked
                          ? RARITY_COLORS[achievement.rarity]
                          : "border-border bg-card opacity-50 grayscale"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{achievement.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{achievement.name}</p>
                          <p className="text-[10px] text-muted">{RARITY_LABELS[achievement.rarity]}</p>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted">{achievement.description}</p>
                      {isUnlocked && (
                        <p className="mt-1 text-[10px] text-accent">
                          +{achievement.xpReward} XP · +{achievement.coinReward} 🪙
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
