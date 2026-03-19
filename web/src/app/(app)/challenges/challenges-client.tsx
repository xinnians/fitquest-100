"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { joinChallenge } from "@/lib/challenge-actions";

interface Challenge {
  id: string;
  name: string;
  member_count: number;
  start_date: string;
  end_date: string;
}

interface ChallengesClientProps {
  challenges: Challenge[];
}

export function ChallengesClient({ challenges }: ChallengesClientProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleJoin() {
    if (!inviteCode.trim()) return;
    setError("");

    startTransition(async () => {
      const result = await joinChallenge(inviteCode.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setInviteCode("");
        router.refresh();
      }
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">挑戰群組</h1>
        <Link
          href="/challenges/create"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
        >
          建立挑戰
        </Link>
      </div>

      {/* Join by invite code */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-3 font-heading text-lg font-bold">加入挑戰</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="輸入邀請碼"
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono tracking-widest placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleJoin}
            disabled={isPending || !inviteCode.trim()}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? "加入中..." : "加入"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </section>

      {/* Challenge list */}
      <section className="mt-6 space-y-4">
        <h3 className="font-heading text-lg font-bold">我的挑戰</h3>
        {challenges.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
            <p className="text-sm text-muted">
              你還沒有加入任何挑戰，輸入邀請碼或建立新挑戰吧！
            </p>
          </div>
        ) : (
          challenges.map((challenge) => (
            <Link
              key={challenge.id}
              href={`/challenges/${challenge.id}`}
              className="block rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold">{challenge.name}</h4>
                <span className="text-xs text-muted">
                  {challenge.member_count} 位成員
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {challenge.start_date} ~ {challenge.end_date}
              </p>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
