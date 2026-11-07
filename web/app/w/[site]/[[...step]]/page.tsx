import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Consequences } from "@/components/flow/consequences";
import { Help } from "@/components/flow/help";
import { Later } from "@/components/flow/later";
import { Mistake } from "@/components/flow/mistake";
import { Shell } from "@/components/flow/shell";
import { Start } from "@/components/flow/start";
import { Worried } from "@/components/flow/worried";
import { DEFAULT_COUNTRY, getContent } from "@/lib/content";
import {
  backOf,
  decodeSite,
  DEFAULT_VARIANT,
  parseForumDomain,
  parseStep,
  parseVariant,
  revisitHref,
  stepHref,
  themeOf,
} from "@/lib/flow";

// required by cacheComponents for params
export default function Page(props: PageProps<"/w/[site]/[[...step]]">) {
  return (
    <Suspense fallback={null}>
      <Flow {...props} />
    </Suspense>
  );
}

async function Flow({
  params,
  searchParams,
}: PageProps<"/w/[site]/[[...step]]">) {
  const { site: rawSite, step: segments } = await params;
  const site = decodeSite(rawSite);
  const { l: requestedLang, v } = await searchParams;
  // the proxy assigns one when missing, the default only covers direct renders
  const variant = parseVariant(v) ?? DEFAULT_VARIANT;

  const step = parseStep(segments);
  if (!step) notFound();

  const forum = parseForumDomain(site);
  const { pack, copy, lang } = getContent(
    DEFAULT_COUNTRY,
    typeof requestedLang === "string" ? requestedLang : undefined,
    variant,
  );

  const back = backOf(step);
  const screenProps = {
    copy,
    pack,
    forum,
    site,
    lang,
    variant,
    statsSite: forum,
  };

  return (
    <div lang={lang} data-variant={variant} data-theme={themeOf(variant)}>
      <Shell
        copy={copy}
        pack={pack}
        forum={forum}
        statsSite={forum}
        backHref={
          back ? revisitHref(stepHref(site, back, lang, variant)) : undefined
        }
        lang={lang}
        languages={pack.languages.map((code) => ({
          code,
          href: stepHref(site, step, code, variant),
        }))}
      >
        {step === "start" && <Start {...screenProps} />}
        {step === "mistake" && <Mistake {...screenProps} />}
        {step === "worried" && <Worried {...screenProps} />}
        {step === "consequences" && <Consequences {...screenProps} />}
        {step === "help" && <Help {...screenProps} />}
        {step === "later" && <Later {...screenProps} />}
      </Shell>
    </div>
  );
}
