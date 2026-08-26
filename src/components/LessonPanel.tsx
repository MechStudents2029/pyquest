import type { Day } from "../domain/types";

interface LessonPanelProps {
  readonly day: Day;
  readonly completed: boolean;
  readonly explanationPoints: readonly string[];
}

export function LessonPanel({
  day,
  completed,
  explanationPoints,
}: LessonPanelProps) {
  return (
    <section
      className={`lesson-card${day.boss ? " boss" : ""}`}
      aria-labelledby="lesson-title"
    >
      <div className="lesson-kicker">
        <span>Day {day.day} of 30</span>
        {day.boss && <span className="status-capsule boss-tag">Boss</span>}
        {completed && <span className="status-capsule cleared-tag">Cleared</span>}
      </div>
      <h1 id="lesson-title">{day.title}</h1>
      <p className="why">{day.why}</p>
      <ul className="lesson-points" aria-label="Lesson notes">
        {explanationPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <aside className="real-world" aria-label="Example">
        <span>Example</span>
        <p>{day.example}</p>
      </aside>
      <section className="key-terms" aria-labelledby="key-terms-title">
        <div className="section-heading">
          <h2 id="key-terms-title">Key terms</h2>
          <span>Glossary</span>
        </div>
        <dl>
          {day.keyTerms.map(({ term, definition }) => (
            <div className="key-term" key={term}>
              <dt>{term}</dt>
              <dd>{definition}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="worked-example" aria-labelledby="worked-example-title">
        <div className="code-heading">
          <h2 id="worked-example-title">Worked example</h2>
          <span>Python</span>
        </div>
        <pre>
          <code className="language-python">{day.codeExample}</code>
        </pre>
      </section>
    </section>
  );
}
