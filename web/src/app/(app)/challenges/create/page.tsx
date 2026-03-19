"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createChallenge } from "@/lib/challenge-actions";
import { InviteCodeDisplay } from "@/components/features/invite-code-display";

export default function CreateChallengePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [createdChallenge, setCreatedChallenge] = useState<{
    id: string;
    invite_code: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const endDate = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  function handleSubmit() {
    if (!name.trim()) return;
    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());

      const result = await createChallenge(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setCreatedChallenge({
          id: result.data.id,
          invite_code: result.data.invite_code,
        });
      }
    });
  }

  if (createdChallenge) {
    return (
      <main className="mx-auto max-w-md px-4 pb-8 pt-8">
        <h1 className="font-heading text-2xl font-extrabold">挑戰已建立！</h1>

        <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
          <p className="mb-3 text-sm text-muted">
            分享邀請碼給朋友，邀請他們加入：
          </p>
          <InviteCodeDisplay code={createdChallenge.invite_code} />
        </section>

        <button
          onClick={() => router.push(`/challenges/${createdChallenge.id}`)}
          className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-bold text-white transition-colors hover:bg-primary-hover"
        >
          前往挑戰頁面
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <h1 className="font-heading text-2xl font-extrabold">建立挑戰</h1>

      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">挑戰名稱</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：減脂大作戰"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="rounded-xl bg-primary/5 px-4 py-3">
            <p className="text-sm text-muted">
              挑戰將從今天開始，持續{" "}
              <span className="font-bold text-primary">100 天</span>
              ，預計結束日期為{" "}
              <span className="font-bold text-primary">{endDate}</span>
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? "建立中..." : "建立挑戰"}
          </button>
        </div>
      </section>
    </main>
  );
}
