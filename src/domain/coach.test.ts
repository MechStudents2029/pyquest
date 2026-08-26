import { describe, expect, it } from "vitest";
import type { Challenge, RunOutput } from "./types";
import { analyzeFailure } from "./coach";

describe("analyzeFailure", () => {
  it("spots an unfinished starter stub", () => {
    expect(diagnose("def greet(name):\n    pass", failed("None", "'Hello, Ada!'"))).toMatchObject({
      kind: "unfinished-stub",
      nextStep: expect.stringMatching(/replace.*pass/i),
    });
  });

  it("explains a missing return", () => {
    expect(
      diagnose("def greet(name):\n    message = f'Hello, {name}!'", failed("None", "'Hello, Ada!'")),
    ).toMatchObject({
      kind: "missing-return",
      reason: expect.stringMatching(/none/i),
    });
  });

  it("distinguishes print from return", () => {
    expect(
      diagnose("def greet(name):\n    print(f'Hello, {name}!')", failed("None", "'Hello, Ada!'")),
    ).toMatchObject({
      kind: "print-vs-return",
      concept: expect.stringMatching(/return value/i),
    });
  });

  it.each([
    ["IndentationError: expected an indented block", "indentation-error"],
    ["SyntaxError: invalid syntax", "syntax-error"],
    ["NameError: name 'nmae' is not defined", "name-error"],
    ["TypeError: can only concatenate str", "type-error"],
    ["KeyError: 'role'", "key-error"],
    ["IndexError: list index out of range", "index-error"],
    ["AttributeError: 'str' object has no attribute", "attribute-error"],
    ["ZeroDivisionError: division by zero", "zero-division-error"],
  ] as const)("classifies %s", (message, kind) => {
    expect(diagnose("def solve():\n    return 1", errored(message))).toMatchObject({
      kind,
      nextStep: expect.any(String),
    });
  });

  it("recognizes a reversed boolean condition", () => {
    expect(diagnose("def is_even(n):\n    return n % 2 != 0", failed("False", "True"))).toMatchObject({
      kind: "boolean-mismatch",
      reason: expect.stringMatching(/opposite/i),
    });
  });

  it("recognizes an off-by-one numeric result", () => {
    expect(diagnose("def count(items):\n    return len(items) - 1", failed("2", "3"))).toMatchObject({
      kind: "off-by-one",
      nextStep: expect.stringMatching(/boundary|start|stop/i),
    });
  });

  it("recognizes string formatting differences", () => {
    expect(diagnose("def greet(name):\n    return 'hello ' + name", failed("'hello Ada'", "'Hello, Ada!'"))).toMatchObject({
      kind: "string-mismatch",
      summary: expect.stringMatching(/hello Ada.*Hello, Ada/i),
      reason: expect.stringMatching(/case|space|punctuation/i),
    });
  });

  it("explains when interpolation braces were returned literally", () => {
    expect(
      diagnose(
        'def greet(name):\n    return "Hello, {name}!"',
        failed("'Hello, {name}!'", "'Hello, Ada!'"),
      ),
    ).toMatchObject({
      kind: "literal-placeholder",
      summary: expect.stringMatching(/Hello, \{name\}.*Hello, Ada/i),
      reason: expect.stringMatching(/ordinary string/i),
      nextStep: expect.stringMatching(/f-string/i),
    });
  });

  it("distinguishes a value from the text representation of that value", () => {
    expect(diagnose("def count(items):\n    return str(len(items))", failed("'2'", "2"))).toMatchObject({
      kind: "value-type-mismatch",
      reason: expect.stringMatching(/string.*number/i),
    });
  });

  it("recognizes collection and dictionary shape differences", () => {
    expect(diagnose("def solve():\n    return [1, 2]", failed("[1, 2]", "[1, 2, 3]"))).toMatchObject({
      kind: "collection-mismatch",
    });
    expect(diagnose("def solve():\n    return {'ok': True}", failed("{'ok': True}", "{'status': 'ok'}"))).toMatchObject({
      kind: "mapping-mismatch",
    });
  });

  it("falls back without exposing solution code or hidden tests", () => {
    const diagnosis = diagnose("def greet(name):\n    return 10", failed("10", "20"));

    expect(diagnosis.kind).toBe("wrong-result");
    expect(JSON.stringify(diagnosis)).not.toContain(challenge.solutionCode);
    expect(JSON.stringify(diagnosis)).not.toContain("hidden edge case");
  });
});

const challenge: Challenge = {
  id: "day-1-greet",
  title: "Signal hello",
  prompt: "Return a greeting.",
  starterCode: "def greet(name):\n    pass",
  solutionCode: "def greet(name):\n    return f'Hello, {name}!'",
  hint: "Use an f-string.",
  xp: 100,
  tests: [
    {
      label: "hidden edge case",
      functionName: "greet",
      args: ["Ada"],
      expected: "Hello, Ada!",
    },
  ],
};

function diagnose(source: string, output: RunOutput) {
  return analyzeFailure({ source, challenge, output });
}

function failed(actual: string, expected: string): RunOutput {
  return {
    stdout: "",
    stderr: "",
    results: [{ kind: "failed", label: "example", actual, expected }],
  };
}

function errored(message: string): RunOutput {
  return {
    stdout: "",
    stderr: "",
    results: [
      {
        kind: "error",
        label: "example",
        traceback: `Traceback (most recent call last):\n${message}`,
      },
    ],
  };
}
