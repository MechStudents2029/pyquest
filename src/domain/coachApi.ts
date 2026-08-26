import type { CoachChatContext } from "./coachChat";
import { GENERIC_FALLBACK_PREFIX, isGenericFallback } from "./coachChat";

export type CoachTurn = Readonly<{ role: "user" | "assistant"; content: string }>;

export function buildCoachPrompt(
  context: CoachChatContext,
  question: string,
  history?: readonly CoachTurn[],
): string {
  const diagnosis = context.diagnosis
    ? `${context.diagnosis.title}\nSummary: ${context.diagnosis.summary}\nReason: ${context.diagnosis.reason}\nNext: ${context.diagnosis.nextStep}`
    : "No diagnosis available yet.";

  const recentTurns = (history ?? []).slice(-8);
  const transcript =
    recentTurns.length === 0
      ? ""
      : `Chat so far (most recent last):\n${recentTurns
          .map((turn) => `${turn.role === "user" ? "User" : "Coach"}: ${turn.content}`)
          .join("\n")}\n\n`;

  // Keep the prompt compact: cheaper tokens and consistent coaching.
  return [
    "You are a careful coding tutor for this Python lesson.",
    "Rules:",
    "- Do not reveal any reference/hidden solution code or hidden test labels.",
    "- Be short and practical (3-7 sentences).",
    "- Prefer questions and actionable next steps.",
    "",
    `Day: ${context.day.title} (day ${context.day.day})`,
    `Challenge prompt: ${context.challenge.prompt}`,
    `Challenge hint: ${context.challenge.hint}`,
    `Run state: ${context.runState}`,
    `Diagnosis:\n${diagnosis}`,
    "",
    transcript ? transcript.trimEnd() : "",
    `Learner question: ${question}`,
  ].join("\n");
}

export function shouldEscalateToAi(
  _question: string,
  localReply: string,
): boolean {
  // Credit-efficient behavior: only escalate when local coaching returns the generic fallback.
  return localReply.startsWith(GENERIC_FALLBACK_PREFIX) && isGenericFallback(localReply);
}

export async function askAnthropicCoach(
  question: string,
  context: CoachChatContext,
): Promise<string> {
  const prompt = buildCoachPrompt(context, question);

  const response = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Coach API error: ${response.status}`);
  }

  const body: unknown = await response.json();
  if (
    typeof body === "object" &&
    body !== null &&
    "text" in body &&
    typeof (body as { text: unknown }).text === "string"
  ) {
    return (body as { text: string }).text;
  }

  throw new Error("Invalid coach API response");
}

export async function askAnthropicCoachWithHistory(
  question: string,
  context: CoachChatContext,
  history: readonly CoachTurn[],
): Promise<string> {
  const prompt = buildCoachPrompt(context, question, history);

  const response = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Coach API error: ${response.status}`);
  }

  const body: unknown = await response.json();
  if (
    typeof body === "object" &&
    body !== null &&
    "text" in body &&
    typeof (body as { text: unknown }).text === "string"
  ) {
    return (body as { text: string }).text;
  }

  throw new Error("Invalid coach API response");
}

