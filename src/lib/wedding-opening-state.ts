export type WeddingOpeningState =
  | "sealed"
  | "breaking"
  | "curtainPlaying"
  | "curtainComplete"
  | "namesRevealed";

const order: WeddingOpeningState[] = ["sealed", "breaking", "curtainPlaying", "curtainComplete", "namesRevealed"];

/** Sirf agla qadam allow hota hai — koi stage skip ya repeat nahi ho sakta. */
export function advanceOpeningState(current: WeddingOpeningState, next: WeddingOpeningState): WeddingOpeningState {
  return order.indexOf(next) === order.indexOf(current) + 1 ? next : current;
}
