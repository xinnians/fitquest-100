export interface User {
  id: string;
  email: string | null;
  nickname: string;
  avatar_url: string | null;
  gender: string | null;
  weight_kg: number | null;
  daily_calorie_goal: number;
  timezone: string;
  onboarding_completed: boolean;
  created_at: string;
}
