export const STEPS = {
  start: "",
  mistake: "2a",
  worried: "2b",
  consequences: "2c",
  help: "3",
  later: "4",
} as const;

export type Step = keyof typeof STEPS;

const BACK: Record<Step, Step | null> = {
  start: null,
  mistake: "start",
  worried: "start",
  consequences: "start",
  help: "start",
  later: "help",
};

export function parseStep(segments: string[] | undefined): Step | null {
  const slug = segments?.join("/") ?? "";
  const match = Object.entries(STEPS).find(([, s]) => s === slug);
  return match ? (match[0] as Step) : null;
}

export function backOf(step: Step) {
  return BACK[step];
}

// site id = forum domain
// params arrive still encoded, stepHref encodes again: decode once here
export function decodeSite(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function parseForumDomain(site: string): string | null {
  const domain = site.toLowerCase();
  if (domain.length > 253) return null;
  if (isLocalForum(domain)) return domain;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) return null;
  return domain;
}

// dev only, so the local mock forum works as a site
export function isLocalForum(domain: string) {
  return (
    process.env.NODE_ENV === "development" &&
    /^localhost(:\d{1,5})?$/.test(domain)
  );
}

export function forumHref(forum: string) {
  // the mock forum lives in a subfolder of the repo dev server
  if (isLocalForum(forum)) return `http://${forum}/mock-platform/index.html`;
  return `https://${forum}`;
}

export const ANONYMOUS_ANCHOR = "anoniem";
export const NOT_READY_ANCHOR = "later";

// a = harm, b = help first, c = clear and serious (themes from Ciardha, Nurmi et al. 2026, see PLAN.md),
// d = behind bars (prison as a picture, the strongest deterrent)
export const VARIANTS = ["a", "b", "c", "d"] as const;

export type Variant = (typeof VARIANTS)[number];

// call and chat on screen 1, the three options below them
export function helpFirst(variant: Variant) {
  return variant === "b";
}

// message, then a dark band with the way out, then a numbered list
export function clearAndSerious(variant: Variant) {
  return variant === "c" || variant === "d";
}

// clear and serious, with the message behind bars that drop on load
export function behindBars(variant: Variant) {
  return variant === "d";
}

export const DEFAULT_VARIANT: Variant = "a";

// in the url (?v=b): one of three values shared by many visitors, so not a tracking token

export function parseVariant(value: unknown): Variant | null {
  return VARIANTS.find((v) => v === value) ?? null;
}

export function stepHref(
  site: string,
  step: Step,
  lang: string,
  variant: Variant,
  anchor?: string,
) {
  const slug = STEPS[step];
  const path = `/w/${encodeURIComponent(site)}${slug ? `/${slug}` : ""}`;
  return `${path}?l=${lang}&v=${variant}${anchor ? `#${anchor}` : ""}`;
}

// same for everyone, a per-person link would be a tracking token
export function savedLinkPath(country: string, lang?: string) {
  return `/i/${country.toLowerCase()}${lang ? `?l=${lang}` : ""}`;
}

// marks a step seen again (language switch, Vorige): not counted, so
// step:start means "arrived from the forum", which the bandit relies on
export const REVISIT_PARAM = "r";

export function revisitHref(href: string) {
  return `${href}${href.includes("?") ? "&" : "?"}${REVISIT_PARAM}=1`;
}
