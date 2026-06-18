import { describe, expect, it } from "vitest";
import { DEPTH_BAR_CAP, formatShareCard } from "@/lib/daily/shareCard";

describe("formatShareCard", () => {
  const card = formatShareCard({
    dateStr: "2026-06-17",
    depth: 9,
    score: 4820,
    timeMs: 192000,
    streak: 5,
    rank: 7,
  });

  it("includes date, depth, score, time, streak, rank, and the URL", () => {
    expect(card).toContain("Speedoku Daily");
    expect(card).toContain("2026-06-17");
    expect(card).toContain("Depth 9");
    expect(card).toContain("4,820 pts");
    expect(card).toContain("3:12");
    expect(card).toContain("5-day streak");
    expect(card).toContain("#7");
    expect(card).toContain("speedoku.app/daily");
  });

  it("renders a depth bar capped at DEPTH_BAR_CAP squares", () => {
    const depthLine = card.split("\n")[1];
    const filled = (depthLine.match(/🟦/g) ?? []).length;
    const empty = (depthLine.match(/⬜/g) ?? []).length;
    expect(filled).toBe(9);
    expect(filled + empty).toBe(DEPTH_BAR_CAP);
  });

  it("caps the depth bar when depth exceeds the cap", () => {
    const deep = formatShareCard({
      dateStr: "2026-06-17",
      depth: 30,
      score: 9000,
      timeMs: 300000,
      streak: 1,
      rank: 1,
    });
    const depthLine = deep.split("\n")[1];
    expect((depthLine.match(/🟦/g) ?? []).length).toBe(DEPTH_BAR_CAP);
    expect((depthLine.match(/⬜/g) ?? []).length).toBe(0);
  });

  it("is spoiler-safe — contains no Sudoku grid digits cluster", () => {
    // No row of 9 digits (a board leak) should appear.
    expect(card).not.toMatch(/\d{9}/);
  });

  it("includes the player name in the title line when name is provided", () => {
    const namedCard = formatShareCard({
      dateStr: "2026-06-17",
      depth: 9,
      score: 4820,
      timeMs: 192000,
      streak: 5,
      rank: 7,
      name: "Mike",
    });
    const titleLine = namedCard.split("\n")[0];
    expect(titleLine).toContain("Mike");
    expect(titleLine).toContain("Speedoku Daily");
  });

  it("does not append a trailing separator when name is omitted", () => {
    const noNameCard = formatShareCard({
      dateStr: "2026-06-17",
      depth: 9,
      score: 4820,
      timeMs: 192000,
      streak: 5,
      rank: 7,
    });
    const titleLine = noNameCard.split("\n")[0];
    // Title line should be exactly "🟦 Speedoku Daily · 2026-06-17" — no trailing " · "
    expect(titleLine).toBe("🟦 Speedoku Daily · 2026-06-17");
  });
});
