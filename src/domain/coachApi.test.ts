import { describe, expect, it } from "vitest";
import type { CoachChatContext } from "./coachChat";
import type { CoachDiagnosis } from "./types";
import { buildCoachPrompt, shouldEscalateToAi } from "./coachApi";
import { answerCoachQuestion } from "./coachChat";

const baseContext: CoachChatContext = {
  day: {
    day: 1,
    title: "Variables & print()",
    why: "Names let programs remember values.",
    explanationPoints: ["Variables give values useful names."],
    keyTerms: [{ term: "Variable", definition: "A name that refers to a value." }],
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

describe("coachApi", () => {
  it("builds a prompt containing the learner question and challenge prompt", () => {
    const prompt = buildCoachPrompt(baseContext, "Can you explain it?");

    expect(prompt).toContain("Learner question: Can you explain it?");
    expect(prompt).toContain(`Challenge prompt: ${baseContext.challenge.prompt}`);
    expect(prompt).toContain(`Day: ${baseContext.day.title}`);
  });

  it("escalates only on the local generic fallback", () => {
    const genericReply = answerCoachQuestion(
      "Can you walk me through the task step-by-step?",
      baseContext,
    );
    expect(shouldEscalateToAi("Can you walk me through the task step-by-step?", genericReply)).toBe(true);

    const nonGenericReply = answerCoachQuestion("Explain the concept", {
      ...baseContext,
      runState: "failed",
      diagnosis: literalPlaceholderDiagnosis,
    });
    expect(shouldEscalateToAi("Explain the concept", nonGenericReply)).toBe(false);
  });
});

