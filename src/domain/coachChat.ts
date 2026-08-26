import type { Challenge, CoachDiagnosis, Day, KeyTerm } from "./types";

export type CoachRunState = "not-run" | "failed" | "passed";

interface CoachChatDay
  extends Pick<Day, "day" | "title" | "why"> {
  readonly explanationPoints: readonly string[];
  readonly keyTerms: readonly KeyTerm[];
}

type CoachChatChallenge = Pick<Challenge, "title" | "prompt" | "hint">;

export interface CoachChatContext {
  readonly day: CoachChatDay;
  readonly challenge: CoachChatChallenge;
  readonly runState: CoachRunState;
  readonly diagnosis: CoachDiagnosis | null;
}

export const GENERIC_FALLBACK_PREFIX = "Ask me why a test failed";

export function isGenericFallback(reply: string): boolean {
  return reply.startsWith(GENERIC_FALLBACK_PREFIX);
}

export function getCoachWelcome(context: CoachChatContext): string {
  if (context.runState === "passed") {
    return `All tests passed for ${context.challenge.title}. Ask me to explain the concept or review why the solution works.`;
  }

  if (context.runState === "failed" && context.diagnosis !== null) {
    return `${context.diagnosis.title}. ${context.diagnosis.summary} ${context.diagnosis.reason}`;
  }

  const firstPoint = context.day.explanationPoints[0] ?? context.day.why;
  return `${context.day.title}: ${context.day.why} ${firstPoint}`;
}

export function answerCoachQuestion(
  question: string,
  context: CoachChatContext,
): string {
  const normalized = question.trim().toLowerCase();

  if (context.runState === "passed") {
    if (asksAboutConcept(normalized)) {
      return explainConcept(context);
    }
    return `All tests passed. Your returned values matched the challenge contract for ${context.challenge.title}.`;
  }

  if (asksForHint(normalized)) {
    return `Try this hint: ${context.challenge.hint}`;
  }

  if (asksAboutConcept(normalized)) {
    return context.diagnosis?.concept ?? explainConcept(context);
  }

  if (asksForNextStep(normalized)) {
    return (
      context.diagnosis?.nextStep ??
      `Start with the contract: ${context.challenge.prompt} Identify the input and the value your function must return.`
    );
  }

  if (asksWhyItFailed(normalized)) {
    if (context.diagnosis !== null) {
      return `${context.diagnosis.summary} ${context.diagnosis.reason}`;
    }
    return "I do not have a failed result to inspect yet. Run the tests, then I can compare what Python returned with what the challenge expected.";
  }

  if (normalized.includes("lesson") || normalized.includes("explain")) {
    return getCoachWelcome(context);
  }

  if (context.diagnosis !== null) {
    return `${context.diagnosis.summary} ${context.diagnosis.nextStep}`;
  }

  return `Ask me why a test failed, what to change, for a hint, or about the lesson concept. The current task is: ${context.challenge.prompt}`;
}

function asksForHint(question: string): boolean {
  return question.includes("hint") || question.includes("nudge");
}

function asksAboutConcept(question: string): boolean {
  return (
    question.includes("concept") ||
    question.includes("remember") ||
    question.includes("key idea") ||
    question.includes("definition")
  );
}

function asksForNextStep(question: string): boolean {
  return (
    question.includes("change") ||
    question.includes("fix") ||
    question.includes("next") ||
    question.includes("check") ||
    question.includes("do now")
  );
}

function asksWhyItFailed(question: string): boolean {
  return (
    question.includes("wrong") ||
    question.includes("why") ||
    question.includes("looks right") ||
    question.includes("failed") ||
    question.includes("result")
  );
}

function explainConcept(context: CoachChatContext): string {
  const terms = context.day.keyTerms
    .map(({ term, definition }) => `${term}: ${definition}`)
    .join(" ");
  return terms || context.day.why;
}
