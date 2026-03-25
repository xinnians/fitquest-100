"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getBattleDetail,
  respondBattle,
  createRematch,
  getCurrentUserId,
} from "@/lib/battle-actions";

interface BattleDetail {
  battle: {
    id: string;
    challenger_id: string;
    opponent_id: string;
    metric: "check_ins" | "calories";
    status: string;
    start_date: string;
    end_date: string;
    winner_id: string | null;
    stake_description: string | null;
    challenger: { id: string; nickname: string | null } | null;
    opponent: { id: string; nickname: string | null } | null;
  };
  challenger_score: number;
  opponent_score: number;
  days_remaining: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> =
  {
    pending: {
      label: "等待接受",
      color: "text-muted",
      bg: "bg-muted/10",
    },
    active: {
      label: "進行中",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    completed: {
      label: "已結束",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    declined: {
      label: "已拒絕",
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  };

export default function BattleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = params.id as string;

  const [data, setData] = useState<BattleDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadData() {
      const [detailResult, userId] = await Promise.all([
        getBattleDetail(battleId),
        getCurrentUserId(),
      ]);

      if (detailResult.error) {
        setError(detailResult.error);
      } else if (detailResult.data) {
        setData(detailResult.data as BattleDetail);
      }

      setCurrentUserId(userId);
      setLoading(false);
    }

    loadData();
  }, [battleId]);

  function handleRespond(accept: boolean) {
    startTransition(async () => {
      const result = await respondBattle(battleId, accept);
      if (result.error) {
        setError(result.error);
      } else {
        const detailResult = await getBattleDetail(battleId);
        if (detailResult.data) {
          setData(detailResult.data as BattleDetail);
        }
        router.refresh();
      }
    });
  }

  function handleRematch() {
    startTransition(async () => {
      const result = await createRematch(battleId);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        router.push(`/battles/${result.data.id}`);
      }
    });
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-4 pt-8">
        <p className="text-muted">載入中...</p>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="mx-auto max-w-md px-4 pt-8">
        <p className="text-destructive">{error}</p>
        <Link
          href="/battles"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          返回對戰列表
        </Link>
      </main>
    );
  }

  if (!data) return null;

  const { battle, challenger_score, opponent_score, days_remaining } = data;
  const statusInfo = STATUS_MAP[battle.status] ?? STATUS_MAP.pending;
  const metricLabel =
    battle.metric === "check_ins" ? "打卡次數" : "卡路里消耗";
  const metricUnit = battle.metric === "check_ins" ? "次" : "kcal";

  const challengerName = battle.challenger?.nickname ?? "匿名冒險者";
  const opponentName = battle.opponent?.nickname ?? "匿名冒險者";

  const challengerWinning = challenger_score > opponent_score;
  const opponentWinning = opponent_score > challenger_score;
  const isTied = challenger_score === opponent_score;

  const isOpponent = currentUserId === battle.opponent_id;
  const canRespond = battle.status === "pending" && isOpponent;
  const isCompleted = battle.status === "completed";

  // Determine winner info for completed battles
  const winnerName =
    battle.winner_id === battle.challenger_id
      ? challengerName
      : battle.winner_id === battle.opponent_id
        ? opponentName
        : null;
  const isDraw = isCompleted && battle.winner_id === null;
  const currentUserWon = isCompleted && battle.winner_id === currentUserId;
  const currentUserLost =
    isCompleted && battle.winner_id !== null && battle.winner_id !== currentUserId;

  // Progress bar for active battles (7 days total)
  const totalDays = 7;
  const elapsedDays = totalDays - days_remaining;
  const progressPct = Math.min(100, (elapsedDays / totalDays) * 100);

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      {/* Back button */}
      <Link
        href="/battles"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-primary"
      >
        <span>&#8592;</span> 返回對戰列表
      </Link>

      {/* Winner Banner (completed battles) */}
      {isCompleted && (
        <div
          className={`mb-4 rounded-xl p-4 text-center ${
            isDraw
              ? "border border-border bg-muted/10"
              : currentUserWon
                ? "border border-accent/30 bg-accent/10"
                : "border border-destructive/30 bg-destructive/10"
          }`}
        >
          <span className="text-3xl">
            {isDraw ? "🤝" : currentUserWon ? "🏆" : "😤"}
          </span>
          <p className="mt-2 font-heading text-lg font-extrabold">
            {isDraw
              ? "平手！"
              : currentUserWon
                ? "恭喜你贏了！"
                : `${winnerName} 獲勝！`}
          </p>
          <p className="mt-1 text-sm text-muted">
            {challenger_score} vs {opponent_score} {metricUnit}
          </p>
          {battle.stake_description && !isDraw && (
            <p className="mt-2 text-sm font-medium text-primary">
              🎯 賭注：{battle.stake_description}
            </p>
          )}
        </div>
      )}

      {/* Status badge */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">
          PK 對戰詳情
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color} ${statusInfo.bg}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Days Remaining Progress (active battles) */}
      {battle.status === "active" && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">比拼進度</span>
            <span className="font-medium">
              {days_remaining > 0 ? `剩餘 ${days_remaining} 天` : "今天結算"}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Player Cards */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <p className="mb-4 text-center text-xs text-muted">
          比拼指標：{metricLabel}
        </p>

        <div className="flex items-stretch gap-3">
          {/* Challenger */}
          <div
            className={`flex flex-1 flex-col items-center rounded-xl border p-4 ${
              challengerWinning
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
          >
            {challengerWinning && !isCompleted && (
              <span className="mb-1 text-xs font-bold text-primary">
                領先
              </span>
            )}
            {isCompleted && battle.winner_id === battle.challenger_id && (
              <span className="mb-1 text-xs font-bold text-accent">
                🏆 勝利
              </span>
            )}
            <span className="text-2xl">🏋️</span>
            <p className="mt-2 text-sm font-bold">{challengerName}</p>
            <p className="mt-1 text-xs text-muted">挑戰者</p>
            <p className="mt-3 font-heading text-3xl font-extrabold text-primary">
              {challenger_score}
            </p>
            <p className="text-xs text-muted">{metricUnit}</p>
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center justify-center">
            <span className="font-heading text-lg font-extrabold text-muted">
              VS
            </span>
            {isTied && battle.status === "active" && (
              <span className="mt-1 text-xs text-muted">平手</span>
            )}
          </div>

          {/* Opponent */}
          <div
            className={`flex flex-1 flex-col items-center rounded-xl border p-4 ${
              opponentWinning
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
          >
            {opponentWinning && !isCompleted && (
              <span className="mb-1 text-xs font-bold text-primary">
                領先
              </span>
            )}
            {isCompleted && battle.winner_id === battle.opponent_id && (
              <span className="mb-1 text-xs font-bold text-accent">
                🏆 勝利
              </span>
            )}
            <span className="text-2xl">🏃</span>
            <p className="mt-2 text-sm font-bold">{opponentName}</p>
            <p className="mt-1 text-xs text-muted">被挑戰者</p>
            <p className="mt-3 font-heading text-3xl font-extrabold text-primary">
              {opponent_score}
            </p>
            <p className="text-xs text-muted">{metricUnit}</p>
          </div>
        </div>
      </section>

      {/* Battle Info */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-3 font-heading text-lg font-bold">對戰資訊</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">比拼期間</span>
            <span>
              {new Date(battle.start_date).toLocaleDateString("zh-TW")} ~{" "}
              {new Date(battle.end_date).toLocaleDateString("zh-TW")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">比拼指標</span>
            <span>{metricLabel}</span>
          </div>
          {battle.stake_description && (
            <div className="flex justify-between">
              <span className="text-muted">賭注</span>
              <span className="text-primary">
                {battle.stake_description}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Accept/Decline buttons for pending battle */}
      {canRespond && (
        <section className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="mb-4 text-center text-sm">
            <span className="font-bold">{challengerName}</span>{" "}
            向你發起了挑戰！
          </p>

          {error && (
            <p className="mb-3 text-center text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleRespond(false)}
              disabled={isPending}
              className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold transition-colors hover:bg-muted/10 disabled:opacity-50"
            >
              {isPending ? "處理中..." : "婉拒"}
            </button>
            <button
              onClick={() => handleRespond(true)}
              disabled={isPending}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {isPending ? "處理中..." : "接受挑戰"}
            </button>
          </div>
        </section>
      )}

      {/* Rematch button for completed battles */}
      {isCompleted && (
        <button
          onClick={handleRematch}
          disabled={isPending}
          className="mt-4 w-full rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
        >
          {isPending ? "建立中..." : "🔄 再來一局"}
        </button>
      )}
    </main>
  );
}
