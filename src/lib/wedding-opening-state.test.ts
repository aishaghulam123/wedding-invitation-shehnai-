import { describe, expect, it } from "vitest";

import { advanceOpeningState, type WeddingOpeningState } from "@/lib/wedding-opening-state";

describe("wedding invitation opening sequence", () => {
  it("advances through every stage in order exactly once", () => {
    const sequence: WeddingOpeningState[] = [
      "sealed",
      "breaking",
      "curtainPlaying",
      "curtainComplete",
      "namesRevealed",
    ];

    const result = sequence.slice(1).reduce(
      (current, next) => advanceOpeningState(current, next),
      sequence[0] ?? "sealed",
    );

    expect(result).toBe("namesRevealed");
  });

  it("does not let an invalid or repeated transition skip the animation", () => {
    expect(advanceOpeningState("sealed", "curtainPlaying")).toBe("sealed");
    expect(advanceOpeningState("curtainPlaying", "breaking")).toBe("curtainPlaying");
    expect(advanceOpeningState("namesRevealed", "sealed")).toBe("namesRevealed");
  });
});