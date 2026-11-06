import { FlowLink } from "@/components/flow/flow-link";
import { fill, type Copy } from "@/lib/content";
import { forumHref, stepHref } from "@/lib/flow";

type Props = {
  copy: Copy;
  forum: string | null;
  site: string;
  lang: string;
};

export function Mistake({ copy, forum, site, lang }: Props) {
  const t = copy.mistake;

  return (
    <>
      <h1 className="m-0 text-[clamp(30px,3.4vw,42px)] leading-tight font-bold">
        {t.title}
      </h1>
      <p className="m-0 max-w-[34em] text-[19px] leading-normal">{t.body}</p>

      {forum && (
        <a
          href={forumHref(forum)}
          className="mt-2 flex min-h-14 max-w-[420px] items-center justify-center rounded-xl bg-brand px-6 text-lg font-bold text-white no-underline hover:bg-brand-dark hover:text-white"
        >
          {fill(copy.chrome.backToForum, { forum })}
        </a>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-tint p-5">
        <p className="m-0 text-[17px] leading-snug">{t.nudge}</p>
        <FlowLink
          href={stepHref(site, "help", lang)}
          className="inline-flex min-h-11 items-center text-[17px] font-bold underline"
        >
          {t.nudgeLink}
        </FlowLink>
      </div>
    </>
  );
}
