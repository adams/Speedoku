export type Grid = number[]; // length 81, row-major, 0 = empty
export type Mask = number; // 9-bit candidate bitmask
export const ALL_DIGITS: Mask = 0b111111111; // 511
export const N = 81;
