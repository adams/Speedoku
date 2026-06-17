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

  it("selects via the pad and places via Submit on the depth-1 puzzle", async () => {
    render(<PlayPage />);
    await userEvent.click(screen.getByRole("button", { name: /start run/i }));
    // Pad only selects; Submit is the only thing that places. Real (random)
    // bank puzzle, so we only assert the loop stays live.
    await userEvent.click(screen.getByRole("button", { name: /digit 2/i }));
    await userEvent.click(screen.getByRole("button", { name: /^submit$/i }));
    // Depth is shown whether the run is still playing (HUD) or over (RunOver card).
    expect(screen.getAllByText(/depth/i).length).toBeGreaterThan(0);
  });

  it("still starts and accepts a placement with persistence wired", async () => {
    window.localStorage.clear();
    render(<PlayPage />);
    await userEvent.click(screen.getByRole("button", { name: /start run/i }));
    // board + pad present (persistence wiring didn't break the loop)
    expect(screen.getAllByRole("button").length).toBeGreaterThan(81);
    await userEvent.click(screen.getByRole("button", { name: /digit 2/i }));
    await userEvent.click(screen.getByRole("button", { name: /^submit$/i }));
    expect(screen.getAllByText(/depth/i).length).toBeGreaterThan(0);
  });
});
