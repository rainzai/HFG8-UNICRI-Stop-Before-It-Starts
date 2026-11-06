import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Shell } from "@/components/flow/shell";
import { Start } from "@/components/flow/start";
import { DEFAULT_COUNTRY, getContent } from "@/lib/content";
import { parseForumDomain, parseStep } from "@/lib/flow";

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
  if (step !== "start") notFound();

  const forum = parseForumDomain(site);
  const { pack, copy, lang } = getContent(
    DEFAULT_COUNTRY,
    typeof requestedLang === "string" ? requestedLang : undefined,
  );

  return (
    <div lang={lang}>
      <Shell copy={copy} pack={pack} forum={forum}>
        {step === "start" && (
          <Start copy={copy} forum={forum} site={site} lang={lang} />
        )}
      </Shell>
    </div>
  );
}
