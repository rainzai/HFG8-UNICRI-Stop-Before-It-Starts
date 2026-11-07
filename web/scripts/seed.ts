// writes fake counts in the real format, for the demo. never on a deployed server
// pnpm seed [--force]

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { countKey, STATS_FILE, type Counts } from "../lib/counter.ts";

const DAYS = 60;

// warnings per day per variant; .example domains, so no real forum
const FORUMS: Record<string, number> = {
  "forum-a.example": 40,
  "forum-b.example": 15,
  // small on purpose: shows the suppression below 10
  "forum-c.example": 1,
};

// share of the warnings that reaches each event, made up for the demo:
// b gets to help most often, d (bars) least
const COMMON = { website: 0.01, selfhelp: 0.008, forum: 0.3, exit: 0.06 };
const RATES: Record<string, Record<string, number>> = {
  a: {
    "step:mistake": 0.35,
    "step:worried": 0.15,
    "step:consequences": 0.12,
    "step:help": 0.18,
    "step:later": 0.04,
    call: 0.015,
    chat: 0.025,
    ...COMMON,
  },
  b: {
    "step:mistake": 0.3,
    "step:worried": 0.2,
    "step:consequences": 0.12,
    "step:help": 0.26,
    "step:later": 0.05,
    call: 0.025,
    chat: 0.04,
    ...COMMON,
  },
  c: {
    "step:mistake": 0.32,
    "step:worried": 0.14,
    "step:consequences": 0.18,
    "step:help": 0.2,
    "step:later": 0.04,
    call: 0.02,
    chat: 0.03,
    ...COMMON,
  },
  d: {
    "step:mistake": 0.38,
    "step:worried": 0.1,
    "step:consequences": 0.2,
    "step:help": 0.14,
    "step:later": 0.03,
    call: 0.012,
    chat: 0.018,
    ...COMMON,
    exit: 0.1,
  },
  e: {
    "step:mistake": 0.3,
    "step:worried": 0.21,
    "step:consequences": 0.11,
    "step:help": 0.27,
    "step:later": 0.05,
    call: 0.024,
    chat: 0.042,
    ...COMMON,
  },
};

// clicks from the optional notices (popup, box) per day, a share of the warnings
const NOTICES = { "step:amber": 0.12, "step:green": 0.05 };

if (existsSync(STATS_FILE) && !process.argv.includes("--force")) {
  console.error(`${STATS_FILE} exists, use --force to overwrite it`);
  process.exit(1);
}

// fixed seed, same demo data every run
let state = 42;
function random() {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function around(mean: number) {
  return Math.round(mean * (0.6 + random() * 0.8));
}

const counts: Counts = {};
function add(key: string, count: number) {
  if (count > 0) counts[key] = count;
}

for (let i = 0; i < DAYS; i++) {
  const day = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
  for (const [site, perDay] of Object.entries(FORUMS)) {
    for (const [variant, rates] of Object.entries(RATES)) {
      const shown = around(perDay);
      add(countKey(site, variant, "step:start", day), shown);
      for (const [event, share] of Object.entries(rates))
        add(countKey(site, variant, event, day), around(shown * share));
      for (const [event, share] of Object.entries(NOTICES))
        add(countKey(site, variant, event, day), around(shown * share));
    }
  }
  add(countKey("saved", "a", "step:saved", day), around(2));
  add(countKey("saved", "a", "call", day), around(0.2));
}

await mkdir(path.dirname(STATS_FILE), { recursive: true });
await writeFile(STATS_FILE, JSON.stringify(counts));
console.log(`wrote ${Object.keys(counts).length} fake counts to ${STATS_FILE}
restart the dev server: the proxy keeps the counts in memory`);
