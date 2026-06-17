---
title: Speedoku v2 — Design Spec
project: speedoku
client: generaitve_ventures
date: 2026-06-16
last_updated: 2026-06-16
status: design-locked — pre-implementation (writing-plans not yet started)
---

# Speedoku v2 — Design Spec

## Status & decision log

**Current state:** design locked; ready for the implementation plan when Mike says go. Validated against the live prototype by playtesting.

| Date | Decision |
|---|---|
| 2026-06-16 | Scope = pure rogue run, local-first PWA; no shields/meta in v1. |
| 2026-06-16 | **Failure model = death-on-unsolvable** (not instant-death-on-wrong) — matches the live game, confirmed by playtest. |
| 2026-06-16 | **Run difficulty = smooth curve, no visible tiers**; technique grading is the internal measure + bank buckets + scoring weight. |
| 2026-06-16 | **Scoring = par-relative with a floor**, difficulty-weighted (speed rewarded, survival never punished) — proposed shape, constants TBD. |
| 2026-06-16 | Engine = pre-graded unique-solution banks + runtime transforms; runtime solver = Norvig pytudes port; grader = build-time only. |
| 2026-06-16 | Stack = Next.js 15 · Tailwind v4 + shadcn · Motion · Zustand · Vitest/Playwright · Biome · pnpm · Supabase · Vercel. |
| 2026-06-16 | Locked five v1 keepers (auto-candidate numerals, live best-pace HUD line, two Tab/arrow traversals, click-vs-tap commit, clue-count anchor). |
| 2026-06-16 | **Identity: the run *is* the game.** No standalone single-puzzle "classic" mode — every session is a rogue run. |
| 2026-06-16 | **Modes: v1 ships hints-ON only.** Hints-OFF hardcore + its separate leaderboard deferred; the mode/leaderboard *seam* stays in the architecture. |
| 2026-06-16 | **Scoring soul:** no lethal clock → the *score* is the only thing enforcing speed → scoring is **speed-dominant** (par-relative with floor). Without this the game decays into "Sudoku roguelike." |
| 2026-06-16 | **Difficulty fairness:** the smooth curve must be a **standardized `difficulty(depth)` with a tight variance band** — equivalent difficulty at equal depth (fair leaderboard) but novel instances (no memorization). Requires a **continuous numeric difficulty rating**, not coarse tiers. |
| 2026-06-16 | **Bank sizing:** ~30–60 fine rating bands × ~500–2,000 non-isomorphic seeds (~30–100k total, one-time build) × ~10¹² difficulty-preserving transforms; store canonical, transform at runtime. The calibrated engine is the **anti-clone moat**. |
| 2026-06-16 | **Growth model: unlimited ranked runs (retention) + a Wordle-style Daily Challenge (virality).** Daily is a v1 priority (seed + local result + spoiler-safe share card); the *global* daily leaderboard is Phase 3. Strategy detail: [[clients/generaitve_ventures/wiki/topics/speedoku-strategy]]. |

## What Speedoku is

Speedoku is a rogue-like, speed-first take on Sudoku. The grid is standard 9×9; the twist is the interaction model and the stakes. You select a number, the board shows where that number can legally go, and you place it fast. Illegal moves are blocked, but you *can* place legal-but-wrong numbers — and **driving the board into a provably unsolvable state ends the run** ("you've put the puzzle into an unsolvable state"). Time is the score, not a death clock — the risk is cornering yourself. A run chains puzzles of escalating, technique-graded difficulty until you make the board unsolvable.

> **Failure model (validated by playing the live old version, 2026-06-16):** the death condition is *unsolvable-state*, **not** instant-death on the first wrong move. You can place wrong-but-legal numbers and recover as long as a completion still exists; you die only when you've made the puzzle impossible. This is forgiving, momentum-driven, and recoverable — the feel Mike likes — and it is the chosen model for v2. (An earlier draft of this spec specified instant-death-on-wrong; that was corrected after playtesting.)

This is a from-scratch rebuild. A prototype exists at `github.com/adams/Speedoku` (Vite + React, ~2025) and proved the core number-first mechanic; v2 keeps that soul and discards the implementation (a 928-line context god-object, inline desktop-only styles, `setTimeout` sequencing hacks, and a generator with no uniqueness or difficulty guarantee).

## Locked decisions

- **The run *is* the game.** A run is a chain of puzzles; difficulty escalates; a run ends when you make the board unsolvable. **No standalone single-puzzle "classic" mode** — every session is a run. No lives, no shields, no power-ups, no meta-progression in v1. High stakes, simple. (Shields/hints/economy are explicitly deferred — they are not what makes it great.) The chaining + escalating *run* is new in v2; each individual puzzle is the old single-puzzle die-on-unsolvable game.
- **Game structure = unlimited ranked runs + a daily challenge.** Unlimited play is the core (retention, skill-building, "one more run," global score leaderboard); a **Wordle-style Daily Challenge** — one fixed seed+sequence for everyone, one scored attempt, spoiler-safe share card, streak — is the viral layer. The two reinforce each other. Full rationale: [[clients/generaitve_ventures/wiki/topics/speedoku-strategy]].
- **Unsolvable = death, time = score.** The only failure is cornering yourself — placing legal-but-wrong numbers until no completion remains. The clock never kills you; it scores you. `Score = Σ(per-puzzle points)` over puzzles survived. Faster + deeper = higher.
- **Illegal moves are blocked; wrong-but-legal moves are allowed.** You cannot place a digit that conflicts with its row/column/box right now (the `isSafe` gate). You *can* place a legal digit that isn't the solution's value — and that is how you eventually corner yourself. After every placement the engine runs a solvability check; the move that leaves the board with no completion triggers Game Over.
- **Number-first input is the signature feel.** Select a digit → the board enters Focus Mode (valid cells lit, the rest greyed) → active cell pre-selected → place it or skip to the next valid cell → after placing, the same digit stays selected and auto-advances to the next valid cell; when a digit is exhausted, auto-jump to the next incomplete digit.
- **Positional hints are a MODE, not an aid you toggle** — but **v1 ships hints-ON only.** Hints-on (Focus Mode highlighting; the default, drawn from Good Sudoku) is the v1 game. Hints-off (no highlighting; hardcore) and its *separate* leaderboard are deferred; the mode/leaderboard seam stays in the architecture so it drops in later without a rewrite. (Mike's own usage hunch: the game is rarely played without hints.) Mode is chosen at run start and locked for the run.
- **Onboarding:** puzzle 1 of any run is a fixed, untimed, fail-proof tutorial. Timer and stakes begin on puzzle 2.
- **Platform:** gorgeous, mobile-first, installable PWA. Local-first and fully playable offline with no account.
- **Difficulty is a standardized smooth curve** (technique-graded internally, not clue-count-graded). The player experiences continuously-harder puzzles with **no tier chrome** — but the curve must be *fair*: difficulty at a given depth is **standardized to a tight variance band** (two players at depth 10 face equivalently-hard puzzles), while the instances are **freshly random** (no memorization). Standardized difficulty + novel instance = **speed is the only variable that matters** — the thing that earns the name SPEEDoku. This requires a **continuous numeric difficulty rating**, not coarse tiers (see §engine).

## The two modes (why they are separate leaderboards)

**v1 scope: hints-ON only.** The table below describes the full two-mode design; v1 builds and balances the hints-ON column. Hints-OFF (and its separate leaderboard) is deferred — but the seam is kept so it's additive. Both modes share the same death condition (unsolvable state) and the same block on illegal moves; they differ **only in the assist** — whether candidate cells are shown — which is the live game's "Pencil Mode: On/Off" toggle, here promoted to a run-locked mode with its own leaderboard.

| | Hints-ON (default) | Hints-OFF (hardcore) |
|---|---|---|
| Board | Focus Mode: legal cells for the selected number are lit / candidate-marked, the rest greyed | No candidate marks; you find legal cells yourself |
| You can place | any legal cell (illegal blocked) | any legal cell (illegal blocked) |
| **Death =** | board becomes unsolvable | board becomes unsolvable |
| Skill tested | placing fast without cornering yourself | the above **plus** scanning for legal cells unaided |

## Module architecture

The central goal is to fix v1's core flaw: one object mixing pure game logic, React state, and timing hacks. v2 splits into pure, independently testable units.

```
Next.js shell (Vercel):  /  landing (SEO) · /play · /daily · /leaderboard
        │
   UI layer (client) ──subscribes──► RunState (Zustand state machine)
   • Board, Cell, NumberSelector (bespoke)        │
   • shadcn chrome (modals, menus)        validates│ finalizes
        ▲                                  via     ▼        ▼
        │ candidatesFor()          PuzzleEngine (pure)   Scorer (pure)
        └──────────────────────────────                      │ persist
                                                       DataService interface
                                                       Local | Supabase adapters
```

- **PuzzleEngine** — pure TS, no React. Seedable RNG; `candidatesFor(grid, num)` (Focus Mode); `isSafe` (illegal-move gate); `isSolvable(grid)` (does a completion still exist? — the death check, run after every move); `countSolutions(grid, limit=2)` (build-time uniqueness); validity-preserving transforms; bank loader. The unique solution is known but is not needed to judge moves — death is solvability-based, not solution-equality — so the solution is kept only for optional future reveals.
- **RunState** — Zustand store + explicit state machine. Run position, tier, mode, active number, active cell, elapsed time, status (`tutorial → playing → runOver`). Intents: `selectNumber`, `skipToNextCell`, `placeNumber`. Replaces v1's context **and** every `setTimeout(…,0)`.
- **Scorer** — pure. Folds run events into a score. No state of its own.
- **InputController** — normalizes keyboard + touch/pointer into RunState intents; owns auto-advance. One code path, two input surfaces.
- **DataService** — interface (`saveRun`, `getBests`, `getDaily`, `submitScore`) with a **LocalAdapter** (IndexedDB, default, offline) and a **SupabaseAdapter** (leaderboards/daily, opt-in). Local-first; cloud additive. A future **GameCenterAdapter** slots in at the Capacitor phase.

**How a run ends:** `InputController → RunState.placeNumber`. If the move is illegal (`!isSafe`) it is rejected outright (no state change), exactly like the live game. If legal, it is placed and the engine runs `isSolvable(grid)`. Still solvable → auto-advance, play on. No completion exists → `status: runOver` → `Scorer` finalizes → `DataService.saveRun`. Completing a puzzle (full valid grid) advances to the next, harder puzzle. The solvability check lives in exactly one place.

## The puzzle engine (build-time factory + runtime core)

Generating sophisticated, skill-mapped puzzles on the fly is the trap that sank the earlier attempt: live-generated puzzles were not sophisticated enough and were not mapped to the techniques needed to solve them. v2 avoids this with **pre-graded seed banks + runtime transforms.**

```
BUILD TIME (offline factory, run rarely)         RUNTIME (shipped, tiny, offline)
generate unique-solution puzzles                 pick a seed from the tier bank
grade each by hardest technique required   ──►   apply a random validity-preserving
bucket into tiers T1–T5                  JSON    transform (digit-permute, band/stack
(uses sudoku-core / @algorithm.ts)       banks   swap, rotate/reflect)
                                                 → instant, graded, unique puzzle
```

- **Uniqueness** via `countSolutions(grid, limit=2)` — Norvig's `search` adapted to count to the second solution and stop. Standard, from the research.
- **Difficulty grading** via a human-style solver (`solveLogically(grid, maxTechniqueLevel)`) that applies techniques in increasing order and classifies a puzzle by the hardest one it needs. This solver is **build-time only** — it is the gnarly part (X-Wing/XY-Wing detectors), so v1 leans on an existing library (`sudoku-core` or `@algorithm.ts/sudoku`) to generate and grade the banks. It never ships.
- **Runtime core is Norvig-style constraint propagation**, ported from the pytudes Sudoku notebook (the refined version of the classic essay). Model: `squares` (81) · `units` (27) · `peers` (20/square); a **Grid** is `Map<Square, DigitSet>` where a `DigitSet` is a candidate set (string/bitmask), so grid copies are cheap (no deepcopy). Two propagation strategies — `eliminate(grid, s, d)` (a square down to one digit eliminates it from peers) and `fill(grid, s, d)` (a unit with one place for a digit fills it) — plus `constrain` (init) and `search` (DFS with the minimum-remaining-values heuristic). ~350 puzzles/sec, hardest ~3ms, offline. It computes per-cell candidates instantly (that *is* Focus Mode), gates illegal moves (`isSafe`), and powers both the runtime `isSolvable` death-check (does `search` find any completion?) and the build-time `countSolutions` uniqueness check. The pytudes core is **solver-only** — it has no generation, uniqueness, or difficulty rating; those are ours (build-time factory + `countSolutions`). The shipped runtime needs only: bank JSON + transform function + this core.
- **Transforms preserve both uniqueness and tier.** Relabeling digits or reflecting the grid does not change which technique cracks it, so a modest bank (~100 seeds/tier) × transforms = effectively infinite, correctly-graded, instant puzzles.
- **Difficulty scale (internal — the player never sees it) must be a *continuous numeric rating*.** Coarse T1–T5 buckets are too lumpy for a *fair* speed leaderboard (two "T3" puzzles can differ a lot — exactly the crapshoot to avoid). So the grader assigns each puzzle a **numeric difficulty score** (Sudoku-Explainer-style: the weighted cost of the techniques it requires). Technique names stay the human-readable scale:
  `singles → locked candidates / pairs → triples / hidden subsets → X-Wing / Swordfish → XY-Wing+`
  The run defines a standardized **`difficulty(depth)`** curve; at each step it pulls a *random* puzzle whose rating sits within a **tight tolerance band** of the target — standardized difficulty, novel instance. **Calibration anchor:** v1's clue counts (Easy 30 / Medium 40 / Hard 50 / Expert 55 removed) are a sanity check when mapping ratings to blank ranges — not the model (v1 had no grading), just a reference point.
- **Bank sizing (so we don't boil the ocean).** A single seed → up to **~1.22 × 10¹²** difficulty-preserving transform variants, so *exact* repeats are a non-issue. The real lever is *non-isomorphic seeds per rating band* (transforms are logically isomorphic). Target: **~30–60 fine rating bands × ~500–2,000 seeds each ≈ 30k–100k seeds**, generated + graded **once** (minutes–hours), sampled from the ~5.47 × 10⁹ essentially-different grids. Store each seed **canonical**, apply a **random transform at runtime**. This calibrated, fair, high-variety engine is Speedoku's **anti-clone moat** — the part a weekend clone can't reproduce. Strategy: [[clients/generaitve_ventures/wiki/topics/speedoku-strategy]].

## Run loop

1. **Start:** pick mode (hints-on / hints-off) — locks the run and its leaderboard.
2. **Puzzle 1 = tutorial:** fixed, untimed, fail-proof. Teaches select → Focus → skip → place, and shows the unsolvable-death rule safely.
3. **Puzzle 2+:** timer + stakes live. Complete a puzzle (full valid grid) → `score += difficultyWeight × speedBonus` → next puzzle, drawn from a smoothly-higher difficulty target (no visible tier change — it just gets harder).
4. **Death:** a placement leaves the board unsolvable → `runOver` → summary (depth · score · fastest solve · vs. personal best · shareable card).

The ladder-climb rate, tier pars, and any soft cap are playtest-tunable constants, not spec-blocking.

## Scoring, persistence, daily

- **Scoring carries the speed soul.** Because death is unsolvable-based and **no clock kills you**, nothing *mechanically* forces speed — a careful player could crawl to the same depth. So the **score is the only thing that makes Speedoku about speed**; it must reward fast solving so dramatically that slow play is never competitive. (If we ever feel "reward, not enforce" is too soft to *feel* fast moment-to-moment, the lever is a non-lethal combo-decay timer — noted, not in v1.)
- **Scoring shape (proposed — par-relative with floor):** each solved puzzle awards `difficultyWeight × speedBonus`, where `difficultyWeight` scales with the puzzle's continuous difficulty rating and `speedBonus = max(floor, par − solveTime + base)`. Beating par pays big; a slow-but-correct solve still banks the floor — never zero, never negative, so **survival is never punished, only speed is rewarded.** Accumulate across the run; death freezes the total. Leaderboards rank by total score; tiebreak depth, then total time. Tracked locally: best score, deepest run, fastest single solve, streak. Exact constants (par curve, floor, weights) tuned in playtest.
- **Live pace target (from the v1 report):** the HUD shows the personal best *during* play (v1 showed `Best (easy): 02:04` live under the timer), not only on the summary — here, best run score/depth as a "beat this" line.
- **Persistence (DataService):**
  - `LocalAdapter` (IndexedDB, v1 default): run history, personal bests, preferred mode, daily results, streak. Fully offline.
  - `SupabaseAdapter` (opt-in/later): `{mode, score, depth, time, displayName, id, date}` rows for global + daily boards.
- **Daily Challenge (v1 priority — the viral layer).** `hash(date) → seed indices + transform params` → everyone climbs the *same* run, reproducible offline, no server. One *scored* attempt; replaying the seed after is unranked practice (no hostile device-gating). A **spoiler-safe share card** (`Speedoku Daily #142 ⚡ depth 18 · 4:02 · top 12%`) + a **daily streak** drive the Wordle-style loop and pull lapsed players back. Ships in v1 as seed + local result + share card; the **global** daily leaderboard is Phase 3 (Supabase).
- **Honesty flag:** local-first means scores are client-computed, so a global board is "for fun" in v1. Real anti-cheat (server-side replay validation) is a Phase-3 concern, noted as a known tradeoff.

## UI and design system

Mobile-first, thumb-reachable, above-the-fold:

```
┌─────────────────────────────┐
│  depth 7        02:42        │  how deep this run · live timer (counts up = score)
│  score 1,240   best 2,400    │  running score · live personal-best (pace target)
│                      ◐ hints │  · mode badge — NO tier label (smooth curve)
├─────────────────────────────┤
│        9×9 BOARD             │  responsive (vmin-based, never fixed px);
│  Focus: auto-candidate       │  hints-on renders every empty cell's legal
│  numerals; sel. digit lit    │  candidates as numerals + highlights the
│                             │  selected digit's numeral across its cells;
│                             │  given vs entered; selected-cell ring;
│                             │  completed digit = green
├─────────────────────────────┤
│   ┌─┐┌─┐┌─┐  3×3 number pad  │  THUMB ZONE: primary input; each digit
│   │1││2││3│                  │  shows remaining count, greys when complete
│   └─┘└─┘└─┘                  │
└─────────────────────────────┘
```

- **Core loop & two traversals (from the v1 mechanics report).** Hints-on, an empty cell shows its **auto-computed legal candidate numerals** (not just cell tinting); selecting a digit **highlights that digit's numeral** in every cell it can enter and auto-jumps the cursor to the first valid cell. **`Tab` walks the next *empty* cell (any); arrows walk the next *valid* cell for the selected digit** — two distinct traversals, keep both. Place commits the selected digit; the digit stays selected and auto-advances. Desktop = the verified keyboard grammar (1–9 · arrows · Tab/Shift-Tab · Enter · P · N). **Deliberate v2 change to validate against the original feel:** the prototype required *click-to-select then Enter-to-commit* (a bare cell click never placed); v2's mobile plan is **tap-a-lit-cell-to-place** (one tap), so test that the one-tap commit still feels right and doesn't cause misfires. One `InputController`, two input surfaces.
- **Design tokens first:** color · type scale · spacing · radius · motion · elevation defined in the Tailwind v4 theme, consumed by both shadcn chrome and the bespoke board. Visual direction generated in claude.ai/design before component code.
- **Aesthetic:** warm, confident, modern — "a Sudoku that loves you," not cold newspaper grey.
- **Motion (Motion lib):** satisfying micro-pop on each placement; score tick; number-complete flourish; a gentle rejected-shake when an illegal move is blocked; and a deliberately visceral **unsolvable Game Over** (board desaturates, ⚠️ run-over screen with final time/depth) — stakes made felt at the moment you've cornered yourself. Kept off the hot path for sub-100ms response.
- **shadcn is chrome, not the board.** Buttons, dialogs (pre-game, settings, run-over), menus, leaderboard tables → shadcn. The grid and number selector are bespoke, built on the shared tokens.

## Tech stack

Next.js 15 (App Router, TS strict) · Tailwind v4 + shadcn/ui · Motion · Zustand · Vitest + Testing Library + Playwright · Biome · pnpm · Supabase · Vercel.

Two constraints baked in now: (1) the game is a **client island** — Next hosts the landing/daily/SEO/API, it does not SSR the grid; (2) Phase-2 app-store packaging wraps a **static export** (`output: 'export'`), so gameplay routes stay free of server-only features.

## Testing (TDD)

- `PuzzleEngine`: uniqueness; candidates match a reference solve; transforms preserve uniqueness + tier; solver correctness. Build-time grader verified against known-tier fixtures.
- `RunState`: illegal-move rejected (no-op), legal placement accepted, unsolvable→death, puzzle-complete→advance, auto-advance, tutorial→play transitions.
- `Scorer`: pure, table-driven. `InputController`: touch + keyboard intents.
- Playwright E2E: full run, death, daily, mobile viewport.

## Repo and docs (separate from this vault)

Code lives in its own git repo (rebuild fresh; reuse `github.com/adams/Speedoku` or a new repo), deployed on Vercel, data in Supabase.

```
app/        Next routes: / · /play · /daily · /leaderboard
lib/engine/ Norvig core · transforms · banks loader · types
lib/run/    Zustand store · state machine · scorer
lib/input/  InputController
lib/data/   DataService interface + Local/Supabase adapters
components/  board · cell · number-selector (bespoke) + ui/ (shadcn)
factory/     build-time generate+grade scripts → banks JSON
docs/        spec · plan · ADRs · design-system
tests/
```

ADRs capture the load-bearing calls (engine split, banks+transforms, stack). A `CLAUDE.md`/`AGENTS.md` seeds future sessions. This spec copies into the repo's `docs/` when scaffolded.

## Build plan (high-level milestones)

The macro sequence — **engine-first, TDD, each milestone independently testable.** The granular task-level plan comes from the `writing-plans` step (not yet started); this is the roadmap that plan will expand.

- **M0 — Scaffold.** Next.js 15 repo (TS strict) + Tailwind v4 + shadcn + Biome + Vitest/Playwright + pnpm; CI; bare Vercel deploy. Seed `docs/` (this spec) + `CLAUDE.md`/`AGENTS.md`.
- **M1 — PuzzleEngine core (no UI).** Port the Norvig/pytudes solver: grid/`DigitSet` model, `candidatesFor`, `isSafe`, `search`/`isSolvable`, `countSolutions(limit=2)`. Pure, fully unit-tested.
- **M2 — Build-time factory + banks.** Generate unique-solution puzzles, grade by technique (library), bucket the banks; validity-preserving transform engine (uniqueness + difficulty preserved). Ship banks JSON. Tested against known fixtures.
- **M3 — RunState + Scorer (pure/Zustand).** State machine (mode · place · illegal-reject · unsolvable-death · complete-advance · auto-advance · tutorial→play), smooth difficulty-target curve, par-relative scoring. Fully unit-tested, headless.
- **M4 — Design system + board.** Tokens first (claude.ai/design), then bespoke Board/Cell/NumberSelector + `InputController`: Focus Mode candidate numerals, auto-advance, two traversals, mobile-first touch + keyboard. Wired to RunState.
- **M5 — Shell, chrome, persistence.** Pre-game/HUD/run-over/tutorial/daily + shareable card (shadcn); `DataService` LocalAdapter (IndexedDB); installable PWA.
- **M6 — Polish & tune.** Motion/juice, accessibility (colorblind-safe signals, reduced-motion), and playtest-tuning the curve + scoring constants.

Then Phase 2 (Capacitor) and Phase 3 (Supabase) below.

## Phasing

- **v1 (this spec):** the rogue run *is* the game; hints-ON only; gorgeous mobile-first PWA; standardized continuous-difficulty banks + transforms; speed-dominant scoring; local-first persistence; **unlimited ranked runs + a local Daily Challenge with a spoiler-safe share card** (the viral layer).
- **Phase 2:** Capacitor wrap → iOS/Android app stores; Game Center adapter for history/state on iOS.
- **Phase 3:** Supabase global + daily online leaderboards, optional accounts for cross-device sync, server-side score validation.
- **Deferred but seamed:** hints-OFF hardcore mode + its leaderboard (Phase 2/3).

## Name / IP note

"Speedoku" is usable but not distinctive — multiple prior unregistered uses, no active US trademark in the game category. Mechanics are not copyrightable. Be mindful of the Japanese market (Nikoli holds "Sudoku" there). Strong brand + execution is the moat, not IP. (See `research/speedoku-name-ip-market-analysis.pdf`.)

## Research sources

- `research/Designing Sudoku Puzzles_ Unique Solutions and Controlled Difficulty.docx` — generation, uniqueness, technique-graded difficulty, TS pseudocode.
- `research/speedoku-name-ip-market-analysis.pdf` — name viability, IP, competitive landscape (Good Sudoku, Speedoku 2010/11, Sudoku RPG, Overhaul), growth/monetization.
- Peter Norvig, "Solving Every Sudoku Puzzle" (https://norvig.com/sudoku.html) — the classic constraint-propagation solver.
- Peter Norvig, pytudes Sudoku notebook (https://github.com/norvig/pytudes/blob/main/ipynb/Sudoku.ipynb) — the refined solver we port for the runtime core: `Grid`/`DigitSet` model, `eliminate`/`fill`/`constrain`/`search` (MRV), fast copies (~350 puzzles/sec). Solver-only; no generation/difficulty.
- Good Sudoku (https://www.playgoodsudoku.com/) — UX inspiration: Focus Mode, eliminate-busywork philosophy, technique-named difficulty.
- `2026-06-16-speedoku-v1-mechanics-report.md` — ground-truth playtest of the live prototype (browser automation + bundle inspection): verified the interaction grammar, the unsolvable-death model, the no-uniqueness flaw, auto-candidate pencil, two traversals, live best-time pace target, and controls. The source of this spec's §UI/§run-loop keepers.
- Existing prototype: `github.com/adams/Speedoku`.

## Open / tunable (not spec-blocking)

- **Decided this pass:** run-only identity (no classic); hints-ON only in v1; speed-dominant par-relative scoring; standardized continuous-difficulty curve with a tight variance band; bank-sizing target (~30–100k seeds); unlimited runs + Daily Challenge (daily in v1).
- Still tunable (playtest): difficulty-curve rate over depth, variance tolerance, par curve, scoring floor/weights, exact bank size + band count.
- One-tap-to-place (mobile) vs the prototype's click-then-Enter — validate the feel during build.
- A non-lethal combo-decay timer — only if "reward, not enforce" proves too soft to feel fast.
