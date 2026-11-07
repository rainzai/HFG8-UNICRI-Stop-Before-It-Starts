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
function isLocalForum(domain: string) {
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

export function stepHref(
  site: string,
  step: Step,
  lang: string,
  anchor?: string,
) {
  const slug = STEPS[step];
  const path = `/w/${encodeURIComponent(site)}${slug ? `/${slug}` : ""}`;
  return `${path}?l=${lang}${anchor ? `#${anchor}` : ""}`;
}

// same for everyone, a per-person link would be a tracking token
export function savedLinkPath(country: string, lang?: string) {
  return `/i/${country.toLowerCase()}${lang ? `?l=${lang}` : ""}`;
}

// marks a language switch: same step again, so the proxy skips counting it
export const LANGUAGE_SWITCH_PARAM = "switch";

export function languageSwitchHref(href: string) {
  return `${href}${href.includes("?") ? "&" : "?"}${LANGUAGE_SWITCH_PARAM}=1`;
}
