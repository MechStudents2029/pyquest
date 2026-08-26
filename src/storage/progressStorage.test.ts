import { describe, expect, it } from "vitest";
import { createInitialProgress } from "../domain/progress";
import {
  loadProgress,
  PROGRESS_STORAGE_KEY,
  saveProgress,
} from "./progressStorage";

describe("progress storage", () => {
  it("falls back for missing, malformed, and future data", () => {
    const storage = new MapStorage();
    expect(loadProgress(storage)).toEqual(createInitialProgress());

    storage.setItem(PROGRESS_STORAGE_KEY, "{bad");
    expect(loadProgress(storage)).toEqual(createInitialProgress());

    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(loadProgress(storage)).toEqual(createInitialProgress());
  });

  it("rejects records with invalid field types", () => {
    const storage = new MapStorage();
    storage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...createInitialProgress(), xp: "lots" }),
    );

    expect(loadProgress(storage)).toEqual(createInitialProgress());
  });

  it("round trips a valid progress record", () => {
    const storage = new MapStorage();
    const progress = {
      ...createInitialProgress(),
      xp: 120,
      completedChallenges: ["day-1-greet"],
      clearedDays: [1],
      attempts: { "day-2-word-count": 2 },
      drafts: { "day-2-word-count": "def word_count(s):\n    return 2" },
    };

    saveProgress(storage, progress);

    expect(loadProgress(storage)).toEqual(progress);
  });
});

class MapStorage implements Pick<Storage, "getItem" | "setItem"> {
  readonly #values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.#values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.#values.set(key, value);
  }
}
