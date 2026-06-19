// @vitest-environment jsdom
// tests/pwa/platform.test.ts
import { afterEach, describe, expect, test, vi } from "vitest";
import { isIosSafari, isStandalone } from "@/lib/pwa/platform";

function setUA(ua: string) {
  Object.defineProperty(navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const IPHONE_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1";
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";

afterEach(() => vi.unstubAllGlobals());

describe("isIosSafari", () => {
  test("true for iPhone Safari", () => {
    setUA(IPHONE_SAFARI);
    expect(isIosSafari()).toBe(true);
  });
  test("false for iOS Chrome (CriOS)", () => {
    setUA(IPHONE_CHROME);
    expect(isIosSafari()).toBe(false);
  });
  test("false for Android Chrome", () => {
    setUA(ANDROID_CHROME);
    expect(isIosSafari()).toBe(false);
  });
});

describe("isStandalone", () => {
  test("true when display-mode standalone matches", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: q.includes("standalone"),
    }));
    expect(isStandalone()).toBe(true);
  });
  test("false in a normal browser tab", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    expect(isStandalone()).toBe(false);
  });
});
