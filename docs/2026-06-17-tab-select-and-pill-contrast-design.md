---
title: Tab-cycles-selector + global Tailwind-v4 token fix (Hints pill contrast)
project: speedoku
client: generaitve_ventures
date: 2026-06-17
last_updated: 2026-06-17
status: design-locked — approved 2026-06-17, ready for writing-plans
branch: feat/tab-select-and-pill-contrast (worktree off main @ ecbf35d)
---

# Tab-cycles-selector + global Tailwind-v4 token fix

Two independent, approved changes bundled on one branch.

## A. Tab cycles the bottom number selector

### Decision (overrides a prior locked decision)

The 2026-06-16 design spec locked: *"`Tab`/`Shift+Tab` walk the next/previous available (empty) cell."*
**This is now overridden by Mike (2026-06-17):** the arrow keys own all board-cell
navigation; **Tab** is repurposed to move the active number to the **next
non-completed digit** in the bottom 3×3 selector, **Shift+Tab** to the previous one.

The reverse-path and four-directional-arrow invariants from the prior spec are
**preserved** — Shift+Tab still gives a reverse direction (now over digits), and the
four arrows are untouched (`skipToNextCell {traversal:"valid", axis, dir}`).

### Behavior

- **Tab** → set `activeDigit` to the next digit (numeric order 1→2→…→9, wrapping
  9→1) whose placed-count is `< 9` (i.e. still has remaining placements).
- **Shift+Tab** → previous such digit, wrapping 1→9.
- A digit qualifies on **remaining > 0 alone** — Tab lands on it even if it has no
  legally-placeable cell on the current board (Mike's call). In that case
  `activeCell` becomes `null` (identical to clicking that digit in the pad); the
  arrows then have nothing to walk until you Tab onward. This intentionally differs
  from the existing `nextIncompleteDigit` helper, which additionally requires a
  legal cell (used for auto-selection on start/advance — unchanged).
- Single remaining digit → Tab wraps to itself (no-op move). All digits complete →
  no change.
- `e.preventDefault()` is kept so Tab never moves browser focus.

### Implementation

1. **`lib/run/types.ts`** — new intent `{ type: "cycleNumber"; dir: 1 | -1 }`.
2. **`lib/run/reduce.ts`** —
   - New pure helper `stepIncompleteDigit(grid, fromDigit, dir): number | null`
     that walks 1–9 in `dir` from `fromDigit` (wrapping) and returns the first digit
     with `digitCount(grid, d) < 9` (no legal-cell requirement). Returns `null` when
     none exist.
   - New case `cycleNumber`: pick the directional null-start so wrapping is correct —
     `from = state.activeDigit ?? (dir === 1 ? 0 : 10)` (0 = "before digit 1" so dir 1
     starts at the lowest incomplete; 10 = "after digit 9" so dir −1 starts at the
     highest incomplete). `nd = stepIncompleteDigit(grid, from, dir)`; if `nd == null`
     return state unchanged; else
     `{ ...state, activeDigit: nd, activeCell: cellsForDigit(grid, nd)[0] ?? null }`.
   - `stepIncompleteDigit` walks `i = 1..9` as
     `d = ((from - 1 + i*dir) mod 9 + 9) mod 9 + 1` (positive modulo), returning the
     first `d` with `digitCount(grid, d) < 9`; from a real active digit, `i = 9` wraps
     back to itself, so a sole-remaining digit is a clean no-op.
3. **`lib/input/useInputController.ts`** — the `case "Tab"` now dispatches
   `cycleNumber` with `dir: e.shiftKey ? -1 : 1` instead of
   `skipToNextCell {traversal:"empty"}`. `preventDefault` retained.
4. **Remove the now-dead `"empty"` traversal** (root-cause cleanup, since Tab was its
   only caller):
   - drop `"empty"` from `Traversal` in `lib/run/types.ts` (→ `type Traversal = "valid"`),
   - delete the `if (intent.traversal === "empty")` branch + `emptyCells` use in the
     `skipToNextCell` case of `lib/run/reduce.ts`,
   - remove the obsolete "reverse empty-cell traversal (Tab / Shift+Tab)" describe block
     in `tests/run/reduce.test.ts`,
   - update the Tab/Shift+Tab expectations in `tests/ui/useInputController.test.tsx`.

### Tests (TDD, written first)

- `reduce.test.ts` — `cycleNumber`: forward cycle skips completed digits; wraps 9→1;
  Shift (dir −1) goes backward, wraps 1→9; lands on a remaining-but-no-legal-cell
  digit with `activeCell: null`; single-remaining-digit no-op; all-complete no-op;
  `activeDigit == null` start picks the first/last incomplete digit by direction.
- `useInputController.test.tsx` — Tab dispatches `{type:"cycleNumber", dir:1}`,
  Shift+Tab `{dir:-1}`; arrows still dispatch the four `skipToNextCell` valid moves.

## B. Global Tailwind-v4 token-utility fix + shared Hints pill

### Root cause

Repo is **Tailwind v4** with tokens declared in `@theme` (`app/globals.css`), which
auto-generates real utilities (`bg-accent`, `text-muted`, `rounded-card`, …). But
~26 sites use the **v3-era bracket-bare-variable form** `bg-[--color-accent]` /
`text-[--color-muted]` / `rounded-[--radius-card]`. In v4 that compiles to invalid CSS
(`background-color: --color-accent`) and is dropped. Only `bg-board` (Board.tsx) uses
the correct form. The Hints pill (`bg-[--color-accent] text-white`) therefore renders
with **no background** → white text on the near-white card = unreadable. The same bug
silently makes `text-[--color-muted]` labels inherit dark ink instead of muted grey.

### Decision

- **Repo-wide root-cause fix.** Convert every broken `…-[--token]` bracket utility to
  its v4 utility (`bg-[--color-accent]`→`bg-accent`, `text-[--color-muted]`→`text-muted`,
  `bg-[--color-cell]`→`bg-cell`, `bg-[--color-board]`→`bg-board`,
  `bg-[--color-cell-given]`→`bg-cell-given`, `bg-[--color-mint]`→`bg-mint`,
  `text-[--color-ink]`→`text-ink`, `text-[--color-accent]`→`text-accent`,
  `rounded-[--radius-card]`→`rounded-card`, `rounded-[--radius-cell]`→`rounded-cell`,
  and any others a full `\[--` sweep finds). Explicit `var(--…)` inside arbitrary
  values (e.g. `shadow-[var(--glow-accent)]`) is **valid** and left as-is; inline
  `style={{…var(--…)…}}` is valid and left as-is.
  - Known intended visual diff: muted labels currently rendering too-dark shift to
    proper muted grey. This is the correct token doing its job.
- **Shared pill component.** The pill is copy-pasted in 3 places (`Hud.tsx`, two in
  `app/play/page.tsx`). Extract a single `components/ui/Pill.tsx` (or `HintsBadge`)
  as the one source of truth so "the component library" has a fixable seam. The three
  call-sites render the shared component.
- **Contrast:** white text on `bg-accent` (#ff3d77) — restore the brand coral
  background. (~3.4:1; below strict WCAG AA for tiny text but the chosen brand look;
  the bug was the *missing* background, now restored.)

### Implementation

1. New `components/ui/Pill.tsx` — small presentational component:
   accent gradient/solid background, white uppercase bold text, `rounded-full`,
   `shadow-[var(--glow-accent)]`, size props as needed to cover the two existing sizes
   (px-3/py-0.5 text-[11px] and px-2.5/py-0.5 text-[10px]). Default content "hints".
2. Replace the 3 inline pill spans with `<Pill>`.
3. Repo-wide `\[--token]` → v4-utility sweep across `components/` and `app/`.

### Tests / verification

- `tests/ui/` — a small render test for `Pill` (renders children, has accent
  background class / `bg-accent`, white text).
- No utility-class unit test catches the v4 breakage; **verify visually**: run the
  dev server and screenshot the play page — the Hints pill reads clearly on its
  background, muted labels render muted grey. Full `vitest run` stays green (147+).

## C. Completed digit in the number pad reads green (board parity)

### Decision

When a digit is fully placed (`done`, remaining ≤ 0), the bottom 3×3 selector shows it
in **grey** (`text-[var(--color-cand)]`). The board renders completed digits in **mint
green** (`text-[var(--color-mint)]`, extrabold — `components/board/Cell.tsx`). Make the
pad match the board: a completed pad tile shows its digit in **mint green**.

### Implementation

- `components/number-pad/NumberPad.tsx` — in the text-color branch, change the `done`
  case from `text-[var(--color-cand)]` to the mint token (`text-mint`, the v4 utility,
  matching task B's convention). Keep the existing `done` background
  (`--color-cell-given`, opacity) and disabled state; only the digit color changes.
  Mint on the light given-cell background matches the board's completed-on-white look.

### Tests / verification

- `tests/ui/NumberPad.test.tsx` — a completed digit's button carries the mint text
  class (and an incomplete one does not). Visual check in the same dev-server pass as B.

## Out of scope

- No change to arrow-key board navigation, the never-blank-selector invariant, or
  scoring (the other agent owns `lib/run/scorer.ts` on a separate branch).
- No accessibility/AA redesign of the pill beyond restoring the background.
