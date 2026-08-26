import { describe, expect, it, vi } from "vitest";
import {
  PythonRuntime,
  type RuntimeMessage,
  type RuntimeState,
  type WorkerPort,
} from "./PythonRuntime";

describe("PythonRuntime", () => {
  it("boots and tracks ready state", () => {
    const worker = new FakeWorker();
    const runtime = new PythonRuntime(() => worker);
    const states: string[] = [];
    runtime.subscribe((state) => states.push(state.kind));

    expect(worker.messages[0]).toEqual({ kind: "boot" });
    worker.emit({ kind: "ready" });

    expect(states).toEqual(["booting", "ready"]);
  });

  it("correlates a run result with its request", async () => {
    const worker = new FakeWorker();
    const runtime = new PythonRuntime(() => worker);
    worker.emit({ kind: "ready" });

    const pending = runtime.run({ source: "def x(): return 1", tests: [], packages: [] });
    const runMessage = worker.messages[1];
    expect(runMessage?.kind).toBe("run");
    if (runMessage?.kind !== "run") throw new Error("Expected run request");

    worker.emit({
      kind: "run-result",
      requestId: runMessage.requestId,
      output: { stdout: "", stderr: "", results: [] },
    });

    await expect(pending).resolves.toEqual({ stdout: "", stderr: "", results: [] });
  });

  it("replaces a timed-out worker and boots the replacement", async () => {
    vi.useFakeTimers();
    const first = new FakeWorker();
    const second = new FakeWorker();
    const workers = [first, second];
    const runtime = new PythonRuntime(() => {
      const worker = workers.shift();
      if (worker === undefined) throw new Error("No worker");
      return worker;
    }, 25);
    first.emit({ kind: "ready" });

    const pending = runtime.run({ source: "while True: pass", tests: [], packages: [] });
    vi.advanceTimersByTime(25);

    await expect(pending).rejects.toThrow("timed out");
    expect(first.terminated).toBe(true);
    expect(second.messages).toEqual([{ kind: "boot" }]);
    vi.useRealTimers();
  });

  it("reports boot errors", () => {
    const worker = new FakeWorker();
    const runtime = new PythonRuntime(() => worker);
    const states: string[] = [];
    runtime.subscribe((state) => states.push(state.kind));

    worker.emit({ kind: "boot-error", message: "CDN unavailable" });

    expect(states).toEqual(["booting", "error"]);
  });

  it("reports worker startup failures instead of staying booting", () => {
    const worker = new FakeWorker();
    const runtime = new PythonRuntime(() => worker);
    const states: RuntimeState[] = [];
    runtime.subscribe((state) => states.push(state));

    worker.emitError("Failed to load Python worker");

    expect(states).toEqual([
      { kind: "booting" },
      { kind: "error", message: "Failed to load Python worker" },
    ]);
  });

  it("reports a stalled boot and allows a retry", () => {
    vi.useFakeTimers();
    const first = new FakeWorker();
    const second = new FakeWorker();
    const workers = [first, second];
    const runtime = new PythonRuntime(
      () => {
        const worker = workers.shift();
        if (worker === undefined) throw new Error("No worker");
        return worker;
      },
      8_000,
      25,
    );
    const states: RuntimeState[] = [];
    runtime.subscribe((state) => states.push(state));

    vi.advanceTimersByTime(25);

    expect(first.terminated).toBe(true);
    expect(states.at(-1)).toEqual({
      kind: "error",
      message: "Python runtime did not start. Check your connection, then retry.",
    });

    runtime.retry();

    expect(second.messages).toEqual([{ kind: "boot" }]);
    expect(states.at(-1)).toEqual({ kind: "booting" });
    vi.useRealTimers();
  });
});

class FakeWorker implements WorkerPort {
  readonly messages: RuntimeMessage[] = [];
  terminated = false;
  #listener: ((event: MessageEvent<RuntimeMessage>) => void) | null = null;
  #errorListener: ((event: ErrorEvent) => void) | null = null;

  postMessage(message: RuntimeMessage): void {
    this.messages.push(message);
  }

  addEventListener(
    _type: "message",
    listener: (event: MessageEvent<RuntimeMessage>) => void,
  ): void {
    this.#listener = listener;
  }

  removeEventListener(): void {}

  addErrorEventListener(listener: (event: ErrorEvent) => void): void {
    this.#errorListener = listener;
  }

  removeErrorEventListener(): void {}

  terminate(): void {
    this.terminated = true;
  }

  emit(message: RuntimeMessage): void {
    this.#listener?.(new MessageEvent("message", { data: message }));
  }

  emitError(message: string): void {
    this.#errorListener?.(new ErrorEvent("error", { message }));
  }
}
