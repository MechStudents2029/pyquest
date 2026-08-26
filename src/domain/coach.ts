import type {
  Challenge,
  CoachDiagnosis,
  CoachDiagnosisKind,
  RunOutput,
} from "./types";

interface AnalyzeFailureInput {
  readonly source: string;
  readonly challenge: Challenge;
  readonly output: RunOutput;
}

interface ErrorRule {
  readonly marker: string;
  readonly kind: CoachDiagnosisKind;
  readonly title: string;
  readonly summary: string;
  readonly reason: string;
  readonly nextStep: string;
  readonly concept: string;
}

const errorRules: readonly ErrorRule[] = [
  {
    marker: "IndentationError",
    kind: "indentation-error",
    title: "Python lost the block structure",
    summary: "The indentation does not form a valid Python block.",
    reason: "Python uses indentation—not braces—to group statements inside functions, loops, and conditions.",
    nextStep: "Inspect the reported line and align it with the other statements in the same block.",
    concept: "A block is a group of statements that share the same indentation level.",
  },
  {
    marker: "SyntaxError",
    kind: "syntax-error",
    title: "Python could not parse the code",
    summary: "A token or expression does not follow Python's grammar.",
    reason: "Python must parse the whole program before it can run any tests.",
    nextStep: "Inspect the reported line and the line before it for a missing colon, quote, bracket, or parenthesis.",
    concept: "Syntax is the grammar that determines which arrangements of code are valid.",
  },
  {
    marker: "NameError",
    kind: "name-error",
    title: "Python could not find a name",
    summary: "The code refers to a variable or function that is not defined in the current scope.",
    reason: "Names must be assigned or declared before Python can look up their values.",
    nextStep: "Compare the spelling of the reported name with the function parameters and earlier assignments.",
    concept: "Scope controls where a variable name exists and can be looked up.",
  },
  {
    marker: "TypeError",
    kind: "type-error",
    title: "The operation received the wrong kind of value",
    summary: "Python found values whose types do not support the requested operation or call.",
    reason: "Each operation has a contract: for example, adding two numbers differs from joining text.",
    nextStep: "Read the final traceback line, identify the values involved, and check their types before the operation.",
    concept: "A type describes a value's data and the operations that value supports.",
  },
  {
    marker: "KeyError",
    kind: "key-error",
    title: "That dictionary key is missing",
    summary: "The code indexed a dictionary with a key that is not present.",
    reason: "Dictionary lookup by brackets requires an exact existing key, including matching case and spelling.",
    nextStep: "Inspect the dictionary's keys or use a guarded lookup such as `key in mapping`.",
    concept: "A dictionary maps unique keys to values; keys are not numeric positions.",
  },
  {
    marker: "IndexError",
    kind: "index-error",
    title: "That sequence position does not exist",
    summary: "The code requested an index outside the sequence's valid range.",
    reason: "For a sequence of length n, valid positive indexes run from 0 through n - 1.",
    nextStep: "Compare the index with `len(sequence)` and check the loop's start and stop values.",
    concept: "Python sequences use zero-based indexing, so the first item is at index 0.",
  },
  {
    marker: "AttributeError",
    kind: "attribute-error",
    title: "That value does not have this method or attribute",
    summary: "The code requested behavior that the value's type does not provide.",
    reason: "Methods belong to particular types; a string, list, and dictionary expose different operations.",
    nextStep: "Check the value's type, then verify that the method name belongs to that type.",
    concept: "An attribute is data or behavior accessed through a value with dot notation.",
  },
  {
    marker: "ZeroDivisionError",
    kind: "zero-division-error",
    title: "The calculation divided by zero",
    summary: "A denominator became zero while the function was running.",
    reason: "Division by zero has no finite numeric result, so Python raises an exception.",
    nextStep: "Trace where the denominator is calculated and decide how the zero case should be handled.",
    concept: "An edge case is an unusual but valid input that sits at a boundary of the problem.",
  },
];

export function analyzeFailure({
  source,
  challenge,
  output,
}: AnalyzeFailureInput): CoachDiagnosis {
  const error = output.results.find((result) => result.kind === "error");
  if (error?.kind === "error") {
    const rule = errorRules.find(({ marker }) => error.traceback.includes(marker));
    if (rule) {
      return rule;
    }

    return {
      kind: "python-error",
      title: "Python stopped with an exception",
      summary: "The function could not finish, so the tests did not receive a result.",
      reason: "The final traceback line names the exception; the preceding lines show how execution reached it.",
      nextStep: "Start at the final traceback line, then inspect the last referenced line in your code.",
      concept: "A traceback is Python's record of the active function calls when an exception occurred.",
    };
  }

  const failure = output.results.find((result) => result.kind === "failed");
  const actual = failure?.kind === "failed" ? failure.actual.trim() : "";
  const expected = failure?.kind === "failed" ? failure.expected.trim() : "";
  const hasReturn = /^\s*return(?:\s|$)/m.test(source);
  const hasPrint = /\bprint\s*\(/.test(source);

  if (actual === "None" && hasPrint && !hasReturn) {
    return {
      kind: "print-vs-return",
      title: "Printing is not returning",
      summary: "The function displayed text but gave the caller no value.",
      reason: "Without `return`, a Python function returns `None`; `print` only writes text to the screen.",
      nextStep: "Return the computed value from the function instead of only printing it.",
      concept: "A return value sends data back to the caller, while output is text shown to a person.",
    };
  }

  if (/^\s*pass\s*(?:#.*)?$/m.test(source)) {
    return {
      kind: "unfinished-stub",
      title: "The starter placeholder is still active",
      summary: "`pass` tells Python to do nothing, so the function has not solved the challenge yet.",
      reason: "A function that reaches its end without `return` automatically returns `None`.",
      nextStep: "Replace `pass` with the statements that calculate and return the requested result.",
      concept: "`pass` is a placeholder statement used where Python requires a block but no behavior exists yet.",
    };
  }

  if (actual === "None" && !hasReturn) {
    return {
      kind: "missing-return",
      title: "The function did not return its result",
      summary: "Your code ran, but the caller received `None` instead of the expected value.",
      reason: "Python returns `None` when execution reaches the end of a function without a `return` statement.",
      nextStep: "Find the final computed value and return it on every path through the function.",
      concept: "A return statement ends the function call and sends one value back to its caller.",
    };
  }

  if ((actual === "True" && expected === "False") || (actual === "False" && expected === "True")) {
    return {
      kind: "boolean-mismatch",
      title: "The condition produced the opposite answer",
      summary: `The function returned ${actual}, while the required result was ${expected}.`,
      reason: "The boolean result is the exact opposite, which often means a comparison or condition is reversed.",
      nextStep: "Read the condition aloud and inspect `==` versus `!=`, comparison direction, and any `not`.",
      concept: "A Boolean expression evaluates to exactly `True` or `False` and controls decisions in code.",
    };
  }

  const actualNumber = parseNumber(actual);
  const expectedNumber = parseNumber(expected);
  if (
    actualNumber !== undefined &&
    expectedNumber !== undefined &&
    Math.abs(actualNumber - expectedNumber) === 1
  ) {
    return {
      kind: "off-by-one",
      title: "The result is one step from the target",
      summary: `The function produced ${actual}, but the expected result was ${expected}.`,
      reason: "A difference of exactly one usually comes from counting a boundary once too many or too few.",
      nextStep: "Inspect loop start and stop values, zero-based indexes, and whether each boundary is included.",
      concept: "An off-by-one error happens when a boundary calculation differs by one item or iteration.",
    };
  }

  if (/\{[A-Za-z_]\w*\}/.test(actual) && !/\breturn\s+[fF](?:[rR])?['"]/.test(source)) {
    return {
      kind: "literal-placeholder",
      title: "Python returned the placeholder literally",
      summary: `Your function returned ${actual}, but Python expected ${expected}.`,
      reason: "An ordinary string keeps braces as text. Python does not replace the name inside them automatically.",
      nextStep: "Prefix the string with `f` so Python evaluates the expression inside `{}` as an f-string.",
      concept: "String interpolation inserts computed values into text while the program is running.",
    };
  }

  const actualType = getRepresentedType(actual);
  const expectedType = getRepresentedType(expected);
  if (
    actualType !== "unknown" &&
    expectedType !== "unknown" &&
    actualType !== expectedType
  ) {
    return {
      kind: "value-type-mismatch",
      title: "The value looks similar, but its type is different",
      summary: `Your function returned ${actual} as a ${actualType}, but Python expected ${expected} as a ${expectedType}.`,
      reason: `Python treats a ${actualType} and a ${expectedType} as different kinds of values, even when they look alike on screen.`,
      nextStep: "Return the value in the type requested by the challenge instead of converting it for display.",
      concept: "A value's type determines both what it means and which operations Python allows.",
    };
  }

  if (isQuoted(actual) && isQuoted(expected)) {
    return {
      kind: "string-mismatch",
      title: "The text is close, but not exact",
      summary: `Your function returned ${actual}, but Python expected ${expected}.`,
      reason: "String comparisons are exact: letter case, spaces, punctuation, and line breaks all matter.",
      nextStep: "Compare the two strings character by character, including their beginning and ending whitespace.",
      concept: "A string is an ordered sequence of characters, and each character participates in equality.",
    };
  }

  if (actual.startsWith("{") || expected.startsWith("{")) {
    return {
      kind: "mapping-mismatch",
      title: "The dictionary has a different shape",
      summary: "The returned mapping does not contain the required keys and values.",
      reason: "Dictionaries are compared by key-value pairs, so key spelling and associated values must match.",
      nextStep: "Inspect which keys you create and verify the value assigned to each one.",
      concept: "A mapping associates each unique key with one value rather than storing values by position.",
    };
  }

  if (isCollection(actual) || isCollection(expected)) {
    return {
      kind: "collection-mismatch",
      title: "The collection contents differ",
      summary: "The returned collection has different items, order, length, or duplicates.",
      reason: "Sequence equality checks both the values and their positions; sets instead compare membership.",
      nextStep: "Check the collection's length first, then compare item order and repeated values.",
      concept: "A collection groups values; its type determines whether order and duplicates matter.",
    };
  }

  return {
    kind: "wrong-result",
    title: "The function returned a different result",
    summary: `Your code completed, but its result did not satisfy “${challenge.prompt}”`,
    reason: "A completed run can still fail when the algorithm transforms the input differently from the task's contract.",
    nextStep: `Trace one simple input by hand. If needed, use this nudge: ${challenge.hint}`,
    concept: "A function contract describes the inputs a function accepts and the result it promises to return.",
  };
}

function parseNumber(value: string): number | undefined {
  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function isQuoted(value: string): boolean {
  return (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  );
}

function isCollection(value: string): boolean {
  return (
    (value.startsWith("[") && value.endsWith("]")) ||
    (value.startsWith("(") && value.endsWith(")")) ||
    (value.startsWith("{") && value.endsWith("}"))
  );
}

function getRepresentedType(value: string): string {
  if (isQuoted(value)) return "string";
  if (parseNumber(value) !== undefined) return "number";
  if (value === "True" || value === "False") return "boolean";
  if (value === "None") return "None value";
  if (value.startsWith("[") && value.endsWith("]")) return "list";
  if (value.startsWith("(") && value.endsWith(")")) return "tuple";
  if (value.startsWith("{") && value.endsWith("}")) return "mapping";
  return "unknown";
}
