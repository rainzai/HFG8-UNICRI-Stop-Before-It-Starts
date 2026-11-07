import { z } from "zod";

import nlEn from "@/content/NL/en.json";
import nlNl from "@/content/NL/nl.json";
import nlPack from "@/content/NL/pack.json";
import nlB from "@/content/NL/variants/b.json";
import nlC from "@/content/NL/variants/c.json";
import nlD from "@/content/NL/variants/d.json";
import nlE from "@/content/NL/variants/e.json";
import { DEFAULT_VARIANT, type Variant } from "@/lib/flow";

// nl.json = reference shape, other languages need same keys, non-empty
export type Copy = typeof nlNl;

const packSchema = z.object({
  country: z.string().length(2),
  languages: z.array(z.string().length(2)).min(1),
  exitUrl: z.url({ protocol: /^https$/ }),
  helpline: z.object({
    name: z.string().min(1),
    org: z.string().min(1),
    phone: z.string().regex(/^[0-9 ]+$/),
    url: z.url({ protocol: /^https$/ }),
    chatUrl: z.url({ protocol: /^https$/ }),
    // the opening hours below are in this time zone
    timeZone: z
      .string()
      .refine(
        (tz) => Intl.supportedValuesOf("timeZone").includes(tz),
        "unknown time zone",
      ),
    // days: [first, last], 1 = monday
    hours: z.array(
      z.object({
        days: z.tuple([
          z.number().int().min(1).max(7),
          z.number().int().min(1).max(7),
        ]),
        open: z.string().regex(/^\d\d:\d\d$/),
        close: z.string().regex(/^\d\d:\d\d$/),
      }),
    ),
  }),
  selfHelp: z.object({
    name: z.string().min(1),
    url: z.url({ protocol: /^https$/ }),
  }),
  law: z.object({
    articles: z.array(z.number().int().positive()).min(1),
    maxYears: z.number().int().positive(),
    habitualMaxYears: z.number().int().positive(),
    since: z.iso.date(),
  }),
});

export type Pack = z.infer<typeof packSchema>;

function shapeOf(value: unknown): z.ZodType {
  if (typeof value === "string") return z.string().min(1);
  if (Array.isArray(value))
    return z.array(z.string().min(1)).length(value.length);
  const entries = Object.entries(value as Record<string, unknown>);
  return z.strictObject(
    Object.fromEntries(entries.map(([k, v]) => [k, shapeOf(v)])),
  );
}

// same keys as the base, all optional: a variant only overrides what it tests
function partialShapeOf(value: unknown): z.ZodType {
  if (typeof value === "string" || Array.isArray(value))
    return shapeOf(value).optional();
  const entries = Object.entries(value as Record<string, unknown>);
  return z
    .strictObject(
      Object.fromEntries(entries.map(([k, v]) => [k, partialShapeOf(v)])),
    )
    .optional();
}

const copySchema = shapeOf(nlNl);
const overrideSchema = partialShapeOf(nlNl);

type CountryPack = {
  pack: Pack;
  copy: Record<string, Copy>;
  // variant → language → copy, merged over the base
  variants: Partial<Record<Variant, Record<string, Copy>>>;
};

function merge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (typeof base !== "object" || base === null || Array.isArray(base))
    return override as T;
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(override as Record<string, unknown>))
    out[k] = merge(out[k], v);
  return out as T;
}

function load(
  pack: unknown,
  copy: Record<string, unknown>,
  variants: Partial<Record<Variant, Record<string, unknown>>> = {},
): CountryPack {
  const parsedPack = packSchema.parse(pack);
  for (const lang of parsedPack.languages) {
    if (!(lang in copy))
      throw new Error(`${parsedPack.country}: missing copy for "${lang}"`);
  }
  const parsedCopy = Object.fromEntries(
    Object.entries(copy).map(([lang, c]) => {
      const result = copySchema.safeParse(c);
      if (!result.success) {
        throw new Error(
          `${parsedPack.country}/${lang}.json: ${z.prettifyError(result.error)}`,
        );
      }
      return [lang, result.data as Copy];
    }),
  );
  // every language per variant, so no language falls back to another variant's text
  const parsedVariants = Object.fromEntries(
    Object.entries(variants).map(([id, perLang]) => {
      for (const lang of parsedPack.languages) {
        if (!perLang || !(lang in perLang))
          throw new Error(
            `${parsedPack.country}/variants/${id}.json: missing "${lang}"`,
          );
      }
      const merged = Object.fromEntries(
        parsedPack.languages.map((lang) => {
          const result = overrideSchema.safeParse(perLang![lang]);
          if (!result.success) {
            throw new Error(
              `${parsedPack.country}/variants/${id}.json (${lang}): ${z.prettifyError(result.error)}`,
            );
          }
          return [lang, merge(parsedCopy[lang], result.data)];
        }),
      );
      return [id, merged];
    }),
  );
  return { pack: parsedPack, copy: parsedCopy, variants: parsedVariants };
}

// new country: add content/<CC>/, register here
// new language: add content/<CC>/<lang>.json, list in pack.json, register here
// new variant: add content/<CC>/variants/<id>.json (all languages), register here
const countries: Record<string, CountryPack> = {
  NL: load(nlPack, { nl: nlNl, en: nlEn }, { b: nlB, c: nlC, d: nlD, e: nlE }),
};

export const DEFAULT_COUNTRY = "NL";

export function hasCountry(country: string) {
  return country in countries;
}

export function getContent(
  country: string,
  lang?: string,
  variant: Variant = DEFAULT_VARIANT,
) {
  const entry = countries[country] ?? countries[DEFAULT_COUNTRY];
  const pick =
    lang && entry.pack.languages.includes(lang)
      ? lang
      : entry.pack.languages[0];
  // no file for this variant: the base copy is that variant
  const copy = entry.variants[variant]?.[pick] ?? entry.copy[pick];
  return { pack: entry.pack, copy, lang: pick };
}

// unknown {keys} left in place, visible in review
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
