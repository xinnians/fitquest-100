export interface CheckIn {
  id: string;
  user_id: string;
  exercise_type: string;
  duration_minutes: number;
  calories_burned: number;
  notes: string | null;
  is_offline_sync: boolean;
  checked_in_at: string;
  created_at: string;
}

export interface CheckInInput {
  exercise_type: string;
  duration_minutes: number;
  notes?: string;
}
