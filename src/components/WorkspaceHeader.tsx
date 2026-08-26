import type { RefObject } from "react";
import { getLevel, getLevelProgress } from "../domain/progress";
import type { RuntimeState } from "../runtime/PythonRuntime";

interface WorkspaceHeaderProps {
  readonly runtimeState: RuntimeState;
  readonly xp: number;
  readonly streak: number;
  readonly courseOpen: boolean;
  readonly courseTriggerRef: RefObject<HTMLButtonElement | null>;
  readonly onOpenCourse: () => void;
}

export function WorkspaceHeader({
  runtimeState,
  xp,
  streak,
  courseOpen,
  courseTriggerRef,
  onOpenCourse,
}: WorkspaceHeaderProps) {
  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const runtimeText =
    runtimeState.kind === "booting"
      ? "Starting Python"
      : runtimeState.kind === "ready"
        ? "Python ready"
        : "Python unavailable";
  const runtimeIcon =
    runtimeState.kind === "booting" ? "◷" : runtimeState.kind === "ready" ? "✓" : "!";

  return (
    <header className="workspace-header">
      <div className="workspace-brand">
        <button
          ref={courseTriggerRef}
          className="course-trigger"
          type="button"
          aria-controls="course-drawer"
          aria-expanded={courseOpen}
          onClick={onOpenCourse}
        >
          Quest log
        </button>
        <strong>PyQuest</strong>
      </div>
      <div
        className={`runtime-status runtime-${runtimeState.kind}`}
        aria-live="polite"
      >
        <span className="runtime-icon" aria-hidden="true">
          {runtimeIcon}
        </span>
        <span>{runtimeText}</span>
      </div>
      <div className="progress-summary">
        <span className="hud-chip">Level {level}</span>
        <div
          className="level-track"
          role="progressbar"
          aria-label="Level progress"
          aria-valuemin={0}
          aria-valuemax={300}
          aria-valuenow={levelProgress}
        >
          <span style={{ width: `${(levelProgress / 300) * 100}%` }} />
        </div>
        <strong className="hud-chip hud-chip-xp">{xp} XP</strong>
        <span className="hud-chip hud-chip-streak">{streak} day streak</span>
      </div>
    </header>
  );
}
