// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Board } from "@/components/board/Board";
import type { Grid } from "@/lib/engine";
import { TUTORIAL_GRID } from "@/lib/run/tutorial";

const grid: Grid = TUTORIAL_GRID.slice(); // 4 empties at 8,17,26,35

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
