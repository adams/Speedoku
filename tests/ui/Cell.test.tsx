// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Cell } from "@/components/board/Cell";

const base = {
  value: 0,
  given: false,
  candidates: [] as number[],
  activeDigit: null as number | null,
  legalForActive: false,
  isCursor: false,
  digitComplete: false,
  onSelect: () => {},
};

describe("Cell", () => {
  it("renders a given value", () => {
    render(<Cell {...base} value={5} given />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders auto-pencil candidate numerals when empty", () => {
    render(<Cell {...base} candidates={[1, 4, 7]} />);
    for (const d of [1, 4, 7])
      expect(screen.getByText(String(d))).toBeInTheDocument();
    expect(screen.queryByText("2")).toBeNull();
  });

  it("marks the cursor and a legal target via data attributes", () => {
    const { container } = render(
      <Cell
        {...base}
        candidates={[7]}
        activeDigit={7}
        legalForActive
        isCursor
      />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.dataset.cursor).toBe("true");
    expect(el.dataset.legal).toBe("true");
  });

  it("fires onSelect when clicked", async () => {
    const onSelect = vi.fn();
    render(<Cell {...base} candidates={[3]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("flags a completed digit", () => {
    const { container } = render(<Cell {...base} value={5} digitComplete />);
    expect((container.firstChild as HTMLElement).dataset.done).toBe("true");
  });
});
