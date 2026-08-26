export type TestValue =
  | null
  | boolean
  | number
  | string
  | TestValue[]
  | { readonly [key: string]: TestValue };

export interface HiddenTest {
  readonly label: string;
  readonly functionName: string;
  readonly args: readonly TestValue[];
  readonly expected: TestValue;
}

export interface Challenge {
  readonly id: string;
  readonly title: string;
  readonly prompt: string;
  readonly starterCode: string;
  readonly solutionCode: string;
  readonly hint: string;
  readonly xp: number;
  readonly tests: readonly HiddenTest[];
  readonly packages?: readonly string[];
}

export interface KeyTerm {
  readonly term: string;
  readonly definition: string;
}

export interface Day {
  readonly day: number;
  readonly title: string;
  readonly topic: string;
  readonly why: string;
  readonly explanation: string;
  readonly keyTerms: readonly KeyTerm[];
  readonly example: string;
  readonly codeExample: string;
  readonly boss: boolean;
  readonly challenges: readonly Challenge[];
}

export interface Progress {
  readonly version: 1;
  readonly xp: number;
  readonly completedChallenges: readonly string[];
  readonly clearedDays: readonly number[];
  readonly attempts: Readonly<Record<string, number>>;
  readonly drafts: Readonly<Record<string, string>>;
  readonly lastActivityDate: string | null;
  readonly streak: number;
  readonly longestStreak: number;
  readonly selectedDay: number;
}

export type TestResult =
  | { readonly kind: "passed"; readonly label: string }
  | {
      readonly kind: "failed";
      readonly label: string;
      readonly expected: string;
      readonly actual: string;
    }
  | { readonly kind: "error"; readonly label: string; readonly traceback: string };

export interface RunOutput {
  readonly stdout: string;
  readonly stderr: string;
  readonly results: readonly TestResult[];
}

export type CoachDiagnosisKind =
  | "unfinished-stub"
  | "missing-return"
  | "print-vs-return"
  | "indentation-error"
  | "syntax-error"
  | "name-error"
  | "type-error"
  | "key-error"
  | "index-error"
  | "attribute-error"
  | "zero-division-error"
  | "python-error"
  | "boolean-mismatch"
  | "off-by-one"
  | "literal-placeholder"
  | "value-type-mismatch"
  | "string-mismatch"
  | "collection-mismatch"
  | "mapping-mismatch"
  | "wrong-result";

export interface CoachDiagnosis {
  readonly kind: CoachDiagnosisKind;
  readonly title: string;
  readonly summary: string;
  readonly reason: string;
  readonly nextStep: string;
  readonly concept: string;
}
