import { describe, expect, it } from "vitest";
import { curriculum, getDay } from "./curriculum";

describe("curriculum", () => {
  it("contains 30 ordered days with boss battles every five days", () => {
    expect(curriculum).toHaveLength(30);
    expect(curriculum.map((day) => day.day)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 1),
    );
    expect(curriculum.filter((day) => day.boss).map((day) => day.day)).toEqual([
      5, 10, 15, 20, 25, 30,
    ]);
  });

  it("gives every challenge unique, runnable content", () => {
    const challenges = curriculum.flatMap((day) => day.challenges);
    const ids = challenges.map((challenge) => challenge.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const challenge of challenges) {
      expect(challenge.starterCode).toContain("def ");
      expect(challenge.solutionCode.trim().length).toBeGreaterThan(0);
      expect(challenge.solutionCode).toContain("def ");
      expect(challenge.hint.trim().length).toBeGreaterThan(5);
      expect(challenge.xp).toBeGreaterThan(0);
      expect(challenge.tests.length).toBeGreaterThan(0);
    }
  });

  it("matches the required first three exercises", () => {
    expect(getDay(1).challenges[0]?.tests).toHaveLength(2);
    expect(getDay(2).challenges[0]?.tests).toHaveLength(3);
    expect(getDay(3).challenges[0]?.tests).toHaveLength(3);
    expect(getDay(1).challenges[0]?.starterCode).toContain("def greet(name):");
    expect(getDay(2).challenges[0]?.starterCode).toContain("def word_count(s):");
    expect(getDay(3).challenges[0]?.starterCode).toContain("def is_even(n):");
  });

  it("provides a distinct worked Python example for every day", () => {
    for (const lesson of curriculum) {
      const codeExample = Reflect.get(lesson, "codeExample");
      const challenge = lesson.challenges[0];

      expect(codeExample, `Day ${lesson.day}`).toBeTypeOf("string");
      expect(String(codeExample).trim().length, `Day ${lesson.day}`).toBeGreaterThan(12);
      expect(codeExample, `Day ${lesson.day}`).not.toBe(challenge?.starterCode);
    }
  });

  it("defines useful, unique key terms for every day", () => {
    for (const lesson of curriculum) {
      const keyTerms = Reflect.get(lesson, "keyTerms");

      expect(Array.isArray(keyTerms), `Day ${lesson.day}`).toBe(true);
      expect(keyTerms.length, `Day ${lesson.day}`).toBeGreaterThanOrEqual(2);

      const normalizedTerms = keyTerms.map((entry: unknown) => {
        expect(entry, `Day ${lesson.day}`).toBeTypeOf("object");
        const term = Reflect.get(entry as object, "term");
        const definition = Reflect.get(entry as object, "definition");

        expect(term.trim().length, `Day ${lesson.day} term`).toBeGreaterThanOrEqual(3);
        expect(definition.trim().length, `Day ${lesson.day}: ${term}`).toBeGreaterThanOrEqual(24);
        return term.trim().toLowerCase();
      });

      expect(new Set(normalizedTerms).size, `Day ${lesson.day}`).toBe(normalizedTerms.length);
    }
  });

  it("gives every lesson a substantial professor-style explanation", () => {
    for (const lesson of curriculum) {
      expect(lesson.explanation.trim().length, `Day ${lesson.day}`).toBeGreaterThanOrEqual(180);
    }
  });
});
