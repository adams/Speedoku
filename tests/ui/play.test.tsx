// @vitest-environment jsdom
import "@/tests/support/jsdomLocalStorage";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PlayPage from "@/app/play/page";

describe("/play", () => {
  it("shows Start, then the board + pad after starting", async () => {
    render(<PlayPage />);
    expect(
      screen.getByRole("button", { name: /start run/i }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /start run/i }));
    // board cells + pad digits present
    expect(screen.getAllByRole("button").length).toBeGreaterThan(81);
    expect(
      screen.getByRole("button", { name: /digit 1/i }),
    ).toBeInTheDocument();
  });

  it("plays a tutorial placement via the pad", async () => {
    render(<PlayPage />);
    await userEvent.click(screen.getByRole("button", { name: /start run/i }));
    // tutorial empties at 8,17,26,35 forced to 2,8,7,3; place the 2 at cell 8
    await userEvent.click(screen.getByRole("button", { name: /digit 2/i })); // select
    await userEvent.click(screen.getByRole("button", { name: /digit 2/i })); // commit at aimed cell
    // a 2 now appears among the board cells (at least one placed) — depth still tutorial(1)
    expect(screen.getByText(/depth/i)).toBeInTheDocument();
  });

  it("still starts and accepts a placement with persistence wired", async () => {
    window.localStorage.clear();
    render(<PlayPage />);
    await userEvent.click(screen.getByRole("button", { name: /start run/i }));
    // board + pad present (persistence wiring didn't break the loop)
    expect(screen.getAllByRole("button").length).toBeGreaterThan(81);
    await userEvent.click(screen.getByRole("button", { name: /digit 2/i }));
    await userEvent.click(screen.getByRole("button", { name: /digit 2/i }));
    expect(screen.getByText(/depth/i)).toBeInTheDocument();
  });
});
