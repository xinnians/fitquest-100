import { notFound } from "next/navigation";
import { getCharacter, CHARACTERS } from "@/lib/characters";
import { CompanionClient } from "./companion-client";

export function generateStaticParams() {
  return CHARACTERS.map((c) => ({ characterId: c.id }));
}

export default async function CompanionPage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const { characterId } = await params;
  const character = getCharacter(characterId);
  if (!character) notFound();

  return <CompanionClient character={character} />;
}
