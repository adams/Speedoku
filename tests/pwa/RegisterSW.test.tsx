// @vitest-environment jsdom
// tests/pwa/RegisterSW.test.tsx
import { render, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { RegisterSW } from "@/components/pwa/RegisterSW";

afterEach(() => {
  delete (navigator as { serviceWorker?: unknown }).serviceWorker;
});

test("registers /sw.js on mount when supported", async () => {
  const register = vi.fn().mockResolvedValue({});
  Object.defineProperty(navigator, "serviceWorker", {
    value: { register },
    configurable: true,
  });
  render(<RegisterSW />);
  await waitFor(() => expect(register).toHaveBeenCalledWith("/sw.js"));
});

test("no-ops without throwing when serviceWorker is unsupported", () => {
  Object.defineProperty(navigator, "serviceWorker", {
    value: undefined,
    configurable: true,
  });
  expect(() => render(<RegisterSW />)).not.toThrow();
});
