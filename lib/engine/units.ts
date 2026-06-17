const idx = (r: number, c: number) => r * 9 + c;

const rows: number[][] = [];
const cols: number[][] = [];
const boxes: number[][] = [];
for (let i = 0; i < 9; i++) {
  rows.push(Array.from({ length: 9 }, (_, c) => idx(i, c)));
  cols.push(Array.from({ length: 9 }, (_, r) => idx(r, i)));
}
for (let br = 0; br < 3; br++)
  for (let bc = 0; bc < 3; bc++) {
    const b: number[] = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) b.push(idx(br * 3 + r, bc * 3 + c));
    boxes.push(b);
  }

export const UNITS: number[][] = [...rows, ...cols, ...boxes];

export const UNITS_OF: number[][][] = Array.from({ length: 81 }, (_, s) =>
  UNITS.filter((u) => u.includes(s)),
);

export const PEERS: number[][] = Array.from({ length: 81 }, (_, s) => {
  const set = new Set<number>();
  for (const u of UNITS_OF[s]) for (const c of u) if (c !== s) set.add(c);
  return [...set];
});
