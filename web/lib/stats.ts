import { MIN_COUNT, parseKey, SAVED_SITE, type Counts } from "@/lib/counter";

// event → count, summed over the days of a period
export type Totals = Record<string, number>;

// UTC days, both inclusive
export type Period = { from: string; to: string };

const DAY_MS = 86_400_000;
const DEFAULT_DAYS = 30;
const MAX_DAYS = 366;

function dayOf(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

function isDay(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

// ?from=&to= or ?days=, last 30 days by default
export function periodOf(params: Record<string, unknown>): Period {
  const { from, to } = params;
  if (isDay(from) && isDay(to) && from <= to) return { from, to };
  const days = Math.min(
    Math.max(Math.trunc(Number(params.days)) || DEFAULT_DAYS, 1),
    MAX_DAYS,
  );
  return {
    from: dayOf(Date.now() - (days - 1) * DAY_MS),
    to: dayOf(Date.now()),
  };
}

// site → variant → totals
export function sumCounts(counts: Counts, period: Period, onlySite?: string) {
  const sites = new Map<string, Map<string, Totals>>();
  for (const [key, count] of Object.entries(counts)) {
    const { day, site, variant, event } = parseKey(key);
    if (day < period.from || day > period.to) continue;
    if (onlySite && site !== onlySite) continue;
    let variants = sites.get(site);
    if (!variants) sites.set(site, (variants = new Map()));
    const totals = variants.get(variant) ?? {};
    totals[event] = (totals[event] ?? 0) + count;
    variants.set(variant, totals);
  }
  return sites;
}

// all forums together per variant; the saved link has no warning, left out
export function combineForums(sites: Map<string, Map<string, Totals>>) {
  const variants = new Map<string, Totals>();
  for (const [site, perVariant] of sites) {
    if (site === SAVED_SITE) continue;
    for (const [variant, totals] of perVariant) {
      const sum = variants.get(variant) ?? {};
      for (const [event, count] of Object.entries(totals))
        sum[event] = (sum[event] ?? 0) + count;
      variants.set(variant, sum);
    }
  }
  return variants;
}

// the funnel: warning → help screen → call or chat
export function funnel(totals: Totals) {
  const call = totals.call ?? 0;
  const chat = totals.chat ?? 0;
  return {
    shown: totals["step:start"] ?? 0,
    help: totals["step:help"] ?? 0,
    call,
    chat,
    reached: call + chat,
  };
}

// after summing, so a sum cannot reveal a hidden count
export function hidden(count: number) {
  return count < MIN_COUNT ? null : count;
}

export function rate(part: number, whole: number) {
  return hidden(part) === null || hidden(whole) === null ? null : part / whole;
}

// contract/schemas/metrics-event.schema.json, extra counts are allowed
export function metricsEvent(variant: string, totals: Totals, period: Period) {
  const { shown, help, call, chat, reached } = funnel(totals);
  const counts = Object.fromEntries(
    Object.entries({
      shown,
      clicked_help: reached,
      call,
      chat,
      help_screen: help,
      mistake: totals["step:mistake"] ?? 0,
      worried: totals["step:worried"] ?? 0,
      consequences: totals["step:consequences"] ?? 0,
      later: totals["step:later"] ?? 0,
    }).map(([name, count]) => [name, hidden(count)]),
  );
  return {
    period: {
      start: `${period.from}T00:00:00Z`,
      end: `${dayOf(Date.parse(period.to) + DAY_MS)}T00:00:00Z`,
    },
    variantId: variant,
    counts,
    suppressedSmallCounts: Object.values(counts).includes(null),
  };
}
