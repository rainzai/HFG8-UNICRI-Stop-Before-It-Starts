import type { ReactNode } from "react";

import { BeaconLink } from "@/components/flow/beacon-link";
import { FlowLink } from "@/components/flow/flow-link";
import { Chat, ChevronRight, Phone } from "@/components/flow/icons";
import { fill, type Copy, type Pack } from "@/lib/content";
import {
  ANONYMOUS_ANCHOR,
  stepHref,
  type Step,
  type Variant,
} from "@/lib/flow";

// variant c, screen 1: the message, a dark band with the way out, a numbered list

type Props = {
  copy: Copy;
  pack: Pack;
  title: ReactNode;
  forum: string | null;
  site: string;
  lang: string;
  variant: Variant;
};

export function ClearAndSerious({
  copy,
  pack,
  title,
  forum,
  site,
  lang,
  variant,
}: Props) {
  const t = copy.start;
  const { name, org, phone, chatUrl } = pack.helpline;
  const options: [Step, string][] = [
    ["mistake", t.mistake],
    ["worried", t.worried],
    ["consequences", t.consequences],
  ];

  return (
    <>
      <div className="flex flex-col gap-[18px] sm:gap-[22px]">
        <span aria-hidden="true" className="block h-1.5 w-12 bg-ink sm:w-16" />
        <h1 className="m-0 text-[clamp(36px,5vw,56px)] leading-[1.08] font-extrabold tracking-[-0.015em]">
          {title}
        </h1>
        <p className="m-0 max-w-[30em] text-[clamp(21px,2vw,24px)] leading-normal font-bold">
          {t.body}
        </p>
      </div>

      {/* full width band: out of main's column, content back in it */}
      <section
        aria-labelledby="way-out"
        className="mx-[calc(50%-50vw)] mt-4 bg-[#14181c] text-white [&_a]:focus-visible:outline-white"
      >
        <div className="mx-auto flex max-w-[720px] flex-col gap-5 px-6 pt-8 pb-6 sm:gap-6 sm:pt-12 sm:pb-9">
          <div className="flex flex-col gap-2">
            <h2
              id="way-out"
              className="m-0 text-[clamp(30px,3.4vw,38px)] leading-tight font-extrabold"
            >
              {t.wayOut}
            </h2>
            <p className="m-0 text-[19px] leading-normal text-[#e7e9ec] sm:text-xl">
              {fill(t.wayOutBody, { helpline: name })}
            </p>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <BeaconLink
              site={forum}
              event="call"
              href={`tel:${phone.replaceAll(" ", "")}`}
              className="flex min-h-16 items-center justify-between gap-3 rounded-[4px] bg-white px-5 text-xl font-extrabold whitespace-nowrap text-ink no-underline hover:bg-[#e3e6ea] hover:text-ink"
            >
              <span className="inline-flex items-center gap-3">
                <Phone />
                {fill(copy.contact.call, { phone })}
              </span>
              <ChevronRight />
            </BeaconLink>
            <BeaconLink
              site={forum}
              event="chat"
              href={chatUrl}
              className="flex min-h-15 items-center justify-between gap-3 rounded-[4px] border-2 border-white px-5 text-[19px] font-bold text-white no-underline hover:bg-[#262c33] hover:text-white sm:min-h-16"
            >
              <span className="inline-flex items-center gap-3">
                <Chat />
                {copy.contact.chat}
              </span>
              <ChevronRight />
            </BeaconLink>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <p className="m-0 text-[15px] leading-snug text-[#c4c8ce]">
              {fill(copy.contact.caption, { helpline: name, org })}
            </p>
            <FlowLink
              href={stepHref(site, "help", lang, variant, ANONYMOUS_ANCHOR)}
              className="inline-flex min-h-11 items-center text-base font-bold text-white underline hover:text-[#e3e6ea]"
            >
              {copy.contact.anonymousLink}
            </FlowLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="question" className="mt-6 flex flex-col">
        <h2 id="question" className="m-0 mb-3 text-[19px] font-extrabold">
          {t.question}
        </h2>
        <ol className="m-0 list-none border-t-2 border-ink p-0">
          {options.map(([step, label], i) => (
            <li key={step} className="border-b border-line">
              <FlowLink
                href={stepHref(site, step, lang, variant)}
                className="grid min-h-16 grid-cols-[32px_minmax(0,1fr)_20px] items-center gap-2 py-3 text-[19px] leading-snug font-bold text-ink no-underline hover:bg-tint hover:text-ink sm:grid-cols-[40px_minmax(0,1fr)_20px] sm:px-2"
              >
                <span aria-hidden="true" className="font-extrabold text-muted">
                  {i + 1}
                </span>
                <span>{label}</span>
                <ChevronRight />
              </FlowLink>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
