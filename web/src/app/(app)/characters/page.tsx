"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CHARACTERS } from "@/lib/characters";
import { CharacterAvatar } from "@/components/features/character-avatar";
import { updateCharacter } from "@/lib/profile-actions";

export default function CharactersPage() {
  const router = useRouter();
  const [selected, setSelected] = useState(CHARACTERS[0].id);
  const [isPending, startTransition] = useTransition();

  const current = CHARACTERS.find((c) => c.id === selected) ?? CHARACTERS[0];

  function handleConfirm() {
    startTransition(async () => {
      await updateCharacter(selected);
      router.push("/dashboard");
    });
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-6">
      {/* Selected Character Preview */}
      <div className="flex flex-col items-center gap-3">
        <CharacterAvatar characterId={selected} size={100} />
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-xl font-extrabold">{current.name}</h1>
          <span className="rounded-full bg-lime-100 px-2 py-0.5 text-xs font-semibold text-lime-700">
            {current.sport}
          </span>
        </div>
        <p className="text-center text-sm text-muted">{current.description}</p>
        <Link
          href={`/companion/${current.id}`}
          className="text-xs font-semibold text-primary underline"
        >
          查看詳細介紹→
        </Link>
      </div>

      {/* 4x5 Character Grid */}
      <div className="mt-5 grid grid-cols-4 gap-3">
        {CHARACTERS.map((c) => {
          const isSelected = c.id === selected;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
                isSelected
                  ? "ring-2 ring-[#F97316] bg-orange-50"
                  : "bg-white shadow-sm hover:shadow-md"
              }`}
            >
              <CharacterAvatar characterId={c.id} size={56} />
              <span className="text-[10px] font-semibold">{c.name}</span>
              <span className="text-[8px] text-gray-400">{c.sport}</span>
            </button>
          );
        })}
      </div>

      {/* Confirm CTA */}
      <button
        onClick={handleConfirm}
        disabled={isPending}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#F97316] to-[#FB923C] py-4 text-base font-bold text-white shadow-md transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "儲存中..." : `確認選擇 ${current.name}`}
      </button>
    </main>
  );
}
