import { describe, expect, test } from "vitest";
import { routeStrategy } from "@/lib/pwa/route-strategy";

const O = "https://speedoku.app";

describe("routeStrategy", () => {
  test("hashed static chunks → cache-first", () => {
    expect(routeStrategy({ url: `${O}/_next/static/chunks/abc123.js` })).toBe(
      "cache-first",
    );
  });
  test("fonts → cache-first", () => {
    expect(routeStrategy({ url: `${O}/_next/static/media/geist.woff2` })).toBe(
      "cache-first",
    );
  });
  test("generated icons → cache-first", () => {
    expect(routeStrategy({ url: `${O}/icons/512` })).toBe("cache-first");
    expect(routeStrategy({ url: `${O}/apple-icon` })).toBe("cache-first");
  });
  test("navigations → network-first", () => {
    expect(routeStrategy({ url: `${O}/daily`, mode: "navigate" })).toBe(
      "network-first",
    );
  });
  test("everything else → network", () => {
    expect(routeStrategy({ url: `${O}/some/data`, mode: "cors" })).toBe(
      "network",
    );
  });
});
