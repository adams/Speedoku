// @vitest-environment jsdom
import "@/tests/support/jsdomLocalStorage";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("landing", () => {
  beforeEach(() => window.localStorage.clear());

  it("leads with a Free Play CTA and surfaces the Daily teaser", async () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: /free play/i })).toHaveAttribute(
      "href",
      "/play",
    );
    // Daily teaser resolves to the 'try' link on a fresh device
    expect(
      await screen.findByRole("link", { name: /daily challenge/i }),
    ).toHaveAttribute("href", "/daily");
  });
});
