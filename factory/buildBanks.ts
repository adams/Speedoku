import { writeFileSync } from "node:fs";
import type { Band, BankFile } from "../lib/engine/banks";
import { mulberry32 } from "../lib/engine/rng";
import { carvePuzzle } from "./carvePuzzle";
import { combinedRatings } from "./grade";

// CLI: pnpm build:banks <bandsCount> <perBand> <outPath>
const bandsCount = Number(process.argv[2] ?? 12);
const perBand = Number(process.argv[3] ?? 40);
const out = process.argv[4] ?? "lib/engine/banks/banks.fixture.json";

const rng = mulberry32(20260616);
const oversample = bandsCount * perBand * 3;
const puzzles = Array.from(
  { length: oversample },
  () => carvePuzzle(rng).puzzle,
);
const ratings = combinedRatings(puzzles);

// Sort puzzles by rating, then cut into equal-count contiguous (gap-free) bands.
const indexed = puzzles
  .map((puzzle, i) => ({ puzzle, rating: ratings[i] }))
  .sort((a, b) => a.rating - b.rating);

const bands: Band[] = [];
const per = Math.floor(indexed.length / bandsCount);
for (let b = 0; b < bandsCount; b++) {
  const slice = indexed.slice(b * per, (b + 1) * per);
  if (slice.length === 0) continue;
  const lo = b === 0 ? slice[0].rating : bands[bands.length - 1].hi;
  const hi =
    b === bandsCount - 1
      ? slice[slice.length - 1].rating + 1
      : indexed[(b + 1) * per].rating;
  bands.push({ lo, hi, seeds: slice.slice(0, perBand).map((s) => s.puzzle) });
}

const file: BankFile = { bands };
writeFileSync(out, JSON.stringify(file));
console.log(
  `Wrote ${file.bands.length} bands (${perBand}/band target) to ${out}`,
);
