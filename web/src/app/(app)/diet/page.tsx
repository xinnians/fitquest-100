import { getTodayMeals } from "@/lib/meal-actions";
import { DietClient } from "./diet-client";

export default async function DietPage() {
  const meals = await getTodayMeals();

  return <DietClient initialMeals={meals} />;
}
