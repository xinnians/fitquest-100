export interface ExerciseType {
  id: string;
  label: string;
  emoji: string;
  met: number; // Metabolic Equivalent of Task
}

export const EXERCISE_TYPES: ExerciseType[] = [
  { id: "running", label: "跑步", emoji: "🏃", met: 9.8 },
  { id: "walking", label: "健走", emoji: "🚶", met: 3.8 },
  { id: "cycling", label: "騎車", emoji: "🚴", met: 7.5 },
  { id: "swimming", label: "游泳", emoji: "🏊", met: 8.0 },
  { id: "weight_training", label: "重訓", emoji: "🏋️", met: 6.0 },
  { id: "yoga", label: "瑜伽", emoji: "🧘", met: 3.0 },
  { id: "hiit", label: "HIIT", emoji: "⚡", met: 10.0 },
  { id: "basketball", label: "籃球", emoji: "🏀", met: 8.0 },
  { id: "badminton", label: "羽球", emoji: "🏸", met: 5.5 },
  { id: "tennis", label: "網球", emoji: "🎾", met: 7.3 },
  { id: "soccer", label: "足球", emoji: "⚽", met: 7.0 },
  { id: "hiking", label: "登山", emoji: "🥾", met: 6.5 },
  { id: "dancing", label: "舞蹈", emoji: "💃", met: 5.0 },
  { id: "jump_rope", label: "跳繩", emoji: "🤸", met: 11.0 },
  { id: "other", label: "其他", emoji: "🔥", met: 5.0 },
];

export const EXERCISE_TYPE_MAP = new Map(
  EXERCISE_TYPES.map((e) => [e.id, e])
);
