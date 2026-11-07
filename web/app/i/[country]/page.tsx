import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Help } from "@/components/flow/help";
import { Shell } from "@/components/flow/shell";
import { getContent, hasCountry } from "@/lib/content";
import { SAVED_SITE } from "@/lib/counter";
import { savedLinkPath } from "@/lib/flow";

// required by cacheComponents for params
export default function Page(props: PageProps<"/i/[country]">) {
  return (
    <Suspense fallback={null}>
      <Saved {...props} />
    </Suspense>
  );
}

async function Saved({ params, searchParams }: PageProps<"/i/[country]">) {
  const { country } = await params;
  const { l: requestedLang } = await searchParams;

  const code = country.toUpperCase();
  if (!hasCountry(code)) notFound();

  const { pack, copy, lang } = getContent(
    code,
    typeof requestedLang === "string" ? requestedLang : undefined,
  );

  return (
    <div lang={lang}>
      <Shell
        copy={copy}
        pack={pack}
        forum={null}
        statsSite={SAVED_SITE}
        lang={lang}
        languages={pack.languages.map((code) => ({
          code,
          href: savedLinkPath(pack.country, code),
        }))}
      >
        <Help copy={copy} pack={pack} lang={lang} statsSite={SAVED_SITE} />
      </Shell>
    </div>
  );
}
