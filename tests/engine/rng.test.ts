import { expect, test } from "vitest";
import { mulberry32, shuffle } from "@/lib/engine/rng";

test("mulberry32 is deterministic for a seed", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});

test("shuffle is a permutation and seed-deterministic", () => {
  const base = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const s1 = shuffle(base, mulberry32(7));
  const s2 = shuffle(base, mulberry32(7));
  expect(s1).toEqual(s2);
  expect([...s1].sort((x, y) => x - y)).toEqual(base);
  expect(base).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]); // input untouched
});
