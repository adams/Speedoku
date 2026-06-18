import { describe, expect, it } from "vitest";
import {
  dailyDateString,
  nextDateString,
  previousDateString,
} from "@/lib/daily/date";

describe("dailyDateString", () => {
  it("returns the PT calendar date as YYYY-MM-DD", () => {
    // 2026-06-17 18:00 UTC is 11:00 PDT same day.
    expect(dailyDateString(new Date("2026-06-17T18:00:00Z"))).toBe(
      "2026-06-17",
    );
  });

  it("uses PT, not UTC, across the day boundary", () => {
    // 2026-06-18 05:00 UTC is 2026-06-17 22:00 PDT — still the 17th in PT.
    expect(dailyDateString(new Date("2026-06-18T05:00:00Z"))).toBe(
      "2026-06-17",
    );
    // 2026-06-18 08:00 UTC is 2026-06-18 01:00 PDT — now the 18th.
    expect(dailyDateString(new Date("2026-06-18T08:00:00Z"))).toBe(
      "2026-06-18",
    );
  });

  it("handles standard time (PST, winter)", () => {
    // 2026-01-15 07:00 UTC is 2026-01-14 23:00 PST — still the 14th.
    expect(dailyDateString(new Date("2026-01-15T07:00:00Z"))).toBe(
      "2026-01-14",
    );
  });
});

describe("previousDateString / nextDateString", () => {
  it("steps one calendar day", () => {
    expect(previousDateString("2026-06-17")).toBe("2026-06-16");
    expect(nextDateString("2026-06-17")).toBe("2026-06-18");
  });

  it("crosses month and year boundaries", () => {
    expect(previousDateString("2026-03-01")).toBe("2026-02-28");
    expect(nextDateString("2026-12-31")).toBe("2027-01-01");
  });
});
