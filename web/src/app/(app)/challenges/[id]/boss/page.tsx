import { getCurrentBossBattle, getBossBattleHistory } from "@/lib/boss-battle-actions";
import { getCurrentUserId } from "@/lib/battle-actions";
import { BossClient } from "./boss-client";

export default async function BossBattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: challengeId } = await params;

  const [bossResult, historyResult, userId] = await Promise.all([
    getCurrentBossBattle(challengeId),
    getBossBattleHistory(challengeId),
    getCurrentUserId(),
  ]);

  if ("error" in bossResult) {
    return (
      <main className="mx-auto max-w-md px-4 pt-8">
        <p className="text-muted">{bossResult.error}</p>
      </main>
    );
  }

  const history =
    historyResult && "data" in historyResult ? historyResult.data ?? [] : [];

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <BossClient
        challengeId={challengeId}
        boss={bossResult.data}
        history={history}
        currentUserId={userId}
      />
    </main>
  );
}
