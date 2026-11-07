import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// (day, site, variant, event) → count, nothing else: no ip, no time, no id
export type Counts = Record<string, number>;

export const STATS_FILE = path.join(process.cwd(), ".data", "counts.json");

export const CLICK_EVENTS = ["call", "chat"] as const;

// the saved link has no forum, counted under its own key
export const SAVED_SITE = "saved";

const SEPARATOR = "|";

export function countKey(
  site: string,
  variant: string,
  event: string,
  day = new Date().toISOString().slice(0, 10),
) {
  return [day, site, variant, event].join(SEPARATOR);
}

export function parseKey(key: string) {
  const [day, site, variant, event] = key.split(SEPARATOR);
  return { day, site, variant, event };
}

export async function readCounts(): Promise<Counts> {
  try {
    return JSON.parse(await readFile(STATS_FILE, "utf8"));
  } catch {
    return {};
  }
}

let counts: Counts | null = null;
let pending: Promise<void> = Promise.resolve();

// only the proxy calls this, so there is one writer
export function increment(key: string) {
  pending = pending.then(async () => {
    counts ??= await readCounts();
    counts[key] = (counts[key] ?? 0) + 1;
    await mkdir(path.dirname(STATS_FILE), { recursive: true });
    // write then rename, so a reader never sees a half-written file
    const tmp = `${STATS_FILE}.tmp`;
    await writeFile(tmp, JSON.stringify(counts));
    await rename(tmp, STATS_FILE);
  });
  return pending;
}

// counts below this are hidden when read, to avoid singling anyone out
export const MIN_COUNT = 10;
