// @vitest-environment jsdom
import "@/tests/support/jsdomLocalStorage";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import DailyPage from "@/app/daily/page";
import { dailyDateString } from "@/lib/daily/date";
import { createLocalDailyService } from "@/lib/daily/localDailyService";

describe("/daily", () => {
  beforeEach(() => window.localStorage.clear());

  it("opens on the gate, then starts the run on Start — run is playable, not routed to result", async () => {
    render(<DailyPage />);
    const start = await screen.findByRole("button", { name: /start/i });
    fireEvent.click(start);
    // "Give up" renders only during the run phase — proves we're in a live run.
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /give up/i }),
      ).toBeInTheDocument(),
    );
    // Flush all pending timers/promises so the consumed-day routing effect
    // has every opportunity to fire (replicates the bug: start() sets inProgress
    // record → effect sees inProgress → routes to result before the fix).
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    // After settling, the run must still be active — not the result screen.
    expect(screen.queryByText(/daily complete/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /give up/i }),
    ).toBeInTheDocument();
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

  it("revisit shows persisted depth/score/time — not zeros from a fresh store", async () => {
    // Pre-seed a finalized record for today BEFORE mounting.
    const s = createLocalDailyService();
    const today = dailyDateString();
    await s.startAttempt(today);
    await s.finalizeAttempt(today, {
      depth: 9,
      score: 4820,
      fastestSolveMs: 12000,
      totalMs: 192000,
      mode: "hints-on",
      seed: 1,
    });

    render(<DailyPage />);

    // Persisted score should appear (in result panel + share card + leaderboard).
    const scoreEls = await screen.findAllByText("4,820");
    expect(scoreEls.length).toBeGreaterThanOrEqual(1);

    // Persisted depth should appear (may appear multiple times — result panel + leaderboard).
    const depthEls = await screen.findAllByText("9");
    expect(depthEls.length).toBeGreaterThanOrEqual(1);

    // Persisted time (3:12 = 192 s) should appear — proves totalMs survived.
    const timeEls = await screen.findAllByText("3:12");
    expect(timeEls.length).toBeGreaterThanOrEqual(1);

    // Gate "Start Today" button must NOT be present.
    expect(
      screen.queryByRole("button", { name: /start today/i }),
    ).not.toBeInTheDocument();
  });
});
