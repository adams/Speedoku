// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pill } from "@/components/ui/Pill";

describe("Pill", () => {
  it("renders its label on the accent background with white text", () => {
    render(<Pill>hints</Pill>);
    const el = screen.getByText("hints");
    expect(el.className).toContain("bg-accent");
    expect(el.className).toContain("text-white");
  });

  it("uses the v4 utility, not the v4-broken bracket-variable form", () => {
    // bg-[--color-accent] compiles to invalid CSS in Tailwind v4 (no background) —
    // the bug that made the pill unreadable. Guard against reintroducing it.
    render(<Pill>hints</Pill>);
    expect(screen.getByText("hints").className).not.toContain(
      "bg-[--color-accent]",
    );
  });

  it("merges a caller className for positioning", () => {
    render(<Pill className="absolute -top-2.5 right-4">hints</Pill>);
    expect(screen.getByText("hints").className).toContain("absolute");
  });
});
