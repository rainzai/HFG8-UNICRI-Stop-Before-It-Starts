import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Consequences } from "@/components/flow/consequences";
import { Mistake } from "@/components/flow/mistake";
import { Shell } from "@/components/flow/shell";
import { Start } from "@/components/flow/start";
import { Worried } from "@/components/flow/worried";
import { DEFAULT_COUNTRY, getContent } from "@/lib/content";
import { backOf, parseForumDomain, parseStep, stepHref } from "@/lib/flow";

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
  const { site, step: segments } = await params;
  const { l: requestedLang } = await searchParams;

  const step = parseStep(segments);
  // TODO: other screens
  if (
    step !== "start" &&
    step !== "mistake" &&
    step !== "worried" &&
    step !== "consequences"
  )
    notFound();

  const forum = parseForumDomain(site);
  const { pack, copy, lang } = getContent(
    DEFAULT_COUNTRY,
    typeof requestedLang === "string" ? requestedLang : undefined,
  );

  const back = backOf(step);
  const screenProps = { copy, pack, forum, site, lang };

  return (
    <div lang={lang}>
      <Shell
        copy={copy}
        pack={pack}
        forum={forum}
        backHref={back ? stepHref(site, back, lang) : undefined}
      >
        {step === "start" && <Start {...screenProps} />}
        {step === "mistake" && <Mistake {...screenProps} />}
        {step === "worried" && <Worried {...screenProps} />}
        {step === "consequences" && <Consequences {...screenProps} />}
      </Shell>
    </div>
  );
}
