"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeedCard } from "@/components/features/feed-card";
import { BossBattleCard } from "@/components/features/boss-battle-card";
import { toggleLike } from "@/lib/feed-actions";

interface FeedItem {
  id: string;
  user_id: string;
  challenge_id: string | null;
  type: string;
  content: Record<string, unknown>;
  created_at: string;
  nickname: string;
  avatar_url: string | null;
  like_count: number;
  is_liked: boolean;
}

interface Challenge {
  id: string;
  name: string;
  member_count: number;
  start_date: string;
  end_date: string;
}

interface ActiveBoss {
  challengeId: string;
  bossName: string;
  bossEmoji: string;
  currentHp: number;
  maxHp: number;
  status: "active" | "defeated" | "expired";
  daysRemaining: number;
  hoursRemaining: number;
}

interface SocialClientProps {
  feed: FeedItem[];
  challenges: Challenge[];
  activeBosses?: ActiveBoss[];
}

export function SocialClient({ feed, challenges, activeBosses = [] }: SocialClientProps) {
  const router = useRouter();

  async function handleToggleLike(feedItemId: string) {
    await toggleLike(feedItemId);
    router.refresh();
  }

  const hasChallenges = challenges.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">社交中心</h1>
        <div className="flex gap-2">
          <Link
            href="/battles"
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            PK 對戰
          </Link>
          <Link
            href="/challenges"
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            挑戰群組
          </Link>
        </div>
      </div>

      {/* Content */}
      {!hasChallenges ? (
        <section className="mt-6 rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <p className="text-lg font-bold">🏃</p>
          <p className="mt-2 text-sm text-muted">
            加入一個挑戰群組來看到朋友動態
          </p>
          <Link
            href="/challenges"
            className="mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            瀏覽挑戰
          </Link>
        </section>
      ) : (
        <div className="mt-6 space-y-4">
          {/* Active Boss Battles */}
          {activeBosses.length > 0 && (
            <div className="space-y-3">
              {activeBosses.map((boss) => (
                <BossBattleCard
                  key={boss.challengeId}
                  challengeId={boss.challengeId}
                  bossName={boss.bossName}
                  bossEmoji={boss.bossEmoji}
                  currentHp={boss.currentHp}
                  maxHp={boss.maxHp}
                  status={boss.status}
                  daysRemaining={boss.daysRemaining}
                  hoursRemaining={boss.hoursRemaining}
                />
              ))}
            </div>
          )}

          {feed.length === 0 ? (
            <section className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
              <p className="text-sm text-muted">還沒有任何動態，去打卡吧！</p>
            </section>
          ) : (
            feed.map((item) => (
              <FeedCard
                key={item.id}
                id={item.id}
                nickname={item.nickname}
                type={item.type}
                content={item.content}
                createdAt={item.created_at}
                likeCount={item.like_count}
                isLiked={item.is_liked}
                onToggleLike={handleToggleLike}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
