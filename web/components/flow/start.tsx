import { FlowLink } from "@/components/flow/flow-link";
import { ChevronRight } from "@/components/flow/icons";
import { fill, type Copy } from "@/lib/content";
import { stepHref, type Step } from "@/lib/flow";

type Props = {
  copy: Copy;
  forum: string | null;
  site: string;
  lang: string;
};

export function Start({ copy, forum, site, lang }: Props) {
  const t = copy.start;
  const options: [Step, string][] = [
    ["mistake", t.mistake],
    ["worried", t.worried],
    ["consequences", t.consequences],
  ];

  return (
    <>
      <div className="flex flex-col gap-3.5">
        <h1 className="m-0 text-[clamp(30px,3.4vw,42px)] leading-tight font-bold">
          {forum ? fill(t.title, { forum }) : t.titleNoForum}
        </h1>
        <p className="m-0 max-w-[34em] text-[clamp(19px,1.6vw,21px)] leading-normal">
          {t.body}
        </p>
      </div>

      <section aria-labelledby="question" className="mt-3 flex flex-col gap-3">
        <h2 id="question" className="m-0 text-lg font-bold text-muted">
          {t.question}
        </h2>
        {options.map(([step, label]) => (
          <FlowLink
            key={step}
            href={stepHref(site, step, lang)}
            className="flex min-h-16 items-center justify-between gap-3 rounded-xl border-[1.5px] border-edge bg-white px-5 py-3.5 text-lg leading-snug font-bold text-ink no-underline hover:bg-tint-hover hover:text-ink"
          >
            <span>{label}</span>
            <ChevronRight />
          </FlowLink>
        ))}
        <p className="mt-1.5 text-base leading-normal text-muted">
          {t.direct}{" "}
          <FlowLink
            href={stepHref(site, "help", lang)}
            className="inline-flex min-h-11 items-center font-bold underline"
          >
            {t.directLink}
          </FlowLink>
        </p>
      </section>
    </>
  );
}
