// @vitest-environment jsdom
import "@/tests/support/jsdomLocalStorage";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import DailyPage from "@/app/daily/page";

describe("/daily", () => {
  beforeEach(() => window.localStorage.clear());

  it("opens on the gate, then starts the run on Start", async () => {
    render(<DailyPage />);
    const start = await screen.findByRole("button", { name: /start/i });
    fireEvent.click(start);
    // The HUD (depth/score) appears once the run begins.
    await waitFor(() => expect(screen.getByText(/depth/i)).toBeInTheDocument());
  });

  it("revisiting after a consumed day shows the result, not the gate", async () => {
    // First mount: start and give up to consume the day.
    const first = render(<DailyPage />);
    fireEvent.click(await screen.findByRole("button", { name: /start/i }));
    fireEvent.click(await screen.findByRole("button", { name: /give up/i }));
    await screen.findByText(/daily complete/i);
    first.unmount();

    // Second mount (same day): straight to the result.
    render(<DailyPage />);
    await waitFor(() =>
      expect(screen.getByText(/daily complete/i)).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: /start today/i }),
    ).not.toBeInTheDocument();
  });
});
