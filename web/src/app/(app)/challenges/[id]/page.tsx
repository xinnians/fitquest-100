import {
  getChallengeDetail,
  getChallengeLeaderboard,
} from "@/lib/challenge-actions";
import { getFeed } from "@/lib/feed-actions";
import { DetailClient } from "./detail-client";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: challengeId } = await params;

  const [detailResult, leaderboardResult, feedResult] = await Promise.all([
    getChallengeDetail(challengeId),
    getChallengeLeaderboard(challengeId),
    getFeed(challengeId),
  ]);

  if (!detailResult || "error" in detailResult) {
    return (
      <main className="mx-auto max-w-md px-4 pt-8">
        <p className="text-muted">
          {detailResult?.error ?? "無法載入挑戰資料"}
        </p>
      </main>
    );
  }

  const challenge = detailResult.data;
  const leaderboard =
    leaderboardResult && "data" in leaderboardResult
      ? leaderboardResult.data ?? []
      : [];
  const feed =
    feedResult && "data" in feedResult ? feedResult.data ?? [] : [];

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <DetailClient
        challenge={challenge}
        challengeId={challengeId}
        leaderboard={leaderboard}
        feed={feed}
      />
    </main>
  );
}
