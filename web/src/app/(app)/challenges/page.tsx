import { getMyChallenges } from "@/lib/challenge-actions";
import { ChallengesClient } from "./challenges-client";

export default async function ChallengesPage() {
  const raw = await getMyChallenges();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const challenges = (raw as any[]).map((c) => ({
    id: c.id ?? "",
    name: c.name ?? "",
    member_count: c.member_count ?? 0,
    start_date: c.start_date ?? "",
    end_date: c.end_date ?? "",
  }));

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <ChallengesClient challenges={challenges} />
    </main>
  );
}
