// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Board } from "@/components/board/Board";
import type { Grid } from "@/lib/engine";

// A near-complete sample grid: 4 empties at 8,17,26,35, each the only missing
// value in its row (digit 2 is the forced value at cell 8).
const grid: Grid = [
  5, 3, 4, 6, 7, 8, 9, 1, 0, 6, 7, 2, 1, 9, 5, 3, 4, 0, 1, 9, 8, 3, 4, 2, 5, 6,
  0, 8, 5, 9, 7, 6, 1, 4, 2, 0, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3, 9, 2, 4, 8,
  5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2, 8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6,
  1, 7, 9,
];

describe("Board", () => {
  it("renders 81 cells", () => {
    render(
      <Board
        grid={grid}
        activeDigit={null}
        activeCell={null}
        onSelectCell={() => {}}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(81);
  });

  it("highlights legal targets for the active digit", () => {
    // digit 2 is the forced value at cell 8 (row 0 missing 2)
    const { container } = render(
      <Board
        grid={grid}
        activeDigit={2}
        activeCell={8}
        onSelectCell={() => {}}
      />,
    );
    const cells = container.querySelectorAll('[data-state="empty"]');
    const legal = Array.from(cells).filter(
      (c) => (c as HTMLElement).dataset.legal === "true",
    );
    expect(legal.length).toBeGreaterThan(0);
  });

  it("calls onSelectCell with the tapped index", async () => {
    const onSelectCell = vi.fn();
    render(
      <Board
        grid={grid}
        activeDigit={2}
        activeCell={null}
        onSelectCell={onSelectCell}
      />,
    );
    await userEvent.click(screen.getAllByRole("button")[8]);
    expect(onSelectCell).toHaveBeenCalledWith(8);
  });
});
