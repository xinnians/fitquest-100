"use client";

import { get, set } from "idb-keyval";

export interface OfflineCheckIn {
  id: string;
  exercise_type: string;
  duration_minutes: number;
  calories_burned: number;
  notes: string | null;
  checked_in_at: string;
}

const QUEUE_KEY = "fitquest_offline_checkins";

export async function addToOfflineQueue(checkIn: Omit<OfflineCheckIn, "id">) {
  const queue = await getOfflineQueue();
  const entry: OfflineCheckIn = {
    ...checkIn,
    id: crypto.randomUUID(),
  };
  queue.push(entry);
  await set(QUEUE_KEY, queue);
  return entry;
}

export async function getOfflineQueue(): Promise<OfflineCheckIn[]> {
  return (await get<OfflineCheckIn[]>(QUEUE_KEY)) ?? [];
}

export async function clearOfflineQueue() {
  await set(QUEUE_KEY, []);
}

export async function removeFromOfflineQueue(id: string) {
  const queue = await getOfflineQueue();
  await set(
    QUEUE_KEY,
    queue.filter((item) => item.id !== id)
  );
}
