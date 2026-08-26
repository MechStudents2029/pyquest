import { describe, expect, it } from "vitest";
import type { CoachDiagnosis } from "./types";
import {
  answerCoachQuestion,
  getCoachWelcome,
  isGenericFallback,
  type CoachChatContext,
} from "./coachChat";

describe("local coach chat", () => {
  it("starts with lesson guidance before code is run", () => {
    expect(getCoachWelcome(baseContext)).toMatch(/variables.*useful names/i);
  });

  it("detects the generic fallback when no diagnosis exists", () => {
    const reply = answerCoachQuestion(
      "Can you walk me through the task step-by-step?",
      baseContext,
    );

    expect(isGenericFallback(reply)).toBe(true);
    expect(reply).toMatch(/the current task is:/i);
  });

  it("explains the exact evidence when code looks right", () => {
    const reply = answerCoachQuestion("My code looks right. Why is it wrong?", {
      ...baseContext,
      runState: "failed",
      diagnosis: literalPlaceholderDiagnosis,
    });

    expect(reply).toMatch(/'Hello, \{name\}!'./i);
    expect(reply).toMatch(/'Hello, Ada!'/i);
    expect(reply).toMatch(/ordinary string/i);
  });

  it("answers next-step, concept, and hint questions", () => {
    const context: CoachChatContext = {
      ...baseContext,
      runState: "failed",
      diagnosis: literalPlaceholderDiagnosis,
    };

    expect(answerCoachQuestion("What should I change?", context)).toMatch(/prefix.*`f`/i);
    expect(answerCoachQuestion("Explain the concept", context)).toMatch(/interpolation/i);
    expect(answerCoachQuestion("Give me a hint", context)).toBe("Try this hint: Use an f-string.");
  });

  it("acknowledges a successful run without inventing a problem", () => {
    expect(
      answerCoachQuestion("Why is this wrong?", {
        ...baseContext,
        runState: "passed",
      }),
    ).toMatch(/all tests passed/i);
  });

  it("never receives or reveals reference solutions and hidden labels", () => {
    const serialized = JSON.stringify({
      welcome: getCoachWelcome(baseContext),
      reply: answerCoachQuestion("Help me", baseContext),
    });

    expect(serialized).not.toContain("return f'Hello");
    expect(serialized).not.toContain("hidden edge case");
  });
});

const baseContext: CoachChatContext = {
  day: {
    day: 1,
    title: "Variables & print()",
    why: "Names let programs remember values.",
    explanationPoints: ["Variables give values useful names."],
    keyTerms: [
      {
        term: "Variable",
        definition: "A name that refers to a value.",
      },
    ],
  },
  challenge: {
    title: "Signal hello",
    prompt: "Return a personalized greeting.",
    hint: "Use an f-string.",
  },
  runState: "not-run",
  diagnosis: null,
};

const literalPlaceholderDiagnosis: CoachDiagnosis = {
  kind: "literal-placeholder",
  title: "Python returned the placeholder literally",
  summary: "Your function returned 'Hello, {name}!', but Python expected 'Hello, Ada!'.",
  reason: "An ordinary string keeps braces as text.",
  nextStep: "Prefix the string with `f` to make it an f-string.",
  concept: "String interpolation inserts computed values into text.",
};
