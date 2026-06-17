import { writeFileSync } from "node:fs";
import type { BankFile } from "../lib/engine/banks";
import { mulberry32 } from "../lib/engine/rng";
import { carvePuzzle } from "./carvePuzzle";
import { gradeDifficulty } from "./grade";

// CLI: pnpm build:banks <bandsCount> <perBand> <outPath>
const bandsCount = Number(process.argv[2] ?? 30);
const perBand = Number(process.argv[3] ?? 50);
const out = process.argv[4] ?? "lib/engine/banks/banks.json";

const ratings: { rating: number; puzzle: number[] }[] = [];
const rng = mulberry32(20260616);
const targetTotal = bandsCount * perBand * 4; // oversample, then bucket
for (let i = 0; i < targetTotal; i++) {
  const { puzzle } = carvePuzzle(rng);
  ratings.push({ rating: gradeDifficulty(puzzle), puzzle });
}
const lo = Math.min(...ratings.map((r) => r.rating));
const hi = Math.max(...ratings.map((r) => r.rating)) + 1;
const width = (hi - lo) / bandsCount;
const file: BankFile = { bands: [] };
for (let b = 0; b < bandsCount; b++) {
  const bLo = lo + b * width,
    bHi = lo + (b + 1) * width;
  const seeds = ratings
    .filter((r) => r.rating >= bLo && r.rating < bHi)
    .slice(0, perBand)
    .map((r) => r.puzzle);
  if (seeds.length) file.bands.push({ lo: bLo, hi: bHi, seeds });
}
writeFileSync(out, JSON.stringify(file));
console.log(`Wrote ${file.bands.length} bands to ${out}`);
