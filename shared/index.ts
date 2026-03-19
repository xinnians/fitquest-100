// Types
export type { User } from "./types/user";
export type { CheckIn, CheckInInput } from "./types/check-in";
export type { Meal, MealInput } from "./types/meal";

// Constants
export { EXERCISE_TYPES, EXERCISE_TYPE_MAP } from "./constants/exercise-types";
export type { ExerciseType } from "./constants/exercise-types";
export {
  MEAL_TYPES,
  DEFAULT_DAILY_CALORIE_GOAL,
  DEFAULT_MACRO_RATIO,
  CALORIES_PER_GRAM,
} from "./constants/nutrients";
export type { MealType } from "./constants/nutrients";

// Utils
export { calculateCaloriesBurned } from "./utils/calories";
export { calculateStreak } from "./utils/streak";
export type { StreakResult } from "./utils/streak";
