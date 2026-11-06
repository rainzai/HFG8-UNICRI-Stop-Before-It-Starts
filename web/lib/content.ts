import { z } from "zod";

import nlEn from "@/content/NL/en.json";
import nlNl from "@/content/NL/nl.json";
import nlPack from "@/content/NL/pack.json";

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

const copySchema = shapeOf(nlNl);

type CountryPack = { pack: Pack; copy: Record<string, Copy> };

function load(pack: unknown, copy: Record<string, unknown>): CountryPack {
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
  return { pack: parsedPack, copy: parsedCopy };
}

// new country: add content/<CC>/, register here
// new language: add content/<CC>/<lang>.json, list in pack.json, register here
const countries: Record<string, CountryPack> = {
  NL: load(nlPack, { nl: nlNl, en: nlEn }),
};

export const DEFAULT_COUNTRY = "NL";

export function hasCountry(country: string) {
  return country in countries;
}

export function getContent(country: string, lang?: string) {
  const entry = countries[country] ?? countries[DEFAULT_COUNTRY];
  const pick =
    lang && entry.pack.languages.includes(lang)
      ? lang
      : entry.pack.languages[0];
  return { pack: entry.pack, copy: entry.copy[pick], lang: pick };
}

// unknown {keys} left in place, visible in review
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
