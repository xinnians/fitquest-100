"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InviteCodeDisplay } from "@/components/features/invite-code-display";
import { Leaderboard } from "@/components/features/leaderboard";
import { FeedCard } from "@/components/features/feed-card";
import { toggleLike } from "@/lib/feed-actions";
import { getChallengeLeaderboard } from "@/lib/challenge-actions";
import type { LeaderboardRange } from "shared/types/challenge";

interface Member {
  user_id: string;
  joined_at: string;
  profiles: {
    nickname: string;
    avatar_url: string | null;
  } | null;
}

interface Challenge {
  id: string;
  name: string;
  invite_code: string;
  start_date: string;
  end_date: string;
  members: Member[];
}

interface LeaderboardEntry {
  user_id: string;
  nickname: string | null;
  avatar_url: string | null;
  total_check_ins: number;
  total_calories: number;
}

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

interface DetailClientProps {
  challenge: Challenge;
  challengeId: string;
  leaderboard: LeaderboardEntry[];
  feed: FeedItem[];
}

type Tab = "leaderboard" | "feed";

export function DetailClient({
  challenge,
  challengeId,
  leaderboard,
  feed,
}: DetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");

  async function handleToggleLike(feedItemId: string) {
    await toggleLike(feedItemId);
    router.refresh();
  }

  const leaderboardEntries = leaderboard.map((entry) => ({
    user_id: entry.user_id,
    nickname: entry.nickname ?? "匿名",
    avatar_url: entry.avatar_url,
    total_check_ins: entry.total_check_ins,
    total_calories: entry.total_calories,
  }));

  return (
    <div>
      {/* Header */}
      <h1 className="font-heading text-2xl font-extrabold">
        {challenge.name}
      </h1>
      <p className="mt-1 text-xs text-muted">
        {challenge.start_date} ~ {challenge.end_date} &middot;{" "}
        {challenge.members.length} 位成員
      </p>

      {/* Invite code */}
      <section className="mt-4">
        <p className="mb-2 text-sm font-medium text-muted">邀請碼</p>
        <InviteCodeDisplay code={challenge.invite_code} />
      </section>

      {/* Members */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-3 font-heading text-lg font-bold">成員</h3>
        <div className="flex flex-wrap gap-3">
          {challenge.members.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {(member.profiles?.nickname ?? "?").charAt(0)}
              </div>
              <span className="text-sm font-medium">
                {member.profiles?.nickname ?? "匿名"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-6 flex rounded-xl border border-border bg-card shadow-card">
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
            activeTab === "leaderboard"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          排行榜
        </button>
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
            activeTab === "feed"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          動態
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "leaderboard" && (
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <Leaderboard
              entries={leaderboardEntries}
              showRangeTabs
              onRangeChange={async (range: LeaderboardRange) => {
                const result = await getChallengeLeaderboard(challengeId, range);
                if ("data" in result && result.data) {
                  return result.data.map((e) => ({
                    ...e,
                    nickname: e.nickname ?? "匿名",
                  }));
                }
                return [];
              }}
            />
          </section>
        )}

        {activeTab === "feed" && (
          <div className="space-y-4">
            {feed.length === 0 ? (
              <section className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
                <p className="text-sm text-muted">還沒有任何動態</p>
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
    </div>
  );
}
