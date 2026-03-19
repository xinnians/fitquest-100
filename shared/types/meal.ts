import type { MealType } from "../constants/nutrients";

export interface Meal {
  id: string;
  user_id: string;
  meal_type: MealType;
  food_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  photo_url: string | null;
  is_ai_recognized: boolean;
  eaten_at: string;
  created_at: string;
}

export interface MealInput {
  meal_type: MealType;
  food_name: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}
