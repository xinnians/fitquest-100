"use client";

import { useTransition } from "react";

interface FeedCardProps {
  id: string;
  nickname: string;
  type: string;
  content: Record<string, unknown>;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  onToggleLike: (feedItemId: string) => Promise<void>;
}

export function FeedCard({
  id,
  nickname,
  type,
  content,
  createdAt,
  likeCount,
  isLiked,
  onToggleLike,
}: FeedCardProps) {
  const [isPending, startTransition] = useTransition();

  const timeAgo = getTimeAgo(createdAt);

  function renderContent() {
    switch (type) {
      case "check_in":
        return (
          <p>
            完成了{" "}
            <span className="font-bold text-primary">
              {(content.exercise_label as string) ?? "運動"}
            </span>{" "}
            {content.duration_minutes as number} 分鐘，消耗{" "}
            <span className="font-bold text-accent">
              {content.calories_burned as number} kcal
            </span>
          </p>
        );
      case "join":
        return <p>加入了挑戰！🎉</p>;
      case "battle_start":
        return <p>發起了一場 PK 對戰 ⚔️</p>;
      case "battle_result": {
        const winnerId = content.winner_id as string | null;
        const cScore = content.challenger_score as number;
        const oScore = content.opponent_score as number;
        const metricLabel = (content.metric as string) === "check_ins" ? "打卡次數" : "卡路里";
        return (
          <p>
            PK 對戰結束！
            {winnerId === null ? " 🤝 平手" : " 🏆 "}
            <span className="font-bold text-primary">
              {cScore} vs {oScore}
            </span>{" "}
            {metricLabel}
          </p>
        );
      }
      case "battle_end":
        return <p>完成了一場 PK 對戰 🏆</p>;
      default:
        return <p>{JSON.stringify(content)}</p>;
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold">{nickname}</p>
          <div className="mt-1 text-sm text-foreground">{renderContent()}</div>
        </div>
        <span className="text-xs text-muted">{timeAgo}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => startTransition(() => onToggleLike(id))}
          disabled={isPending}
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            isLiked
              ? "bg-destructive/10 text-destructive"
              : "bg-border/50 text-muted hover:bg-border"
          }`}
        >
          {isLiked ? "❤️" : "🤍"} {likeCount}
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "剛剛";
  if (diffMin < 60) return `${diffMin} 分鐘前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} 小時前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString("zh-TW");
}
