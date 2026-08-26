import { useEffect, useMemo, useRef, useState } from "react";
import { ChallengePanel } from "./components/ChallengePanel";
import { CoachRail } from "./components/CoachRail";
import { LessonPanel } from "./components/LessonPanel";
import { QuestLog } from "./components/QuestLog";
import { ResultsPanel } from "./components/ResultsPanel";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { analyzeFailure } from "./domain/coach";
import type { CoachRunState } from "./domain/coachChat";
import {
  recordFailure,
  recordSuccess,
  selectDay,
  updateDraft,
} from "./domain/progress";
import type { Progress, RunOutput } from "./domain/types";
import { curriculum, getDay } from "./data/curriculum";
import {
  getBrowserPythonRuntime,
  type RuntimeClient,
  type RuntimeState,
} from "./runtime/PythonRuntime";
import { loadProgress, saveProgress } from "./storage/progressStorage";

type StoragePort = Pick<Storage, "getItem" | "setItem">;

interface AppProps {
  readonly runtime?: RuntimeClient;
  readonly storage?: StoragePort;
}

export default function App({ runtime, storage = window.localStorage }: AppProps) {
  const [runtimeClient] = useState<RuntimeClient>(
    () => runtime ?? getBrowserPythonRuntime(),
  );
  const [runtimeState, setRuntimeState] = useState<RuntimeState>({ kind: "booting" });
  const [progress, setProgress] = useState<Progress>(() => loadProgress(storage));
  const selected = getDay(progress.selectedDay);
  const challenge = selected.challenges[0];
  if (challenge === undefined) throw new Error(`Day ${selected.day} has no challenge`);

  const [source, setSource] = useState(
    () => progress.drafts[challenge.id] ?? challenge.starterCode,
  );
  const [output, setOutput] = useState<RunOutput | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const courseTriggerRef = useRef<HTMLButtonElement>(null);
  const courseDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return runtimeClient.subscribe((state) => {
      setRuntimeState(state);
    });
  }, [runtimeClient]);

  useEffect(() => {
    saveProgress(storage, progress);
  }, [progress, storage]);

  useEffect(() => {
    if (!menuOpen) return;
    const drawer = courseDrawerRef.current;
    if (drawer === null) return;
    const focusable = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    focusable()[0]?.focus();

    function handleDrawerKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCourse();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = focusable();
      const first = controls[0];
      const last = controls.at(-1);
      if (first === undefined || last === undefined) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDrawerKeyDown);
    return () => document.removeEventListener("keydown", handleDrawerKeyDown);
  }, [menuOpen]);

  const attempts = progress.attempts[challenge.id] ?? 0;
  const completed = progress.completedChallenges.includes(challenge.id);
  const explanationPoints = useMemo(
    () => selected.explanation.split(/(?<=[.!?])\s+/),
    [selected.explanation],
  );
  const runPassed =
    output !== null &&
    output.results.length === challenge.tests.length &&
    output.results.every((result) => result.kind === "passed");
  const coachRunState: CoachRunState =
    output === null ? "not-run" : runPassed ? "passed" : "failed";
  const coachDiagnosis = useMemo(() => {
    if (output === null || runPassed) {
      return null;
    }

    return analyzeFailure({ source, challenge, output });
  }, [challenge, output, runPassed, source]);
  const dayChallengeIds = useMemo(
    () => selected.challenges.map((item) => item.id),
    [selected.challenges],
  );

  function closeCourse(): void {
    courseTriggerRef.current?.focus();
    setMenuOpen(false);
  }

  function chooseDay(dayNumber: number): void {
    const nextDay = getDay(dayNumber);
    const nextChallenge = nextDay.challenges[0];
    if (nextChallenge === undefined) return;
    setProgress((current) =>
      selectDay(updateDraft(current, challenge.id, source), dayNumber),
    );
    setSource(progress.drafts[nextChallenge.id] ?? nextChallenge.starterCode);
    setOutput(null);
    setRunError(null);
    setHintVisible(false);
    setAnswerVisible(false);
    closeCourse();
  }

  function changeSource(value: string): void {
    setSource(value);
    setProgress((current) => updateDraft(current, challenge.id, value));
    setOutput(null);
    setRunError(null);
  }

  async function runTests(): Promise<void> {
    setRunning(true);
    setRunError(null);
    setProgress((current) => updateDraft(current, challenge.id, source));

    try {
      const result = await runtimeClient.run({
        source,
        tests: challenge.tests,
        packages: challenge.packages ?? [],
      });
      setOutput(result);
      const passed =
        result.results.length === challenge.tests.length &&
        result.results.every((item) => item.kind === "passed");
      setProgress((current) =>
        passed
          ? recordSuccess(current, {
              challengeId: challenge.id,
              day: selected.day,
              dayChallengeIds,
              xp: challenge.xp,
              date: localDateKey(new Date()),
            })
          : recordFailure(current, challenge.id),
      );
    } catch (error) {
      setRunError(error instanceof Error ? error.message : String(error));
      setProgress((current) => recordFailure(current, challenge.id));
    } finally {
      setRunning(false);
    }
  }

  function resetCode(): void {
    changeSource(challenge.starterCode);
    setOutput(null);
    setRunError(null);
  }

  return (
    <div className="app-shell">
      <div
        id="course-drawer"
        ref={courseDrawerRef}
        className={`quest-drawer ${menuOpen ? "open" : ""}`}
        role={menuOpen ? "dialog" : undefined}
        aria-label={menuOpen ? "Quest log" : undefined}
        aria-modal={menuOpen ? true : undefined}
      >
        <button className="drawer-close" type="button" aria-label="Close quest log" onClick={closeCourse}>
          <span aria-hidden="true">×</span>
        </button>
        <QuestLog
          days={curriculum}
          progress={progress}
          selectedDay={selected.day}
          onSelect={chooseDay}
        />
      </div>
      {menuOpen && (
        <button
          className="drawer-scrim"
          aria-label="Close quest log"
          onClick={closeCourse}
        />
      )}
      <main className="workspace">
        <WorkspaceHeader
          runtimeState={runtimeState}
          xp={progress.xp}
          streak={progress.streak}
          courseOpen={menuOpen}
          courseTriggerRef={courseTriggerRef}
          onOpenCourse={() => setMenuOpen(true)}
        />
        <LessonPanel
          day={selected}
          completed={completed}
          explanationPoints={explanationPoints}
        />
        <ChallengePanel
          challenge={challenge}
          source={source}
          attempts={attempts}
          running={running}
          runtimeReady={runtimeState.kind === "ready"}
          runtimeUnavailable={runtimeState.kind === "error"}
          hintVisible={hintVisible}
          answerVisible={answerVisible}
          onSourceChange={changeSource}
          onRun={() => void runTests()}
          onReset={resetCode}
          onShowHint={() => setHintVisible(true)}
          onShowAnswer={() => setAnswerVisible(true)}
          onRetryRuntime={() => runtimeClient.retry()}
        />
        <ResultsPanel
          output={output}
          running={running}
          runtimeError={runtimeState.kind === "error" ? runtimeState.message : runError}
        />
      </main>
      <CoachRail
        key={selected.day}
        day={selected}
        challenge={challenge}
        diagnosis={coachDiagnosis}
        runState={coachRunState}
        conversationKey={`${challenge.id}:${output === null ? "draft" : `${coachRunState}:${attempts}`}`}
        explanationPoints={explanationPoints}
      />
      <footer>
        <span>Runs in your browser</span>
        <span>Progress saved on this device</span>
      </footer>
    </div>
  );
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
