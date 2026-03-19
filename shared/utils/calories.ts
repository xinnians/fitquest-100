import { EXERCISE_TYPE_MAP } from "../constants/exercise-types";

/**
 * Calculate calories burned using MET formula
 * Calories = MET × weight(kg) × duration(hours)
 */
export function calculateCaloriesBurned(
  exerciseTypeId: string,
  weightKg: number,
  durationMinutes: number
): number {
  const exercise = EXERCISE_TYPE_MAP.get(exerciseTypeId);
  const met = exercise?.met ?? 5.0;
  const durationHours = durationMinutes / 60;
  return Math.round(met * weightKg * durationHours);
}
