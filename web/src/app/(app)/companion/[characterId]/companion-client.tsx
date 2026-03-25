"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Character } from "@/lib/characters";
import { CharacterAvatar } from "@/components/features/character-avatar";
import { updateCharacter } from "@/lib/profile-actions";

export function CompanionClient({ character }: { character: Character }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSelect() {
    startTransition(async () => {
      await updateCharacter(character.id);
      router.push("/dashboard");
    });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Back button */}
      <div className="px-5 pt-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 shadow-sm"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Character Hero */}
      <div className="flex flex-col items-center gap-3 pt-4 pb-6">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 180,
            height: 180,
            background: `radial-gradient(circle, ${character.color} 60%, transparent 100%)`,
          }}
        >
          <CharacterAvatar characterId={character.id} size={140} showBg={false} />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-extrabold">{character.name}</h1>
          <span className="text-2xl">{character.emoji}</span>
        </div>
        <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-semibold text-lime-700">
          {character.sport}
        </span>
        <p className="mx-8 text-center text-sm text-gray-500">{character.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-5">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-amber-50 p-3">
          <span className="text-lg font-bold">Lv.1</span>
          <span className="text-[10px] text-gray-500">等級</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-purple-50 p-3">
          <span className="text-lg font-bold">0</span>
          <span className="text-[10px] text-gray-500">XP</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-blue-50 p-3">
          <span className="text-lg font-bold">0</span>
          <span className="text-[10px] text-gray-500">金幣</span>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mx-5 mt-4 rounded-xl bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">經驗值進度</span>
          <span className="text-xs text-gray-400">0%</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-gray-200">
          <div className="h-full w-0 rounded-full bg-gradient-to-r from-lime-300 to-lime-500 transition-all duration-500" />
        </div>
        <p className="mt-1 text-[10px] text-gray-400">到下一級還需要更多經驗值</p>
      </div>

      {/* CTA */}
      <div className="mt-auto px-5 pb-8 pt-6">
        <button
          onClick={handleSelect}
          disabled={isPending}
          className="w-full rounded-2xl bg-gradient-to-r from-[#F97316] to-[#FB923C] py-4 text-base font-bold text-white shadow-md transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "儲存中..." : `選擇 ${character.name} 為夥伴`}
        </button>
      </div>
    </div>
  );
}
