import { isDayUnlocked } from "../domain/progress";
import type { Day, Progress } from "../domain/types";

interface QuestLogProps {
  readonly days: readonly Day[];
  readonly progress: Progress;
  readonly selectedDay: number;
  readonly onSelect: (day: number) => void;
}

export function QuestLog({ days, progress, selectedDay, onSelect }: QuestLogProps) {
  return (
    <aside className="quest-log" aria-label="Quest log">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          Py
        </span>
        <div>
          <strong>PyQuest</strong>
          <small>30-day Python quest</small>
        </div>
      </div>
      <div className="quest-heading">
        <span>Quest log</span>
        <span>
          {progress.clearedDays.length} of 30 cleared
        </span>
      </div>
      <nav aria-label="30-day python course">
        {days.map((item) => {
          const unlocked = isDayUnlocked(progress, item.day);
          const cleared = progress.clearedDays.includes(item.day);
          return (
            <button
              className={[
                "quest-item",
                selectedDay === item.day ? "selected" : "",
                cleared ? "cleared" : "",
                item.boss ? "boss" : "",
              ].join(" ")}
              disabled={!unlocked}
              key={item.day}
              onClick={() => onSelect(item.day)}
              aria-current={selectedDay === item.day ? "page" : undefined}
              aria-label={`Day ${item.day}: ${item.title}${!unlocked ? ", locked" : ""}`}
            >
              <span className="quest-state" aria-hidden="true">
                {cleared ? "✓" : unlocked ? String(item.day).padStart(2, "0") : "Locked"}
              </span>
              <span>
                <small>{item.boss ? "Boss" : `Day ${item.day}`}</small>
                <strong>{item.title.replace(" · Boss battle", "")}</strong>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
