import { parseKey, readCounts, SAVED_SITE, type Counts } from "@/lib/counter";
import { VARIANTS, type Variant } from "@/lib/flow";

// picks the variant for a new visit from the totals only: per variant how
// often screen 1 was shown and how often call or chat was clicked.
// thompson sampling: draw a plausible help rate per variant, take the highest.
// little data gives wide draws (much variety), clear differences narrow them.

// only recent days, so the choice follows changes
const WINDOW_DAYS = 30;
// share of visits picked evenly, so no variant is ever starved
const EXPLORE = 0.1;
// counts are re-read at most this often, not on every visit
const REFRESH_MS = 60_000;
// only contact with the helpline is a success, not every counted click
// (leaving or going back to the forum are counted too, but are not help)
const SUCCESS = ["call", "chat"];

export type Arm = { shown: number; helped: number };
export type Arms = Record<Variant, Arm>;

export function armsFrom(counts: Counts, now = new Date()): Arms {
  const from = new Date(now.getTime() - WINDOW_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const arms = Object.fromEntries(
    VARIANTS.map((v) => [v, { shown: 0, helped: 0 }]),
  ) as Arms;
  for (const [key, count] of Object.entries(counts)) {
    const { day, site, variant, event } = parseKey(key);
    const arm = arms[variant as Variant];
    // the saved link has no screen 1, so it says nothing about a variant
    if (!arm || day < from || site === SAVED_SITE) continue;
    if (event === "step:start") arm.shown += count;
    else if (SUCCESS.includes(event)) arm.helped += count;
  }
  return arms;
}

// what a variant without data is assumed to do: the average of all of them,
// worth about one success. a flat start (50%) made every new variant win
// almost every draw, since real help rates are a few percent
function prior(arms: Arms) {
  let shown = 0;
  let helped = 0;
  for (const arm of Object.values(arms)) {
    shown += arm.shown;
    helped += arm.helped;
  }
  const rate = Math.min(Math.max((helped + 1) / (shown + 2), 0.01), 0.5);
  return { a: 1, b: (1 - rate) / rate };
}

export function pick(arms: Arms, random = Math.random): Variant {
  if (random() < EXPLORE)
    return VARIANTS[Math.floor(random() * VARIANTS.length)];
  const start = prior(arms);
  let best: Variant = VARIANTS[0];
  let bestDraw = -1;
  for (const variant of VARIANTS) {
    const { shown, helped } = arms[variant];
    // clicks can exceed views (call and chat), never a negative miss count
    const draw = beta(
      start.a + helped,
      start.b + Math.max(shown - helped, 0),
      random,
    );
    if (draw > bestDraw) [best, bestDraw] = [variant, draw];
  }
  return best;
}

// how often each variant gets picked right now, for the dashboard
export function shares(arms: Arms, draws = 2000, random = Math.random) {
  const picked = Object.fromEntries(VARIANTS.map((v) => [v, 0])) as Record<
    Variant,
    number
  >;
  for (let i = 0; i < draws; i++) picked[pick(arms, random)]++;
  return Object.fromEntries(
    VARIANTS.map((v) => [v, picked[v] / draws]),
  ) as Record<Variant, number>;
}

let cache: { arms: Arms; at: number } | null = null;

async function currentArms() {
  if (!cache || Date.now() - cache.at > REFRESH_MS)
    cache = { arms: armsFrom(await readCounts()), at: Date.now() };
  return cache.arms;
}

export async function chooseVariant() {
  return pick(await currentArms());
}

export async function currentShares() {
  return shares(await currentArms());
}

// beta draw from two gamma draws
function beta(a: number, b: number, random: () => number) {
  const x = gamma(a, random);
  return x / (x + gamma(b, random));
}

// marsaglia and tsang, valid for shape >= 1 (always the case here)
function gamma(shape: number, random: () => number) {
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = normal(random);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = random();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

// box-muller
function normal(random: () => number) {
  return (
    Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random())
  );
}
