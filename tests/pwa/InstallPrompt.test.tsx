// @vitest-environment jsdom
import "@/tests/support/jsdomLocalStorage";
// tests/pwa/InstallPrompt.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const detectors = vi.hoisted(() => ({
  isStandalone: vi.fn(() => false),
  isIosSafari: vi.fn(() => false),
}));
vi.mock("@/lib/pwa/platform", () => detectors);

import { InstallPrompt } from "@/components/pwa/InstallPrompt";

beforeEach(() => {
  localStorage.clear();
  detectors.isStandalone.mockReturnValue(false);
  detectors.isIosSafari.mockReturnValue(false);
});
afterEach(() => vi.clearAllMocks());

test("shows Install button after beforeinstallprompt and calls prompt() on click", async () => {
  render(<InstallPrompt />);
  const prompt = vi.fn().mockResolvedValue(undefined);
  const evt = Object.assign(new Event("beforeinstallprompt"), { prompt });
  fireEvent(window, evt);
  const btn = await screen.findByRole("button", { name: /install/i });
  fireEvent.click(btn);
  expect(prompt).toHaveBeenCalledOnce();
});

test("shows the iOS A2HS hint and remembers dismissal", async () => {
  detectors.isIosSafari.mockReturnValue(true);
  const { unmount } = render(<InstallPrompt />);
  const dismiss = await screen.findByRole("button", { name: /dismiss/i });
  fireEvent.click(dismiss);
  expect(screen.queryByText(/add to home screen/i)).toBeNull();
  expect(localStorage.getItem("speedoku:v1:pwa:iosHintDismissed")).toBe("1");
  // stays dismissed on remount
  unmount();
  render(<InstallPrompt />);
  await waitFor(() =>
    expect(screen.queryByText(/add to home screen/i)).toBeNull(),
  );
});

test("renders nothing when already installed (standalone)", () => {
  detectors.isStandalone.mockReturnValue(true);
  detectors.isIosSafari.mockReturnValue(true);
  const { container } = render(<InstallPrompt />);
  expect(container).toBeEmptyDOMElement();
});
