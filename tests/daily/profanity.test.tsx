import { describe, expect, it } from "vitest";
import { isAllowedName } from "@/lib/daily/profanity";

describe("isAllowedName", () => {
  it("allows ordinary names", () => {
    expect(isAllowedName("Mike")).toBe(true);
    expect(isAllowedName("speed_demon")).toBe(true);
  });

  it("rejects empty / whitespace-only", () => {
    expect(isAllowedName("")).toBe(false);
    expect(isAllowedName("   ")).toBe(false);
  });

  it("rejects names longer than 20 chars", () => {
    expect(isAllowedName("a".repeat(21))).toBe(false);
    expect(isAllowedName("a".repeat(20))).toBe(true);
  });

  it("rejects banned substrings case-insensitively", () => {
    expect(isAllowedName("fuck")).toBe(false);
    expect(isAllowedName("ShItHead")).toBe(false);
  });
});
