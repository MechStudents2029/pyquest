import type { HiddenTest, RunOutput } from "../domain/types";

export type RuntimeState =
  | { readonly kind: "booting" }
  | { readonly kind: "ready" }
  | { readonly kind: "error"; readonly message: string };

export type RuntimeMessage =
  | { readonly kind: "boot" }
  | {
      readonly kind: "run";
      readonly requestId: string;
      readonly source: string;
      readonly tests: readonly HiddenTest[];
      readonly packages: readonly string[];
    }
  | { readonly kind: "ready" }
  | { readonly kind: "boot-error"; readonly message: string }
  | { readonly kind: "run-result"; readonly requestId: string; readonly output: RunOutput };

export interface WorkerPort {
  postMessage(message: RuntimeMessage): void;
  addEventListener(
    type: "message",
    listener: (event: MessageEvent<RuntimeMessage>) => void,
  ): void;
  removeEventListener(
    type: "message",
    listener: (event: MessageEvent<RuntimeMessage>) => void,
  ): void;
  addErrorEventListener(listener: (event: ErrorEvent) => void): void;
  removeErrorEventListener(listener: (event: ErrorEvent) => void): void;
  terminate(): void;
}

interface RunInput {
  readonly source: string;
  readonly tests: readonly HiddenTest[];
  readonly packages: readonly string[];
}

export interface RuntimeClient {
  subscribe(listener: (state: RuntimeState) => void): () => void;
  run(input: RunInput): Promise<RunOutput>;
  retry(): void;
  dispose(): void;
}

interface PendingRun {
  readonly resolve: (output: RunOutput) => void;
  readonly reject: (error: Error) => void;
  readonly timeout: ReturnType<typeof setTimeout>;
}

export class PythonRuntime implements RuntimeClient {
  #worker: WorkerPort;
  #state: RuntimeState = { kind: "booting" };
  readonly #listeners = new Set<(state: RuntimeState) => void>();
  readonly #pending = new Map<string, PendingRun>();
  #requestNumber = 0;
  #bootTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    readonly workerFactory: () => WorkerPort,
    readonly timeoutMs = 8_000,
    readonly bootTimeoutMs = 20_000,
  ) {
    this.#worker = this.createWorker();
  }

  subscribe(listener: (state: RuntimeState) => void): () => void {
    this.#listeners.add(listener);
    listener(this.#state);
    return () => this.#listeners.delete(listener);
  }

  run(input: RunInput): Promise<RunOutput> {
    if (this.#state.kind !== "ready") {
      return Promise.reject(new Error("Python runtime is not ready"));
    }

    const requestId = `run-${++this.#requestNumber}`;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.#pending.delete(requestId);
        reject(new Error("Python execution timed out"));
        this.replaceWorker();
      }, this.timeoutMs);

      this.#pending.set(requestId, { resolve, reject, timeout });
      this.#worker.postMessage({
        kind: "run",
        requestId,
        source: input.source,
        tests: input.tests,
        packages: input.packages,
      });
    });
  }

  retry(): void {
    this.replaceWorker();
  }

  dispose(): void {
    this.clearBootTimeout();
    this.#worker.removeEventListener("message", this.handleMessage);
    this.#worker.removeErrorEventListener(this.handleWorkerError);
    this.#worker.terminate();
    this.rejectPending(new Error("Python runtime disposed"));
  }

  private readonly handleMessage = (event: MessageEvent<RuntimeMessage>): void => {
    const message = event.data;
    switch (message.kind) {
      case "ready":
        this.clearBootTimeout();
        this.setState({ kind: "ready" });
        break;
      case "boot-error":
        this.clearBootTimeout();
        this.setState({ kind: "error", message: message.message });
        break;
      case "run-result": {
        const pending = this.#pending.get(message.requestId);
        if (pending !== undefined) {
          clearTimeout(pending.timeout);
          this.#pending.delete(message.requestId);
          pending.resolve(message.output);
        }
        break;
      }
      case "boot":
      case "run":
        break;
    }
  };

  private readonly handleWorkerError = (event: ErrorEvent): void => {
    const message = event.message || "Python worker failed to start";
    this.clearBootTimeout();
    this.#worker.removeEventListener("message", this.handleMessage);
    this.#worker.removeErrorEventListener(this.handleWorkerError);
    this.#worker.terminate();
    this.rejectPending(new Error(message));
    this.setState({ kind: "error", message });
  };

  private createWorker(): WorkerPort {
    const worker = this.workerFactory();
    worker.addEventListener("message", this.handleMessage);
    worker.addErrorEventListener(this.handleWorkerError);
    worker.postMessage({ kind: "boot" });
    this.#bootTimeout = setTimeout(() => {
      if (this.#worker !== worker || this.#state.kind !== "booting") return;
      worker.removeEventListener("message", this.handleMessage);
      worker.removeErrorEventListener(this.handleWorkerError);
      worker.terminate();
      this.rejectPending(new Error("Python runtime did not start"));
      this.setState({
        kind: "error",
        message: "Python runtime did not start. Check your connection, then retry.",
      });
    }, this.bootTimeoutMs);
    return worker;
  }

  private replaceWorker(): void {
    this.clearBootTimeout();
    this.#worker.removeEventListener("message", this.handleMessage);
    this.#worker.removeErrorEventListener(this.handleWorkerError);
    this.#worker.terminate();
    this.setState({ kind: "booting" });
    this.#worker = this.createWorker();
  }

  private rejectPending(error: Error): void {
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.#pending.clear();
  }

  private clearBootTimeout(): void {
    if (this.#bootTimeout === null) return;
    clearTimeout(this.#bootTimeout);
    this.#bootTimeout = null;
  }

  private setState(state: RuntimeState): void {
    this.#state = state;
    for (const listener of this.#listeners) {
      listener(state);
    }
  }
}

export function createBrowserPythonRuntime(): PythonRuntime {
  return new PythonRuntime(
    () => {
      const worker = new Worker(new URL("./pyodide.worker.ts", import.meta.url), {
        type: "module",
      });
      return {
        postMessage: (message) => worker.postMessage(message),
        addEventListener: (type, listener) => worker.addEventListener(type, listener),
        removeEventListener: (type, listener) =>
          worker.removeEventListener(type, listener),
        addErrorEventListener: (listener) => worker.addEventListener("error", listener),
        removeErrorEventListener: (listener) =>
          worker.removeEventListener("error", listener),
        terminate: () => worker.terminate(),
      };
    },
  );
}

declare global {
  var __pyquestPythonRuntime: PythonRuntime | undefined;
}

export function getBrowserPythonRuntime(): PythonRuntime {
  globalThis.__pyquestPythonRuntime ??= createBrowserPythonRuntime();
  return globalThis.__pyquestPythonRuntime;
}

export function disposeBrowserPythonRuntime(): void {
  globalThis.__pyquestPythonRuntime?.dispose();
  globalThis.__pyquestPythonRuntime = undefined;
}
