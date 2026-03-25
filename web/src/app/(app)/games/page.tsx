import Link from "next/link";
import { getGameStatus } from "@/lib/game-actions";

export default async function GamesPage() {
  const status = await getGameStatus();

  const games = [
    {
      href: "/games/wheel",
      emoji: "🎰",
      name: "運動轉盤",
      description: "隨機指定加碼運動，完成得額外獎勵",
      reward: "+150 XP · +15 🪙",
      played: status?.wheelPlayedToday ?? false,
    },
    {
      href: "/games/quiz",
      emoji: "🍔",
      name: "猜猜熱量",
      description: "猜食物的熱量，答越準分越高",
      reward: "最高 +50 XP · +5 🪙",
      played: status?.quizPlayedToday ?? false,
    },
  ];

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <h1 className="font-heading text-3xl font-extrabold animate-fade-in-up">小遊戲</h1>
      <p className="mt-1 text-sm text-muted animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        每日各限玩一次，玩遊戲賺 XP 和金幣
      </p>

      <div className="mt-6 space-y-4">
        {games.map((game, i) => (
          <Link
            key={game.href}
            href={game.href}
            className="block rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-lg animate-fade-in-up"
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{game.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg font-bold">{game.name}</h2>
                  {game.played && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                      已完成
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted">{game.description}</p>
                <p className="mt-1 text-xs text-primary font-medium">{game.reward}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
