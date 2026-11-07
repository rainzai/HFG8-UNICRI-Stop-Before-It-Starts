import { ClearAndSerious } from "@/components/flow/clear-and-serious";
import { FlowLink } from "@/components/flow/flow-link";
import { HelpFirst } from "@/components/flow/help-first";
import { ChevronRight } from "@/components/flow/icons";
import type { Copy, Pack } from "@/lib/content";
import {
  clearAndSerious,
  helpFirst,
  stepHref,
  type Step,
  type Variant,
} from "@/lib/flow";

type Props = {
  copy: Copy;
  pack: Pack;
  forum: string | null;
  site: string;
  lang: string;
  variant: Variant;
};

export function Start({ copy, pack, forum, site, lang, variant }: Props) {
  const t = copy.start;
  const options: [Step, string][] = [
    ["mistake", t.mistake],
    ["worried", t.worried],
    ["consequences", t.consequences],
  ];

  const title = forum ? (
    <WithForum template={t.title} forum={forum} />
  ) : (
    t.titleNoForum
  );

  if (clearAndSerious(variant))
    return (
      <ClearAndSerious
        copy={copy}
        pack={pack}
        title={title}
        forum={forum}
        site={site}
        lang={lang}
        variant={variant}
      />
    );

  return (
    <>
      <div className="flex flex-col gap-3.5">
        <h1 className="m-0 text-[clamp(30px,3.4vw,42px)] leading-tight font-bold">
          {title}
        </h1>
        <p className="m-0 max-w-[34em] text-[clamp(19px,1.6vw,21px)] leading-normal">
          {t.body}
        </p>
      </div>

      {helpFirst(variant) ? (
        <HelpFirst
          copy={copy}
          pack={pack}
          forum={forum}
          site={site}
          lang={lang}
          variant={variant}
        />
      ) : (
        <section
          aria-labelledby="question"
          className="mt-3 flex flex-col gap-3"
        >
          <h2 id="question" className="m-0 text-lg font-bold text-muted">
            {t.question}
          </h2>
          {options.map(([step, label]) => (
            <FlowLink
              key={step}
              href={stepHref(site, step, lang, variant)}
              className="flex min-h-16 items-center justify-between gap-3 rounded-xl border-[1.5px] border-edge bg-white px-5 py-3.5 text-lg leading-snug font-bold text-ink no-underline hover:bg-tint-hover hover:text-ink"
            >
              <span>{label}</span>
              <ChevronRight />
            </FlowLink>
          ))}
          <p className="mt-1.5 text-base leading-normal text-muted">
            {t.direct}{" "}
            <FlowLink
              href={stepHref(site, "help", lang, variant)}
              className="inline-flex min-h-11 items-center font-bold underline"
            >
              {t.directLink}
            </FlowLink>
          </p>
        </section>
      )}
    </>
  );
}

// domain on one line, it would otherwise break at a hyphen
function WithForum({ template, forum }: { template: string; forum: string }) {
  const [before, after] = template.split("{forum}");
  return (
    <>
      {before}
      <span className="whitespace-nowrap">{forum}</span>
      {after}
    </>
  );
}
