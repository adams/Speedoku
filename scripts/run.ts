import type { BankFile } from "../lib/engine/banks";
import bank from "../lib/engine/banks/banks.fixture.json";
import { runAuto } from "../lib/run/runner";

// CLI: pnpm run run -- <seed> <maxDepth> <mistakeRate>
// Filter out the "--" sentinel that pnpm inserts before forwarded args.
const args = process.argv.slice(2).filter((a) => a !== "--");
const seed = Number(args[0] ?? 1);
const maxDepth = Number(args[1] ?? 30);
const mistakeRate = Number(args[2] ?? 0.05);

const summary = runAuto(bank as BankFile, { seed, maxDepth, mistakeRate });
console.log(JSON.stringify(summary, null, 2));
