import type { KeyboardEvent } from "react";
import type { Challenge } from "../domain/types";
import { CodeEditor } from "../editor/CodeEditor";

interface ChallengePanelProps {
  readonly challenge: Challenge;
  readonly source: string;
  readonly attempts: number;
  readonly running: boolean;
  readonly runtimeReady: boolean;
  readonly runtimeUnavailable: boolean;
  readonly hintVisible: boolean;
  readonly answerVisible: boolean;
  readonly onSourceChange: (value: string) => void;
  readonly onRun: () => void;
  readonly onReset: () => void;
  readonly onShowHint: () => void;
  readonly onShowAnswer: () => void;
  readonly onRetryRuntime: () => void;
}

export function ChallengePanel({
  challenge,
  source,
  attempts,
  running,
  runtimeReady,
  runtimeUnavailable,
  hintVisible,
  answerVisible,
  onSourceChange,
  onRun,
  onReset,
  onShowHint,
  onShowAnswer,
  onRetryRuntime,
}: ChallengePanelProps) {
  const canRun = runtimeReady && !running;

  function handleShortcut(event: KeyboardEvent<HTMLElement>): void {
    if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey) || event.shiftKey) return;
    event.preventDefault();
    if (canRun) onRun();
  }

  return (
    <section
      className="challenge-card"
      aria-labelledby="challenge-title"
      onKeyDown={handleShortcut}
    >
      <div className="challenge-header">
        <div>
          <span className="eyebrow">Challenge</span>
          <h2 id="challenge-title">{challenge.title}</h2>
        </div>
        <span className="reward">+{challenge.xp} XP</span>
      </div>
      <p className="prompt">{challenge.prompt}</p>
      <div className="action-reserve">
        <div className="action-row" aria-label="Challenge actions">
          <button className="run-button" type="button" disabled={!canRun} onClick={onRun}>
            {running ? "Running..." : "Run tests"}
            <kbd aria-hidden="true">⌘↵</kbd>
          </button>
          <button className="secondary-button" type="button" disabled={running} onClick={onReset}>
            Reset
          </button>
          {attempts >= 2 ? (
            <button className="text-button" type="button" onClick={onShowHint}>
              Show hint
            </button>
          ) : (
            <span className="unlock-note">Hint unlocks after 2 failed runs</span>
          )}
          {attempts >= 4 && (
            <button
              className="text-button"
              type="button"
              aria-controls="reference-solution"
              aria-expanded={answerVisible}
              onClick={onShowAnswer}
            >
              Show answer
            </button>
          )}
          {runtimeUnavailable && (
            <button className="text-button" type="button" onClick={onRetryRuntime}>
              Retry Python
            </button>
          )}
        </div>
      </div>
      {hintVisible && (
        <div className="hint-box">
          <strong>Hint</strong>
          <p>{challenge.hint}</p>
        </div>
      )}
      {answerVisible && (
        <section
          id="reference-solution"
          className="answer-box"
          aria-labelledby="reference-solution-title"
        >
          <div className="code-heading">
            <h3 id="reference-solution-title">Reference solution</h3>
            <span>Python</span>
          </div>
          <p>Compare this with yours, then rewrite it in your own words.</p>
          <pre>
            <code className="language-python">{challenge.solutionCode}</code>
          </pre>
        </section>
      )}
      <div className="editor-chrome">
        <div className="code-heading">
          <span>solution.py</span>
          <span>Python</span>
        </div>
        <CodeEditor value={source} onChange={onSourceChange} disabled={running} />
      </div>
    </section>
  );
}
