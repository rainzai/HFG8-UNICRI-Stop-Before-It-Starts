import { CallButton } from "@/components/flow/call-button";
import { ChatButton } from "@/components/flow/chat-button";
import { FlowLink } from "@/components/flow/flow-link";
import { ChevronRight } from "@/components/flow/icons";
import { fill, type Copy, type Pack } from "@/lib/content";
import {
  ANONYMOUS_ANCHOR,
  NOT_READY_ANCHOR,
  stepHref,
  type Step,
  type Variant,
} from "@/lib/flow";

// variant b, screen 1: call and chat first, the three options below

type Props = {
  copy: Copy;
  pack: Pack;
  forum: string | null;
  site: string;
  lang: string;
  variant: Variant;
};

export function HelpFirst({ copy, pack, forum, site, lang, variant }: Props) {
  const t = copy.start;
  const { name, org } = pack.helpline;
  const options: [Step, string][] = [
    ["mistake", t.mistake],
    ["worried", t.worried],
    ["consequences", t.consequences],
  ];

  return (
    <>
      <section
        aria-label={fill(copy.help.title, { helpline: name })}
        className="mt-1 flex flex-col gap-3 rounded-[28px] bg-tint px-[18px] pt-[22px] pb-3 sm:rounded-[32px] sm:px-8 sm:pt-8"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <CallButton copy={copy} pack={pack} statsSite={forum} />
          <ChatButton copy={copy} pack={pack} statsSite={forum} />
        </div>
        <p className="m-0 mt-1 text-center text-sm font-bold text-muted sm:text-[15px]">
          {fill(copy.contact.caption, { helpline: name, org })}
        </p>
        <FlowLink
          href={stepHref(site, "help", lang, variant, ANONYMOUS_ANCHOR)}
          className="inline-flex min-h-11 items-center self-center text-base font-bold underline"
        >
          {copy.contact.anonymousLink}
        </FlowLink>
        <FlowLink
          href={stepHref(site, "help", lang, variant, NOT_READY_ANCHOR)}
          className="-mt-3 inline-flex min-h-11 items-center self-center text-[15px] text-muted underline"
        >
          {copy.help.notReadyTitle}
        </FlowLink>
      </section>

      <section
        aria-labelledby="question"
        className="mt-2 flex flex-col gap-2 sm:mt-3.5"
      >
        <h2 id="question" className="m-0 mb-1 text-base font-bold text-muted">
          {t.question}
        </h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {options.map(([step, label]) => (
            <FlowLink
              key={step}
              href={stepHref(site, step, lang, variant)}
              className="flex min-h-13 items-center justify-between gap-3 rounded-[18px] bg-tint-hover px-[18px] py-2.5 text-[19px] leading-snug text-ink no-underline hover:bg-[#efe0d2] hover:text-ink sm:min-h-14 sm:py-3"
            >
              <span>{label}</span>
              <ChevronRight />
            </FlowLink>
          ))}
        </div>
      </section>
    </>
  );
}
