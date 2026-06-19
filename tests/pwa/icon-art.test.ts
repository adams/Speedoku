import { describe, expect, test } from "vitest";
import { iconSpec } from "@/lib/pwa/icon-art";

describe("iconSpec", () => {
  test("maps the three known params", () => {
    expect(iconSpec("192")).toEqual({ size: 192, maskable: false });
    expect(iconSpec("512")).toEqual({ size: 512, maskable: false });
    expect(iconSpec("maskable")).toEqual({ size: 512, maskable: true });
  });
  test("returns null for an unknown param", () => {
    expect(iconSpec("999")).toBeNull();
    expect(iconSpec("favicon")).toBeNull();
  });
});
