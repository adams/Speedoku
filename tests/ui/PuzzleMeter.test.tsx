// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PuzzleMeter } from "@/components/hud/PuzzleMeter";
import { puzzleMax } from "@/lib/run/scorer";
import type { RunConfig } from "@/lib/run/types";

const config: RunConfig = {
  seed: 1,
  mode: "hints-on",
  tutorialRating: 100,
  floorRating: 100,
  slope: 20,
  curvature: 0,
  topRating: 500,
  base: 1000,
  floorRatio: 0.25,
  cap: 4,
  weightSlope: 2,
  parFastSec: 25,
  parSlowSec: 90,
};

describe("PuzzleMeter", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(
      <PuzzleMeter
        rating={100}
        elapsedMs={0}
        config={config}
        visible={false}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the max value and a full bar at elapsed 0", () => {
    render(
      <PuzzleMeter rating={100} elapsedMs={0} config={config} visible={true} />,
    );
    expect(
      screen.getByText(
        `+${Math.round(puzzleMax(100, config)).toLocaleString()}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("meter-fill")).toHaveStyle({ width: "100%" });
  });

  it("drains the bar toward empty for a very slow solve", () => {
    render(
      <PuzzleMeter
        rating={100}
        elapsedMs={10_000_000}
        config={config}
        visible={true}
      />,
    );
    expect(screen.getByTestId("meter-fill")).toHaveStyle({ width: "0%" });
  });
});
