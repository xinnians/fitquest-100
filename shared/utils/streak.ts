/**
 * Calculate current streak and check-in dates from check-in history
 */
export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  checkedInDates: Set<string>;
}

/**
 * Get date string in YYYY-MM-DD format for a given timezone
 */
function toDateString(date: Date | string, timezone: string = "Asia/Taipei"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-CA", { timeZone: timezone }); // en-CA gives YYYY-MM-DD
}

/**
 * Calculate streak from an array of check-in timestamps
 */
export function calculateStreak(
  checkInDates: string[],
  timezone: string = "Asia/Taipei"
): StreakResult {
  if (checkInDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalDays: 0, checkedInDates: new Set() };
  }

  // Get unique dates
  const uniqueDates = new Set(checkInDates.map((d) => toDateString(d, timezone)));
  const sortedDates = Array.from(uniqueDates).sort();

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Calculate current streak (counting back from today)
  const today = toDateString(new Date(), timezone);
  let currentStreak = 0;
  let checkDate = new Date(today);

  // Check if today is checked in
  if (uniqueDates.has(today)) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If today is not checked in, current streak is 0
    return {
      currentStreak: 0,
      longestStreak,
      totalDays: uniqueDates.size,
      checkedInDates: uniqueDates,
    };
  }

  // Count backwards
  while (uniqueDates.has(toDateString(checkDate, timezone))) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalDays: uniqueDates.size,
    checkedInDates: uniqueDates,
  };
}
