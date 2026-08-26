// @vitest-environment node

import { beforeAll, describe, expect, it } from "vitest";
import { loadPyodide, type PyodideAPI } from "pyodide";
import type { HiddenTest } from "../domain/types";
import { buildPythonHarness } from "./pythonHarness";

describe("Python grading contract", () => {
  let python: PyodideAPI;

  beforeAll(async () => {
    python = await loadPyodide();
  }, 30_000);

  it("passes equivalent returned values using Python equality", async () => {
    const output = await grade(
      'def greet(name):\n    return f"Hello, {name}!"',
      greetingTests,
    );

    expect(output.results).toEqual([
      { kind: "passed", label: 'greet("Adam")' },
      { kind: "passed", label: 'greet("")' },
    ]);
  });

  it("reports literal placeholders with exact actual and expected values", async () => {
    const output = await grade(
      'def greet(name):\n    return "Hello, {name}!"',
      greetingTests.slice(0, 1),
    );

    expect(output.results).toEqual([
      {
        kind: "failed",
        label: 'greet("Adam")',
        actual: "'Hello, {name}!'",
        expected: "'Hello, Adam!'",
      },
    ]);
  });

  it("does not mistake printed output for a return value", async () => {
    const output = await grade(
      'def greet(name):\n    print(f"Hello, {name}!")',
      greetingTests.slice(0, 1),
    );

    expect(output.stdout).toContain("Hello, Adam!");
    expect(output.results[0]).toMatchObject({
      kind: "failed",
      actual: "None",
      expected: "'Hello, Adam!'",
    });
  });

  async function grade(source: string, tests: readonly HiddenTest[]) {
    const serialized = await python.runPythonAsync(buildPythonHarness(source, tests));
    if (typeof serialized !== "string") {
      throw new Error("Harness did not return serialized output");
    }
    return JSON.parse(serialized) as {
      readonly stdout: string;
      readonly stderr: string;
      readonly results: readonly Record<string, string>[];
    };
  }
});

const greetingTests: readonly HiddenTest[] = [
  {
    label: 'greet("Adam")',
    functionName: "greet",
    args: ["Adam"],
    expected: "Hello, Adam!",
  },
  {
    label: 'greet("")',
    functionName: "greet",
    args: [""],
    expected: "Hello, !",
  },
];
