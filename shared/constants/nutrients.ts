export const MEAL_TYPES = [
  { id: "breakfast", label: "早餐", emoji: "🌅" },
  { id: "lunch", label: "午餐", emoji: "☀️" },
  { id: "dinner", label: "晚餐", emoji: "🌙" },
  { id: "snack", label: "點心", emoji: "🍪" },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]["id"];

export const DEFAULT_DAILY_CALORIE_GOAL = 2000;
export const DEFAULT_MACRO_RATIO = {
  protein: 0.3, // 30%
  carbs: 0.4, // 40%
  fat: 0.3, // 30%
};

// Calories per gram
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;
