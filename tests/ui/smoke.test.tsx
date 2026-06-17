// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function Hello() {
  return <h1>hello board</h1>;
}

describe("RTL environment", () => {
  it("renders a component into jsdom", () => {
    render(<Hello />);
    expect(
      screen.getByRole("heading", { name: "hello board" }),
    ).toBeInTheDocument();
  });
});
