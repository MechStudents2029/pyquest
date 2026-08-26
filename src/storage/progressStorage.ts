import { createInitialProgress } from "../domain/progress";
import type { Progress } from "../domain/types";

export const PROGRESS_STORAGE_KEY = "pyquest-progress";

type StoragePort = Pick<Storage, "getItem" | "setItem">;

export function loadProgress(storage: StoragePort): Progress {
  const raw = storage.getItem(PROGRESS_STORAGE_KEY);
  if (raw === null) {
    return createInitialProgress();
  }

  try {
    return parseProgress(JSON.parse(raw));
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(storage: StoragePort, progress: Progress): void {
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function parseProgress(value: unknown): Progress {
  if (!isObject(value)) {
    throw new Error("Progress must be an object");
  }

  const version = Reflect.get(value, "version");
  const xp = Reflect.get(value, "xp");
  const completedChallenges = Reflect.get(value, "completedChallenges");
  const clearedDays = Reflect.get(value, "clearedDays");
  const attempts = Reflect.get(value, "attempts");
  const drafts = Reflect.get(value, "drafts");
  const lastActivityDate = Reflect.get(value, "lastActivityDate");
  const streak = Reflect.get(value, "streak");
  const longestStreak = Reflect.get(value, "longestStreak");
  const selectedDay = Reflect.get(value, "selectedDay");

  if (
    version !== 1 ||
    !isNonNegativeInteger(xp) ||
    !isStringArray(completedChallenges) ||
    !isNumberArray(clearedDays) ||
    !isNumberRecord(attempts) ||
    !isStringRecord(drafts) ||
    !(lastActivityDate === null || typeof lastActivityDate === "string") ||
    !isNonNegativeInteger(streak) ||
    !isNonNegativeInteger(longestStreak) ||
    !isNonNegativeInteger(selectedDay) ||
    selectedDay < 1 ||
    selectedDay > 30
  ) {
    throw new Error("Invalid progress record");
  }

  return {
    version,
    xp,
    completedChallenges,
    clearedDays,
    attempts,
    drafts,
    lastActivityDate,
    streak,
    longestStreak,
    selectedDay,
  };
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isNonNegativeInteger);
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return isObject(value) && Object.values(value).every(isNonNegativeInteger);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isObject(value) && Object.values(value).every((item) => typeof item === "string");
}
