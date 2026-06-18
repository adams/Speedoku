// tests/ui/RunOver.test.tsx
// @vitest-environment jsdom
import "@/tests/support/jsdomLocalStorage";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { RunOver } from "@/components/chrome/RunOver";

describe("RunOver", () => {
  beforeEach(() => window.localStorage.clear());

  it("offers a Daily teaser and a Home link", async () => {
    render(
      <RunOver
        summary={{
          depth: 3,
          score: 100,
          fastestSolveMs: null,
          totalMs: 1000,
          mode: "hints-on",
          seed: 1,
        }}
        onPlayAgain={() => {}}
      />,
    );
    // Play again still present
    expect(
      screen.getByRole("button", { name: /play again/i }),
    ).toBeInTheDocument();
    // Home link present
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
    // Daily teaser resolves to its "try" link (no daily record in fresh localStorage)
    expect(
      await screen.findByRole("link", { name: /daily challenge/i }),
    ).toHaveAttribute("href", "/daily");
  });
});
