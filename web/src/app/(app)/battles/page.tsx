"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getMyBattles,
  createBattle,
  getPotentialOpponents,
} from "@/lib/battle-actions";
import { BattleCard } from "@/components/features/battle-card";

interface Battle {
  id: string;
  challenger_id: string;
  opponent_id: string;
  metric: "check_ins" | "calories";
  status: string;
  start_date: string;
  end_date: string;
  stake_description: string | null;
  challenger: { id: string; nickname: string | null } | null;
  opponent: { id: string; nickname: string | null } | null;
}

interface Opponent {
  id: string;
  nickname: string;
}

export default function BattlesPage() {
  const router = useRouter();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadData() {
      const [battlesResult, opponentsResult] = await Promise.all([
        getMyBattles(),
        getPotentialOpponents(),
      ]);

      if (battlesResult.data) {
        setBattles(battlesResult.data as Battle[]);
      }
      if (opponentsResult.data) {
        setOpponents(opponentsResult.data);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      const result = await createBattle(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        // Reload battles
        const battlesResult = await getMyBattles();
        if (battlesResult.data) {
          setBattles(battlesResult.data as Battle[]);
        }
        router.refresh();
      }
    });
  }

  const activeBattles = battles.filter((b) => b.status === "active");
  const pendingBattles = battles.filter(
    (b) => b.status === "pending"
  );
  const finishedBattles = battles.filter(
    (b) => b.status === "completed" || b.status === "declined"
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-4 pt-8">
        <p className="text-muted">載入中...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">PK 對戰</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
        >
          {showForm ? "取消" : "發起挑戰"}
        </button>
      </div>

      {/* Create Battle Form */}
      {showForm && (
        <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-heading text-lg font-bold">發起對戰</h3>
          {opponents.length === 0 ? (
            <p className="text-sm text-muted">
              你還沒有可以挑戰的對手。先加入一個挑戰群組吧！
            </p>
          ) : (
            <form action={handleSubmit} className="space-y-4">
              {/* Select opponent */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  選擇對手
                </label>
                <select
                  name="opponent_id"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">請選擇對手</option>
                  {opponents.map((opponent) => (
                    <option key={opponent.id} value={opponent.id}>
                      {opponent.nickname}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select metric */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  比拼指標
                </label>
                <select
                  name="metric"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="check_ins">打卡次數</option>
                  <option value="calories">卡路里消耗</option>
                </select>
              </div>

              {/* Stake description */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  賭注描述（選填）
                </label>
                <input
                  type="text"
                  name="stake_description"
                  placeholder="例如：輸的人請喝飲料"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isPending ? "發起中..." : "發起對戰"}
              </button>
            </form>
          )}
        </section>
      )}

      {/* Active Battles */}
      <section className="mt-6">
        <h3 className="mb-3 font-heading text-lg font-bold">進行中</h3>
        {activeBattles.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <p className="text-sm text-muted">目前沒有進行中的對戰</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeBattles.map((battle) => (
              <BattleCard
                key={battle.id}
                id={battle.id}
                challengerName={
                  battle.challenger?.nickname ?? "匿名冒險者"
                }
                opponentName={
                  battle.opponent?.nickname ?? "匿名冒險者"
                }
                metric={battle.metric}
                status={battle.status}
                startDate={battle.start_date}
                endDate={battle.end_date}
                stakeDescription={battle.stake_description}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pending Battles */}
      <section className="mt-6">
        <h3 className="mb-3 font-heading text-lg font-bold">等待回應</h3>
        {pendingBattles.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <p className="text-sm text-muted">沒有等待回應的對戰</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBattles.map((battle) => (
              <BattleCard
                key={battle.id}
                id={battle.id}
                challengerName={
                  battle.challenger?.nickname ?? "匿名冒險者"
                }
                opponentName={
                  battle.opponent?.nickname ?? "匿名冒險者"
                }
                metric={battle.metric}
                status={battle.status}
                startDate={battle.start_date}
                endDate={battle.end_date}
                stakeDescription={battle.stake_description}
              />
            ))}
          </div>
        )}
      </section>

      {/* Finished Battles */}
      <section className="mt-6">
        <h3 className="mb-3 font-heading text-lg font-bold">已結束</h3>
        {finishedBattles.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <p className="text-sm text-muted">沒有已結束的對戰</p>
          </div>
        ) : (
          <div className="space-y-3">
            {finishedBattles.map((battle) => (
              <BattleCard
                key={battle.id}
                id={battle.id}
                challengerName={
                  battle.challenger?.nickname ?? "匿名冒險者"
                }
                opponentName={
                  battle.opponent?.nickname ?? "匿名冒險者"
                }
                metric={battle.metric}
                status={battle.status}
                startDate={battle.start_date}
                endDate={battle.end_date}
                stakeDescription={battle.stake_description}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
