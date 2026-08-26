import { useEffect, useMemo, useRef, useState } from "react";
import {
  answerCoachQuestion,
  getCoachWelcome,
  type CoachChatContext,
  type CoachRunState,
} from "../domain/coachChat";
import {
  askAnthropicCoach,
  askAnthropicCoachWithHistory,
  shouldEscalateToAi,
  type CoachTurn,
} from "../domain/coachApi";
import type { Challenge, CoachDiagnosis, Day } from "../domain/types";

interface CoachRailProps {
  readonly day: Day;
  readonly challenge: Challenge;
  readonly diagnosis: CoachDiagnosis | null;
  readonly runState: CoachRunState;
  readonly conversationKey: string;
  readonly explanationPoints: readonly string[];
}

interface ChatMessage {
  readonly id: number;
  readonly role: "coach" | "learner";
  readonly content: string;
}

const suggestedQuestions = [
  "My code looks right",
  "What should I change?",
  "Explain the concept",
  "Give me a hint",
] as const;

export function CoachRail({
  day,
  challenge,
  diagnosis,
  runState,
  conversationKey,
  explanationPoints,
}: CoachRailProps) {
  const context = useMemo<CoachChatContext>(
    () => ({
      day: {
        day: day.day,
        title: day.title,
        why: day.why,
        explanationPoints,
        keyTerms: day.keyTerms,
      },
      challenge: {
        title: challenge.title,
        prompt: challenge.prompt,
        hint: challenge.hint,
      },
      runState,
      diagnosis,
    }),
    [challenge.hint, challenge.prompt, challenge.title, day, diagnosis, explanationPoints, runState],
  );
  const nextMessageId = useRef(1);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<readonly ChatMessage[]>(() => [
    { id: 0, role: "coach", content: getCoachWelcome(context) },
  ]);
  const [coachStatus, setCoachStatus] = useState<"Local" | "AI · Haiku">("Local");
  const [coachError, setCoachError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [aiHistory, setAiHistory] = useState<readonly CoachTurn[]>([]);

  useEffect(() => {
    nextMessageId.current = 1;
    setDraft("");
    setMessages([{ id: 0, role: "coach", content: getCoachWelcome(context) }]);
    setCoachStatus("Local");
    setCoachError(null);
    setIsThinking(false);
    setAiHistory([]);
  }, [context, conversationKey]);

  async function sendMessage(question: string): Promise<void> {
    const content = question.trim();
    if (content.length === 0) return;
    if (isThinking) return;

    const learnerMessage: ChatMessage = {
      id: nextMessageId.current,
      role: "learner",
      content,
    };
    nextMessageId.current += 1;

    const coachMessageId = nextMessageId.current;
    const localReply = answerCoachQuestion(content, context);
    const escalate = shouldEscalateToAi(content, localReply);
    const useAi = coachStatus === "AI · Haiku" || escalate;

    const coachMessage: ChatMessage = {
      id: coachMessageId,
      role: "coach",
      content: useAi ? "Thinking..." : localReply,
    };
    nextMessageId.current += 1;

    setCoachError(null);
    setIsThinking(useAi);
    setCoachStatus("Local");
    if (coachStatus === "AI · Haiku") {
      setCoachStatus("AI · Haiku");
    }

    setMessages((current) => [...current, learnerMessage, coachMessage]);
    setDraft("");

    if (!useAi) return;

    try {
      const aiReply =
        coachStatus === "AI · Haiku"
          ? await askAnthropicCoachWithHistory(content, context, aiHistory)
          : await askAnthropicCoach(content, context);
      setMessages((current) =>
        current.map((message) =>
          message.id === coachMessageId && message.role === "coach"
            ? { ...message, content: aiReply }
            : message,
        ),
      );
      setCoachStatus("AI · Haiku");
      setAiHistory((prev) => [
        ...prev,
        { role: "user", content },
        { role: "assistant", content: aiReply },
      ]);
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === coachMessageId && message.role === "coach"
            ? { ...message, content: localReply }
            : message,
        ),
      );
      setCoachStatus("Local");
      setCoachError("AI unavailable. Using the local coach.");
      setAiHistory([]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <aside className="coach-rail" aria-labelledby="coach-title">
      <div className="coach-rail-inner">
        <header className="coach-rail-header">
          <div>
            <h2 id="coach-title">Coach</h2>
            <span>{isThinking ? "Thinking..." : coachStatus}</span>
          </div>
        </header>

        <section className="coach-chat" aria-label={`Coach for ${day.title}`}>
          <div className="coach-chat-context">
            <span>Day {day.day}</span>
            <strong>{day.title}</strong>
            <small>
              {runState === "failed"
                ? "Last run failed"
                : runState === "passed"
                  ? "Tests passed"
                  : "Ask about this day"}
            </small>
          </div>

          <div
            className="coach-chat-log"
            role="log"
            aria-label="Coach conversation"
            aria-live="polite"
          >
            {messages.map((message) => (
              <article
                className={`chat-message chat-message-${message.role}`}
                key={message.id}
              >
                <span>{message.role === "coach" ? "Coach" : "You"}</span>
                <p>{message.content}</p>
              </article>
            ))}
          </div>

          <div className="coach-suggestions" aria-label="Suggested questions">
            {suggestedQuestions.map((question) => (
              <button
                type="button"
                key={question}
                onClick={() => {
                  void sendMessage(question);
                }}
              >
                {question}
              </button>
            ))}
          </div>

          <form
            className="coach-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(draft);
            }}
          >
            <label htmlFor="coach-message">Ask the coach</label>
            <div>
              <input
                id="coach-message"
                value={draft}
                placeholder="Why it failed, what to change, or a hint"
                autoComplete="off"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(draft);
                  }
                }}
              />
              <button type="submit" disabled={draft.trim().length === 0 || isThinking}>
                Send
              </button>
            </div>
          </form>

          <div className="coach-privacy-note">
            <span aria-hidden="true">●</span>
            Code and chat stay in this browser. AI calls use your local dev server.
            {coachError !== null ? <small>{coachError}</small> : null}
          </div>
        </section>
      </div>
    </aside>
  );
}
