import { writeFileSync } from "node:fs";
import type { Band, BankFile } from "../lib/engine/banks";
import { mulberry32 } from "../lib/engine/rng";
import { carvePuzzle } from "./carvePuzzle";
import { combinedRatings } from "./grade";

// CLI: pnpm build:banks <bandsCount> <perBand> <outPath>
const bandsCount = Number(process.argv[2] ?? 24);
const perBand = Number(process.argv[3] ?? 60);
const out = process.argv[4] ?? "lib/engine/banks/banks.fixture.json";
const TRIM = 0.02; // drop the extreme 2% rating tails (freak outliers) before banding
const EMPTIES_MIN = 6; // near-solved floor (Enter-mashable level 1)
const EMPTIES_MAX = 57; // ~minimal carve

const rng = mulberry32(20260616);
const oversample = Math.ceil((bandsCount * perBand * 3) / (1 - 2 * TRIM));
// Spread the clue-count: each puzzle carved to a random target-empties across the
// range, so the bank holds near-solved (easy) through minimal (hard) puzzles.
const puzzles = Array.from({ length: oversample }, () => {
  const targetEmpties =
    EMPTIES_MIN + Math.floor(rng() * (EMPTIES_MAX - EMPTIES_MIN + 1));
  return carvePuzzle(rng, { targetEmpties }).puzzle;
});
const ratings = combinedRatings(puzzles);

// Sort by technique rating, trim the extreme outlier tails, then cut into
// equal-count contiguous (gap-free) rating bands carrying per-seed ratings.
const indexed = puzzles
  .map((puzzle, i) => ({ puzzle, rating: ratings[i] }))
  .sort((a, b) => a.rating - b.rating);
const trimN = Math.floor(indexed.length * TRIM);
const core = indexed.slice(trimN, indexed.length - trimN);

const bands: Band[] = [];
const per = Math.floor(core.length / bandsCount);
for (let b = 0; b < bandsCount; b++) {
  const slice = core.slice(b * per, (b + 1) * per);
  if (slice.length === 0) continue;
  const lo = b === 0 ? slice[0].rating : bands[bands.length - 1].hi;
  const hi =
    b === bandsCount - 1
      ? slice[slice.length - 1].rating + 1
      : core[(b + 1) * per].rating;
  const chosen = slice.slice(0, perBand);
  bands.push({
    lo,
    hi,
    seeds: chosen.map((s) => s.puzzle),
    ratings: chosen.map((s) => s.rating),
  });
}

const file: BankFile = { bands };
writeFileSync(out, JSON.stringify(file));
console.log(
  `Wrote ${file.bands.length} bands (${perBand}/band, ${TRIM * 100}% tails trimmed, empties ${EMPTIES_MIN}-${EMPTIES_MAX}) to ${out}`,
);
