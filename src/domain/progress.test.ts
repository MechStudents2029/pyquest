import { describe, expect, it } from "vitest";
import {
  createInitialProgress,
  getLevel,
  getLevelProgress,
  isDayUnlocked,
  recordFailure,
  recordSuccess,
} from "./progress";

describe("progress rules", () => {
  it("records failures without awarding XP and reveals hints after two attempts", () => {
    const first = recordFailure(createInitialProgress(), "day-1-greet");
    const second = recordFailure(first, "day-1-greet");

    expect(second.xp).toBe(0);
    expect(second.attempts["day-1-greet"]).toBe(2);
  });

  it("awards challenge XP once and clears a day only when all challenges pass", () => {
    const initial = createInitialProgress();
    const afterFirst = recordSuccess(initial, {
      challengeId: "day-1-a",
      day: 1,
      dayChallengeIds: ["day-1-a", "day-1-b"],
      xp: 100,
      date: "2026-08-24",
    });
    const duplicate = recordSuccess(afterFirst, {
      challengeId: "day-1-a",
      day: 1,
      dayChallengeIds: ["day-1-a", "day-1-b"],
      xp: 100,
      date: "2026-08-24",
    });
    const cleared = recordSuccess(duplicate, {
      challengeId: "day-1-b",
      day: 1,
      dayChallengeIds: ["day-1-a", "day-1-b"],
      xp: 100,
      date: "2026-08-24",
    });

    expect(duplicate.xp).toBe(100);
    expect(duplicate.clearedDays).toEqual([]);
    expect(cleared.xp).toBe(200);
    expect(cleared.clearedDays).toEqual([1]);
    expect(isDayUnlocked(cleared, 2)).toBe(true);
    expect(isDayUnlocked(cleared, 3)).toBe(false);
  });

  it("updates streak once per day and resets after a gap", () => {
    const dayOne = recordSuccess(createInitialProgress(), {
      challengeId: "a",
      day: 1,
      dayChallengeIds: ["a"],
      xp: 50,
      date: "2026-08-20",
    });
    const sameDay = recordSuccess(dayOne, {
      challengeId: "b",
      day: 2,
      dayChallengeIds: ["b"],
      xp: 50,
      date: "2026-08-20",
    });
    const nextDay = recordSuccess(sameDay, {
      challengeId: "c",
      day: 3,
      dayChallengeIds: ["c"],
      xp: 50,
      date: "2026-08-21",
    });
    const afterGap = recordSuccess(nextDay, {
      challengeId: "d",
      day: 4,
      dayChallengeIds: ["d"],
      xp: 50,
      date: "2026-08-24",
    });

    expect(sameDay.streak).toBe(1);
    expect(nextDay.streak).toBe(2);
    expect(nextDay.longestStreak).toBe(2);
    expect(afterGap.streak).toBe(1);
  });

  it("calculates levels in 300 XP bands", () => {
    expect(getLevel(0)).toBe(1);
    expect(getLevel(299)).toBe(1);
    expect(getLevel(300)).toBe(2);
    expect(getLevel(600)).toBe(3);
    expect(getLevelProgress(599)).toBe(299);
  });
});
