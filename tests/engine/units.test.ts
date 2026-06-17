import { expect, test } from "vitest";
import { bit, digitsOf, onlyDigit, popcount } from "@/lib/engine/bits";
import { PEERS, UNITS, UNITS_OF } from "@/lib/engine/units";

test("27 units of 9 cells each", () => {
  expect(UNITS.length).toBe(27);
  for (const u of UNITS) expect(u.length).toBe(9);
});

test("each cell has 3 units and 20 peers", () => {
  for (let s = 0; s < 81; s++) {
    expect(UNITS_OF[s].length).toBe(3);
    expect(PEERS[s].length).toBe(20);
    expect(PEERS[s]).not.toContain(s);
  }
});

test("cell 0 peers = its row, col, box minus itself", () => {
  // row 0: 1..8 ; col 0: 9,18,...,72 ; box 0: 1,2,10,11,19,20
  expect(new Set(PEERS[0])).toEqual(
    new Set([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 18, 27, 36, 45, 54, 63, 72, 10, 11, 19, 20,
    ]),
  );
});

test("bit helpers", () => {
  expect(bit(1)).toBe(1);
  expect(bit(9)).toBe(256);
  expect(popcount(0b101)).toBe(2);
  expect(digitsOf(0b100000101)).toEqual([1, 3, 9]);
  expect(onlyDigit(bit(5))).toBe(5);
  expect(onlyDigit(0b11)).toBe(0);
});
