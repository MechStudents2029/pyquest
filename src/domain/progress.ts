import type { Progress } from "./types";

interface SuccessInput {
  readonly challengeId: string;
  readonly day: number;
  readonly dayChallengeIds: readonly string[];
  readonly xp: number;
  readonly date: string;
}

export function createInitialProgress(): Progress {
  return {
    version: 1,
    xp: 0,
    completedChallenges: [],
    clearedDays: [],
    attempts: {},
    drafts: {},
    lastActivityDate: null,
    streak: 0,
    longestStreak: 0,
    selectedDay: 1,
  };
}

export function recordFailure(progress: Progress, challengeId: string): Progress {
  return {
    ...progress,
    attempts: {
      ...progress.attempts,
      [challengeId]: (progress.attempts[challengeId] ?? 0) + 1,
    },
  };
}

export function recordSuccess(progress: Progress, input: SuccessInput): Progress {
  if (progress.completedChallenges.includes(input.challengeId)) {
    return updateStreak(progress, input.date);
  }

  const completedChallenges = [...progress.completedChallenges, input.challengeId];
  const cleared = input.dayChallengeIds.every((id) => completedChallenges.includes(id));
  const clearedDays =
    cleared && !progress.clearedDays.includes(input.day)
      ? [...progress.clearedDays, input.day].sort((a, b) => a - b)
      : progress.clearedDays;

  return updateStreak(
    {
      ...progress,
      xp: progress.xp + input.xp,
      completedChallenges,
      clearedDays,
    },
    input.date,
  );
}

export function isDayUnlocked(progress: Progress, day: number): boolean {
  return day === 1 || progress.clearedDays.includes(day - 1);
}

export function getLevel(xp: number): number {
  return Math.floor(xp / 300) + 1;
}

export function getLevelProgress(xp: number): number {
  return xp % 300;
}

export function updateDraft(
  progress: Progress,
  challengeId: string,
  source: string,
): Progress {
  return {
    ...progress,
    drafts: { ...progress.drafts, [challengeId]: source },
  };
}

export function selectDay(progress: Progress, selectedDay: number): Progress {
  return { ...progress, selectedDay };
}

function updateStreak(progress: Progress, date: string): Progress {
  if (progress.lastActivityDate === date) {
    return progress;
  }

  const consecutive =
    progress.lastActivityDate !== null && daysBetween(progress.lastActivityDate, date) === 1;
  const streak = consecutive ? progress.streak + 1 : 1;

  return {
    ...progress,
    lastActivityDate: date,
    streak,
    longestStreak: Math.max(progress.longestStreak, streak),
  };
}

function daysBetween(start: string, end: string): number {
  const millisecondsPerDay = 86_400_000;
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / millisecondsPerDay);
}
