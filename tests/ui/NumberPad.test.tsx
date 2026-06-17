// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NumberPad } from "@/components/number-pad/NumberPad";
import type { Grid } from "@/lib/engine";

// all nine 5s present → digit 5 complete; one 7 present → 7 remaining = 8
const grid: Grid = new Array(81).fill(0);
[4, 13, 22, 31, 40, 49, 58, 67, 76].forEach((i) => {
  grid[i] = 5;
});
grid[0] = 7;

describe("NumberPad", () => {
  it("marks a completed digit done and shows remaining counts", () => {
    render(<NumberPad grid={grid} activeDigit={null} onDigit={() => {}} />);
    const five = screen.getByRole("button", { name: /digit 5/i });
    expect(five.dataset.done).toBe("true");
    const seven = screen.getByRole("button", { name: /digit 7/i });
    expect(seven).toHaveTextContent("8"); // remaining
  });

  it("shows a completed digit in mint green (board parity), not grey", () => {
    render(<NumberPad grid={grid} activeDigit={null} onDigit={() => {}} />);
    const five = screen.getByRole("button", { name: /digit 5/i }); // completed
    expect(five.className).toContain("text-mint");
    const seven = screen.getByRole("button", { name: /digit 7/i }); // incomplete
    expect(seven.className).not.toContain("text-mint");
  });

  it("marks the active digit", () => {
    render(<NumberPad grid={grid} activeDigit={7} onDigit={() => {}} />);
    expect(
      screen.getByRole("button", { name: /digit 7/i }).dataset.active,
    ).toBe("true");
  });

  it("fires onDigit on tap", async () => {
    const onDigit = vi.fn();
    render(<NumberPad grid={grid} activeDigit={null} onDigit={onDigit} />);
    await userEvent.click(screen.getByRole("button", { name: /digit 3/i }));
    expect(onDigit).toHaveBeenCalledWith(3);
  });
});
