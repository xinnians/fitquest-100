"use client";

import Link from "next/link";

interface BattleCardProps {
  id: string;
  challengerName: string;
  opponentName: string;
  challengerId?: string;
  opponentId?: string;
  winnerId?: string | null;
  currentUserId?: string | null;
  metric: "check_ins" | "calories";
  status: string;
  startDate: string;
  endDate: string;
  stakeDescription: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "等待接受", color: "text-muted" },
  active: { label: "進行中", color: "text-primary" },
  completed: { label: "已結束", color: "text-accent" },
  declined: { label: "已拒絕", color: "text-destructive" },
};

export function BattleCard({
  id,
  challengerName,
  opponentName,
  challengerId,
  opponentId,
  winnerId,
  currentUserId,
  metric,
  status,
  startDate,
  endDate,
  stakeDescription,
}: BattleCardProps) {
  const statusInfo = STATUS_MAP[status] ?? STATUS_MAP.pending;

  // Winner/loser badge for completed battles
  let resultBadge: string | null = null;
  if (status === "completed" && currentUserId) {
    if (winnerId === null) {
      resultBadge = "🤝 平手";
    } else if (winnerId === currentUserId) {
      resultBadge = "🏆 勝利";
    } else {
      resultBadge = "😤 落敗";
    }
  }

  return (
    <Link
      href={`/battles/${id}`}
      className="block rounded-xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚔️</span>
          <div>
            <p className="text-sm font-bold">
              {challengerName} vs {opponentName}
            </p>
            <p className="text-xs text-muted">
              比拼：{metric === "check_ins" ? "打卡次數" : "卡路里消耗"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          {resultBadge && (
            <span className={`text-xs font-bold ${
              winnerId === currentUserId ? "text-accent" : winnerId === null ? "text-muted" : "text-destructive"
            }`}>
              {resultBadge}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
        <span>
          {new Date(startDate).toLocaleDateString("zh-TW")} ~{" "}
          {new Date(endDate).toLocaleDateString("zh-TW")}
        </span>
        {stakeDescription && (
          <span className="text-primary">🎯 {stakeDescription}</span>
        )}
      </div>
    </Link>
  );
}
