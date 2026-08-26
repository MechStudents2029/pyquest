import { loadPyodide, version, type PyodideAPI } from "pyodide";
import type { RunOutput, TestResult } from "../domain/types";
import type { RuntimeMessage } from "./PythonRuntime";
import { buildPythonHarness } from "./pythonHarness";

declare const self: DedicatedWorkerGlobalScope;

let pyodide: PyodideAPI | null = null;

self.addEventListener("message", (event: MessageEvent<RuntimeMessage>) => {
  const message = event.data;
  if (message.kind === "boot") {
    void boot();
  } else if (message.kind === "run") {
    void run(message);
  }
});

async function boot(): Promise<void> {
  if (pyodide !== null) {
    self.postMessage({ kind: "ready" } satisfies RuntimeMessage);
    return;
  }

  try {
    pyodide = await loadPyodide({
      indexURL: `https://cdn.jsdelivr.net/pyodide/v${version}/full/`,
    });
    self.postMessage({ kind: "ready" } satisfies RuntimeMessage);
  } catch (error) {
    self.postMessage({
      kind: "boot-error",
      message: error instanceof Error ? error.message : String(error),
    } satisfies RuntimeMessage);
  }
}

async function run(message: Extract<RuntimeMessage, { kind: "run" }>): Promise<void> {
  const runtime = pyodide;
  if (runtime === null) {
    self.postMessage({
      kind: "run-result",
      requestId: message.requestId,
      output: {
        stdout: "",
        stderr: "",
        results: message.tests.map((item) => ({
          kind: "error",
          label: item.label,
          traceback: "Python runtime is not ready.",
        })),
      },
    } satisfies RuntimeMessage);
    return;
  }

  try {
    if (message.packages.length > 0) {
      await runtime.loadPackage([...message.packages]);
    }
    const serialized = await runtime.runPythonAsync(
      buildPythonHarness(message.source, message.tests),
    );
    const output = parseRunOutput(serialized);
    self.postMessage({
      kind: "run-result",
      requestId: message.requestId,
      output,
    } satisfies RuntimeMessage);
  } catch (error) {
    self.postMessage({
      kind: "run-result",
      requestId: message.requestId,
      output: {
        stdout: "",
        stderr: "",
        results: message.tests.map((item) => ({
          kind: "error",
          label: item.label,
          traceback: error instanceof Error ? error.message : String(error),
        })),
      },
    } satisfies RuntimeMessage);
  }
}

function parseRunOutput(value: unknown): RunOutput {
  if (typeof value !== "string") {
    throw new Error("Python harness returned a non-string result");
  }
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Python harness returned invalid output");
  }
  const stdout = Reflect.get(parsed, "stdout");
  const stderr = Reflect.get(parsed, "stderr");
  const results = Reflect.get(parsed, "results");
  if (
    typeof stdout !== "string" ||
    typeof stderr !== "string" ||
    !Array.isArray(results) ||
    !results.every(isTestResult)
  ) {
    throw new Error("Python harness returned malformed output");
  }
  return { stdout, stderr, results };
}

function isTestResult(value: unknown): value is TestResult {
  if (typeof value !== "object" || value === null) return false;
  const kind = Reflect.get(value, "kind");
  const label = Reflect.get(value, "label");
  if (typeof label !== "string") return false;
  if (kind === "passed") return true;
  if (kind === "failed") {
    return (
      typeof Reflect.get(value, "expected") === "string" &&
      typeof Reflect.get(value, "actual") === "string"
    );
  }
  return kind === "error" && typeof Reflect.get(value, "traceback") === "string";
}
