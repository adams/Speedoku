// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hud } from "@/components/hud/Hud";
import type { BankFile } from "@/lib/engine/banks";
import fixture from "@/lib/engine/banks/banks.fixture.json";
import { createRunStore } from "@/lib/run/store";

const bank = fixture as BankFile;

describe("Hud", () => {
  it("renders depth, score and the hints badge", () => {
    const store = createRunStore(bank, {
      seed: 1,
      mode: "hints-on",
      clock: () => 0,
    });
    render(<Hud store={store} />);
    expect(screen.getByText(/depth/i)).toBeInTheDocument();
    expect(screen.getByText(/score/i)).toBeInTheDocument();
    expect(screen.getByText(/hints/i)).toBeInTheDocument();
  });
});
