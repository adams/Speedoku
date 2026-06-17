import { describe, expect, it } from "vitest";
import { mmss } from "@/lib/ui/format";

describe("mmss", () => {
  it("formats minutes and seconds", () => {
    expect(mmss(0)).toBe("0:00");
    expect(mmss(63000)).toBe("1:03");
    expect(mmss(600000)).toBe("10:00");
  });
  it("clamps negatives", () => {
    expect(mmss(-50)).toBe("0:00");
  });
});
