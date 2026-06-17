# Task 11 Spike — difficulty grading library evaluation

## Library probed: `sudoku-core@3.0.3`

### API surface (from `node -e "const s=require('sudoku-core'); console.log(Object.keys(s));"`)
```
[ 'analyze', 'generate', 'solve', 'hint' ]
```

### `analyze(Board): AnalyzeData` return shape
```ts
type AnalyzeData = {
  hasSolution: boolean;
  hasUniqueSolution?: boolean;
  usedStrategies?: ({ title: string; freq: number } | null)[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  score?: number;  // continuous numeric score; higher = harder
};
```

### Probe results

**Near-complete grid (one empty cell):**
```json
{ "hasSolution": true, "usedStrategies": [{ "title": "Open Singles Strategy", "freq": 1 }],
  "difficulty": "easy", "score": 0.1, "hasUniqueSolution": true }
```

**Sparse grid (typical puzzle, many empties):**
```json
{ "hasSolution": true, "usedStrategies": [
    { "title": "Open Singles Strategy", "freq": 21 },
    { "title": "Visual Elimination Strategy", "freq": 28 }],
  "difficulty": "easy", "score": 254.1, "hasUniqueSolution": true }
```

**Harder puzzle (fewer givens, needs more techniques):**
```json
{ "hasSolution": true, "usedStrategies": [
    { "title": "Open Singles Strategy", "freq": 21 },
    { "title": "Visual Elimination Strategy", "freq": 19 },
    { "title": "Single Candidate Strategy", "freq": 24 }],
  "difficulty": "medium", "score": 365.1, "hasUniqueSolution": true }
```

## Decision rule evaluation

| Criterion | Requirement | Result |
|-----------|-------------|--------|
| Difficulty levels | ≥ 4 | ✅ 5 (easy / medium / hard / expert / master) |
| Step-by-step technique list | Yes, with nameable techniques | ✅ `usedStrategies[]` — title strings + freq |
| Continuous numeric output | Monotone with complexity | ✅ `score` (e.g. 0.1 vs 254.1 vs 365.1) |

## Decision: **Path 3a — wrap the library**

All decision-rule conditions are met. `score` is a continuous number internally computed by the library by summing `strategy.score * freq` across applied strategies. It is monotone with technique complexity — single-cell open singles score less than elimination strategies. Using `score` directly as our `gradeDifficulty` return value is the most accurate proxy available: it encodes which techniques were needed and how many times, weighted by difficulty cost.

## Implementation contract

`factory/grade.ts` wraps `analyze` from `sudoku-core`, mapping `Board` (`(number|null)[]`) from our `Grid` (`number[]`), and returning `result.score ?? 0`. The signature is `gradeDifficulty(puzzle: Grid): number`.
