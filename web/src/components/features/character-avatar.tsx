"use client";

import Image from "next/image";
import { getCharacterOrDefault } from "@/lib/characters";

interface CharacterAvatarProps {
  characterId?: string;
  size?: number;
  className?: string;
  showBg?: boolean;
}

export function CharacterAvatar({
  characterId,
  size = 48,
  className = "",
  showBg = true,
}: CharacterAvatarProps) {
  const character = getCharacterOrDefault(characterId);

  return (
    <div
      className={`flex items-center justify-center rounded-full overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: showBg ? character.color : undefined,
      }}
    >
      <Image
        src={character.imagePath}
        alt={character.name}
        width={Math.round(size * 0.75)}
        height={Math.round(size * 0.75)}
        className="object-contain"
      />
    </div>
  );
}
