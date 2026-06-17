import type { Mask } from "./types";

export const bit = (d: number): Mask => 1 << (d - 1);

export function popcount(m: Mask): number {
  let c = 0;
  while (m) {
    m &= m - 1;
    c++;
  }
  return c;
}

export function digitsOf(m: Mask): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 9; d++) if (m & bit(d)) out.push(d);
  return out;
}

export function onlyDigit(m: Mask): number {
  return popcount(m) === 1 ? digitsOf(m)[0] : 0;
}
