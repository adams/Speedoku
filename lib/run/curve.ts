import type { RunConfig } from "./types";

export function targetRating(depth: number, config: RunConfig): number {
  if (depth <= 1) return config.tutorialRating;
  const x = depth - 2;
  const raw = config.floorRating + config.slope * x + config.curvature * x * x;
  return Math.min(config.topRating, raw);
}
