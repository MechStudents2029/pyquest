import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RunOutput } from "./domain/types";
import { createInitialProgress } from "./domain/progress";
import {
  disposeBrowserPythonRuntime,
  type RuntimeClient,
  type RuntimeState,
} from "./runtime/PythonRuntime";
import { PROGRESS_STORAGE_KEY } from "./storage/progressStorage";
import App from "./App";

afterEach(() => {
  disposeBrowserPythonRuntime();
});

describe("PyQuest app", () => {
  it("shows runtime boot state and sequential locks", () => {
    render(<App runtime={new RuntimeStub({ kind: "booting" })} storage={new MapStorage()} />);

    expect(screen.getByText(/starting python/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^day 1:/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /^day 2:/i })).toBeDisabled();
  });

  it("uses plain runtime and results copy with accessible status", () => {
    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={new MapStorage()} />);

    expect(screen.getByText("Python ready")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /level progress/i })).toHaveAttribute(
      "aria-valuemax",
      "300",
    );
    expect(screen.getByRole("region", { name: /results/i })).toHaveTextContent(
      "Run tests to see results.",
    );
  });

  it("renders one course navigation and one coach after the results", () => {
    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={new MapStorage()} />);

    const navigation = screen.getByRole("navigation", { name: /30-day python course/i });
    const results = screen.getByRole("region", { name: /results/i });
    const coach = screen.getByRole("complementary", { name: /^coach$/i });
    const footer = screen.getByRole("contentinfo");

    expect(navigation).toBeInTheDocument();
    expect(screen.getAllByRole("complementary", { name: /^coach$/i })).toHaveLength(1);
    expect(results.compareDocumentPosition(coach) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(coach.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("closes the course drawer with Escape and restores trigger focus", () => {
    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={new MapStorage()} />);

    const trigger = screen.getByRole("button", { name: /^quest log$/i });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: /^quest log$/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("runs tests with Command or Control plus Enter from the editor", async () => {
    const runtime = new RuntimeStub({ kind: "ready" });
    render(<App runtime={runtime} storage={new MapStorage()} />);

    fireEvent.keyDown(screen.getByRole("textbox", { name: /python code editor/i }), {
      key: "Enter",
      ctrlKey: true,
    });

    await waitFor(() => expect(runtime.runCount).toBe(1));
  });

  it("creates only one browser runtime under Strict Mode", async () => {
    BrowserWorkerStub.instances = [];
    vi.stubGlobal("Worker", BrowserWorkerStub);

    try {
      render(
        <StrictMode>
          <App storage={new MapStorage()} />
        </StrictMode>,
      );

      await waitFor(() => expect(BrowserWorkerStub.instances).toHaveLength(1));
      expect(BrowserWorkerStub.instances[0]?.terminated).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("reuses the browser runtime when the app remounts", async () => {
    BrowserWorkerStub.instances = [];
    vi.stubGlobal("Worker", BrowserWorkerStub);

    try {
      const firstMount = render(<App storage={new MapStorage()} />);
      await waitFor(() => expect(BrowserWorkerStub.instances).toHaveLength(1));
      firstMount.unmount();

      render(<App storage={new MapStorage()} />);

      await waitFor(() => expect(BrowserWorkerStub.instances).toHaveLength(1));
      expect(BrowserWorkerStub.instances[0]?.terminated).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("shows a worked code example before the challenge", () => {
    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={new MapStorage()} />);

    const exampleHeading = screen.getByRole("heading", { name: /worked example/i });
    const challengeHeading = screen.getByRole("heading", { name: /signal hello/i });

    expect(
      exampleHeading.compareDocumentPosition(challengeHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("presents lesson explanations as bullet points", () => {
    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={new MapStorage()} />);

    const notes = screen.getByRole("list", { name: /lesson notes/i });
    const points = within(notes).getAllByRole("listitem");

    expect(points.length).toBeGreaterThan(3);
    expect(points[0]).toHaveTextContent(/variable is a name/i);
    expect(notes).toHaveTextContent(/print\(\) displays a value/i);
  });

  it("keeps a learning coach in a dedicated right-side rail", () => {
    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={new MapStorage()} />);

    const rail = screen.getByRole("complementary", { name: /^coach$/i });
    expect(rail).toHaveClass("coach-rail");
    expect(within(rail).getByRole("heading", { name: /^coach$/i })).toBeInTheDocument();
    expect(within(rail).getByRole("log", { name: /coach conversation/i })).toHaveTextContent(
      /variables.*names let programs/i,
    );

    const input = within(rail).getByRole("textbox", { name: /ask the coach/i });
    fireEvent.change(input, { target: { value: "Explain the concept" } });
    fireEvent.click(within(rail).getByRole("button", { name: /^send$/i }));

    expect(rail).toHaveTextContent(/variable: a name that refers to a value/i);
  });

  it("escalates an unmatched coach question to Anthropic and shows an AI badge", async () => {
    let coachCallCount = 0;
    const fetchMock = vi.fn((url: string) => {
      const urlStr = String(url);
      // The app also posts local debug events; those must never return undefined.
      if (!urlStr.includes("/api/coach")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
          text: async () => "",
        });
      }

      coachCallCount += 1;
      const text =
        coachCallCount === 1
          ? "Anthropic coaching reply"
          : "Second Anthropic reply";

      return Promise.resolve({
        ok: true,
        json: async () => ({ text }),
        text: async () => text,
      });
    });

    vi.stubGlobal("fetch", fetchMock as any);

    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={new MapStorage()} />);

    const rail = screen.getByRole("complementary", { name: /^coach$/i });
    const input = within(rail).getByRole("textbox", { name: /ask the coach/i });

    fireEvent.change(input, {
      target: { value: "Can you walk me through the task step-by-step?" },
    });
    fireEvent.click(within(rail).getByRole("button", { name: /^send$/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(await within(rail).findByText(/anthropic coaching reply/i)).toBeInTheDocument();
    expect(rail).toHaveTextContent(/ai · haiku/i);

    fireEvent.change(input, { target: { value: "What should I do next?" } });
    fireEvent.click(within(rail).getByRole("button", { name: /^send$/i }));

    expect(await within(rail).findByText(/second anthropic reply/i)).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("renders an accessible key-term glossary before the worked example", () => {
    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={new MapStorage()} />);

    const glossaryHeading = screen.getByRole("heading", { name: /key terms/i });
    const glossary = glossaryHeading.closest("section");
    const exampleHeading = screen.getByRole("heading", { name: /worked example/i });

    expect(glossary).toHaveAttribute("aria-labelledby", glossaryHeading.id);
    expect(glossary).toHaveTextContent("Variable");
    expect(glossary).toHaveTextContent(/name that refers to a value/i);
    expect(
      glossaryHeading.compareDocumentPosition(exampleHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("places run controls before the editor so they remain available while coding", () => {
    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={new MapStorage()} />);

    const runButton = screen.getByRole("button", { name: /run tests/i });
    const editor = screen.getByRole("textbox", { name: /python code editor/i });

    expect(
      runButton.compareDocumentPosition(editor) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("reveals a hint after two failed runs and shows assertion details", async () => {
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          { kind: "failed", label: 'greet("Adam")', expected: "'Hello, Adam!'", actual: "None" },
        ],
      },
    );
    render(<App runtime={runtime} storage={new MapStorage()} />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));
    await screen.findByText(/expected 'Hello, Adam!'/i);
    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /show hint/i })).toBeEnabled(),
    );
  });

  it("turns a failed run into a coach conversation", async () => {
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          { kind: "failed", label: 'greet("Adam")', expected: "'Hello, Adam!'", actual: "None" },
        ],
      },
    );
    render(<App runtime={runtime} storage={new MapStorage()} />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));

    const rail = screen.getByRole("complementary", { name: /^coach$/i });
    const conversation = within(rail).getByRole("log", { name: /coach conversation/i });
    expect(await within(conversation).findByText(/starter placeholder is still active/i)).toBeInTheDocument();

    const input = within(rail).getByRole("textbox", { name: /ask the coach/i });
    fireEvent.change(input, { target: { value: "What should I change?" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(conversation).toHaveTextContent(/what should i change/i);
    expect(conversation).toHaveTextContent(/replace.*pass/i);
  });

  it("reports successful grading in the coach chat", async () => {
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          { kind: "passed", label: 'greet("Adam")' },
          { kind: "passed", label: 'greet("")' },
        ],
      },
    );
    render(<App runtime={runtime} storage={new MapStorage()} />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));
    await waitFor(() => expect(runtime.runCount).toBe(1));

    const rail = screen.getByRole("complementary", { name: /^coach$/i });
    expect(await within(rail).findByText(/all tests passed/i)).toBeInTheDocument();
  });

  it("clears stale failure chat when the learner resets the code", async () => {
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          { kind: "failed", label: 'greet("Adam")', expected: "'Hello, Adam!'", actual: "None" },
        ],
      },
    );
    render(<App runtime={runtime} storage={new MapStorage()} />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));
    const rail = screen.getByRole("complementary", { name: /^coach$/i });
    expect(await within(rail).findByText(/starter placeholder is still active/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^reset$/i }));

    expect(rail).not.toHaveTextContent(/starter placeholder is still active/i);
    expect(rail).toHaveTextContent(/variables.*names let programs/i);
  });

  it("does not expose reference code through coaching", async () => {
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          { kind: "failed", label: "hidden greeting case", expected: "'Hello, Adam!'", actual: "None" },
        ],
      },
    );
    render(<App runtime={runtime} storage={new MapStorage()} />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));

    const rail = screen.getByRole("complementary", { name: /^coach$/i });
    await within(rail).findByText(/starter placeholder is still active/i);
    expect(rail).not.toHaveTextContent("hidden greeting case");
    expect(rail).not.toHaveTextContent("return f'Hello, {name}!'");
  });

  it("explains a literal f-string placeholder when the learner disputes the result", async () => {
    const storage = new MapStorage();
    storage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        ...createInitialProgress(),
        drafts: {
          "day-1-greet": 'def greet(name):\n    return "Hello, {name}!"',
        },
      }),
    );
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          {
            kind: "failed",
            label: 'greet("Adam")',
            expected: "'Hello, Adam!'",
            actual: "'Hello, {name}!'",
          },
        ],
      },
    );
    render(<App runtime={runtime} storage={storage} />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));

    const rail = screen.getByRole("complementary", { name: /^coach$/i });
    expect(await within(rail).findByText(/returned the placeholder literally/i)).toBeInTheDocument();
    fireEvent.click(within(rail).getByRole("button", { name: /my code looks right/i }));

    expect(rail).toHaveTextContent(/'Hello, \{name\}!'/i);
    expect(rail).toHaveTextContent(/'Hello, Adam!'/i);
    expect(rail).toHaveTextContent(/ordinary string/i);
  });

  it("does not offer the answer before four failed runs", async () => {
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          { kind: "failed", label: 'greet("Adam")', expected: "'Hello, Adam!'", actual: "None" },
        ],
      },
    );
    render(<App runtime={runtime} storage={new MapStorage()} />);

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      fireEvent.click(screen.getByRole("button", { name: /run tests/i }));
      await waitFor(() => expect(runtime.runCount).toBe(attempt));
      await waitFor(() => expect(screen.getByRole("button", { name: /run tests/i })).toBeEnabled());
    }

    expect(screen.queryByRole("button", { name: /show answer/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /reference solution/i })).not.toBeInTheDocument();
  });

  it("offers the answer after four failures and reveals it on request", async () => {
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          { kind: "failed", label: 'greet("Adam")', expected: "'Hello, Adam!'", actual: "None" },
        ],
      },
    );
    render(<App runtime={runtime} storage={new MapStorage()} />);

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      fireEvent.click(screen.getByRole("button", { name: /run tests/i }));
      await waitFor(() => expect(runtime.runCount).toBe(attempt));
      await waitFor(() => expect(screen.getByRole("button", { name: /run tests/i })).toBeEnabled());
    }

    const showAnswer = screen.getByRole("button", { name: /show answer/i });
    expect(screen.queryByRole("heading", { name: /reference solution/i })).not.toBeInTheDocument();

    fireEvent.click(showAnswer);

    const heading = screen.getByRole("heading", { name: /reference solution/i });
    const answer = heading.closest("section");
    expect(answer).toHaveTextContent("def greet(name):");
    expect(answer).toHaveTextContent(/compare this with yours/i);
  });

  it("hides a revealed answer when changing days", () => {
    const storage = new MapStorage();
    storage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        ...createInitialProgress(),
        attempts: { "day-1-greet": 4 },
        clearedDays: [1],
      }),
    );
    render(<App runtime={new RuntimeStub({ kind: "ready" })} storage={storage} />);

    fireEvent.click(screen.getByRole("button", { name: /show answer/i }));
    expect(screen.getByRole("heading", { name: /reference solution/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^day 2:/i }));

    expect(screen.queryByRole("heading", { name: /reference solution/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /show answer/i })).not.toBeInTheDocument();
  });

  it("keeps the last failure visible while a rerun is in progress", async () => {
    const failed: RunOutput = {
      stdout: "",
      stderr: "",
      results: [
        { kind: "failed", label: 'greet("Adam")', expected: "'Hello, Adam!'", actual: "None" },
      ],
    };
    const runtime = new RunQueueStub(failed, new Promise(() => undefined));
    render(<App runtime={runtime} storage={new MapStorage()} />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));
    expect(await screen.findByText(/expected 'Hello, Adam!'/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));

    expect(screen.getByText(/expected 'Hello, Adam!'/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /running/i })).toBeDisabled();
  });

  it("awards XP once and unlocks the next day after a pass", async () => {
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          { kind: "passed", label: 'greet("Adam")' },
          { kind: "passed", label: 'greet("")' },
        ],
      },
    );
    render(<App runtime={runtime} storage={new MapStorage()} />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));

    await waitFor(() => expect(screen.getByText("100 XP")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /^day 2:/i })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));
    await waitFor(() => expect(screen.getByText("100 XP")).toBeInTheDocument());
  });

  it("prints Python tracebacks in the terminal", async () => {
    const runtime = new RuntimeStub(
      { kind: "ready" },
      {
        stdout: "",
        stderr: "",
        results: [
          {
            kind: "error",
            label: 'greet("Adam")',
            traceback: "Traceback (most recent call last):\nNameError: name 'x' is not defined",
          },
        ],
      },
    );
    render(<App runtime={runtime} storage={new MapStorage()} />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));

    expect(await screen.findByText(/NameError: name 'x'/)).toBeInTheDocument();
  });
});

class RuntimeStub implements RuntimeClient {
  runCount = 0;

  constructor(
    readonly state: RuntimeState,
    readonly output: RunOutput = { stdout: "", stderr: "", results: [] },
  ) {}

  subscribe(listener: (state: RuntimeState) => void): () => void {
    listener(this.state);
    return () => undefined;
  }

  async run(): Promise<RunOutput> {
    this.runCount += 1;
    return this.output;
  }

  retry(): void {}
  dispose(): void {}
}

class RunQueueStub implements RuntimeClient {
  readonly state: RuntimeState = { kind: "ready" };
  readonly #runs: Array<RunOutput | Promise<RunOutput>>;

  constructor(...runs: Array<RunOutput | Promise<RunOutput>>) {
    this.#runs = runs;
  }

  subscribe(listener: (state: RuntimeState) => void): () => void {
    listener(this.state);
    return () => undefined;
  }

  async run(): Promise<RunOutput> {
    const next = this.#runs.shift();
    if (next === undefined) throw new Error("No queued run");
    return next;
  }

  retry(): void {}
  dispose(): void {}
}

class MapStorage implements Pick<Storage, "getItem" | "setItem"> {
  readonly #values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.#values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.#values.set(key, value);
  }
}

class BrowserWorkerStub {
  static instances: BrowserWorkerStub[] = [];
  terminated = false;

  constructor() {
    BrowserWorkerStub.instances.push(this);
  }

  postMessage(): void {}
  addEventListener(): void {}
  removeEventListener(): void {}

  terminate(): void {
    this.terminated = true;
  }
}
