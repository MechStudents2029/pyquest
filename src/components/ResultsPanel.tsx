import type { RunOutput } from "../domain/types";

interface ResultsPanelProps {
  readonly output: RunOutput | null;
  readonly running: boolean;
  readonly runtimeError: string | null;
}

export function ResultsPanel({ output, running, runtimeError }: ResultsPanelProps) {
  return (
    <section
      className="results-panel"
      role="region"
      aria-labelledby="results-title"
      aria-live="polite"
    >
      <div className="results-heading">
        <h2 id="results-title">Results</h2>
        <span>{running ? "Running" : output === null ? "Ready" : "Finished"}</span>
      </div>
      <div className="terminal-output" tabIndex={0}>
        {running && <p className="terminal-muted">$ python tests.py</p>}
        {!running && output === null && runtimeError === null && (
          <p className="terminal-muted">Run tests to see results.</p>
        )}
        {runtimeError !== null && (
          <div className="result-row result-error">
            <strong>
              <span aria-hidden="true">!</span> Python error
            </strong>
            <pre>{runtimeError}</pre>
          </div>
        )}
        {output?.stdout && (
          <pre>
            <span className="stream-label">stdout</span>
            {"\n"}
            {output.stdout}
          </pre>
        )}
        {output?.stderr && (
          <pre className="result-error">
            <span className="stream-label">stderr</span>
            {"\n"}
            {output.stderr}
          </pre>
        )}
        {output?.results.map((result, index) => {
          if (result.kind === "passed") {
            return (
              <p className="result-row result-pass" key={`${result.label}-${index}`}>
                <span aria-hidden="true">✓</span> PASS {result.label}
              </p>
            );
          }
          if (result.kind === "failed") {
            return (
              <div className="result-row result-fail" key={`${result.label}-${index}`}>
                <p>
                  <span aria-hidden="true">×</span> FAIL {result.label}
                </p>
                <p>
                  expected {result.expected}; received {result.actual}
                </p>
              </div>
            );
          }
          return (
            <div className="result-row result-error" key={`${result.label}-${index}`}>
              <p>
                <span aria-hidden="true">!</span> ERROR {result.label}
              </p>
              <pre>{result.traceback}</pre>
            </div>
          );
        })}
      </div>
    </section>
  );
}
