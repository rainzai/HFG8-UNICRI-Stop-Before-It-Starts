import type { ReactNode } from "react";

import { CallButton } from "@/components/flow/call-button";
import { ChatButton } from "@/components/flow/chat-button";
import { FlowLink } from "@/components/flow/flow-link";
import { Check } from "@/components/flow/icons";
import { fill, type Copy, type Pack } from "@/lib/content";
import { ANONYMOUS_ANCHOR, stepHref } from "@/lib/flow";

type Props = {
  copy: Copy;
  pack: Pack;
  // no site on the saved-link page: no forum, nothing to save
  site?: string;
  statsSite: string | null;
  lang: string;
};

export function Help({ copy, pack, site, statsSite, lang }: Props) {
  const t = copy.help;
  const { name: helpline, org, url, hours } = pack.helpline;
  const vars = { helpline, org };
  const hoursLines = hours.map(({ days, open, close }) => ({
    days: dayRange(days, lang),
    time: `${open}–${close}`,
  }));

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-[clamp(30px,3.4vw,42px)] leading-tight font-bold">
          {fill(t.title, vars)}
        </h1>
        <p className="m-0 text-lg leading-normal">{fill(t.subtitle, vars)}</p>
      </div>

      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-2.5">
          <CallButton copy={copy} pack={pack} statsSite={statsSite} />
          <ChatButton copy={copy} pack={pack} statsSite={statsSite} />
        </div>
        <a href={url} className="self-start text-[15px] underline">
          {new URL(url).host}
        </a>
      </div>
      <div className="flex flex-col gap-1.5 text-[15px] text-muted">
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
          <dt className="col-span-2 font-bold text-ink">{t.hoursTitle}</dt>
          {hoursLines.map(({ days, time }) => (
            <div key={days} className="contents">
              <dt>{days}</dt>
              <dd className="m-0">{time}</dd>
            </div>
          ))}
        </dl>
        <span>{t.closedHolidays}</span>
      </div>

      <section
        id={ANONYMOUS_ANCHOR}
        aria-labelledby="anonymous"
        className="mt-[18px] flex scroll-mt-6 flex-col gap-4"
      >
        <h2 id="anonymous" className="m-0 text-[26px] leading-tight font-bold">
          {t.anonymousTitle}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] items-start gap-5">
          <Answer answer={t.anonymousAnswer}>
            <p className="m-0 text-lg leading-normal">{t.anonymousBody}</p>
          </Answer>
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0 pt-1">
            {t.anonymousPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-[17px] leading-snug"
              >
                <span className="mt-px text-brand">
                  <Check />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="reported"
        className="mt-[18px] flex flex-col gap-4"
      >
        <h2 id="reported" className="m-0 text-[26px] leading-tight font-bold">
          {t.reportedTitle}
        </h2>
        <Answer answer={t.reportedAnswer}>
          <p className="m-0 text-lg leading-normal">
            {fill(t.reportedBody, vars)}
          </p>
          <p className="m-0 text-base leading-snug text-muted">
            {t.reportedException}
          </p>
        </Answer>
      </section>

      <section
        aria-labelledby="expect"
        className="mt-[18px] flex flex-col gap-4"
      >
        <h2 id="expect" className="m-0 text-[26px] leading-tight font-bold">
          {t.expectTitle}
        </h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-6 gap-y-[18px] p-0">
          {t.expectSteps.map((step, i) => (
            <li key={step} className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white"
              >
                {i + 1}
              </span>
              <span className="pt-1 text-[17px] leading-snug">
                {fill(step, vars)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="not-ready"
        className="mt-[18px] flex flex-col gap-3"
      >
        <h2 id="not-ready" className="m-0 text-[21px] leading-tight font-bold">
          {t.notReadyTitle}
        </h2>
        <a
          href={pack.selfHelp.url}
          className="flex flex-col gap-1.5 rounded-xl border-[1.5px] border-edge bg-white p-5 text-ink no-underline hover:text-ink"
        >
          <span className="text-lg font-bold text-brand underline underline-offset-3">
            {pack.selfHelp.name}
          </span>
          <span className="text-base leading-snug">{t.selfHelpBody}</span>
        </a>
        {site && (
          <FlowLink
            href={stepHref(site, "later", lang)}
            className="inline-flex min-h-11 items-center self-start text-[17px] font-bold underline"
          >
            {t.saveLink}
          </FlowLink>
        )}
      </section>

      <div className="mt-3 flex flex-col gap-2.5 border-t border-line pt-6">
        <CallButton
          copy={copy}
          pack={pack}
          statsSite={statsSite}
          className="max-w-[420px]"
        />
        <p className="m-0 text-[15px] leading-snug text-muted">
          {fill(t.alsoFor, vars)}
        </p>
      </div>
    </>
  );
}

// 1 = monday; 2024-01-01 was a monday
function dayRange([first, last]: [number, number], lang: string) {
  const name = (day: number) =>
    new Intl.DateTimeFormat(lang, { weekday: "short", timeZone: "UTC" }).format(
      Date.UTC(2024, 0, day),
    );
  return first === last ? name(first) : `${name(first)}–${name(last)}`;
}

function Answer({ answer, children }: { answer: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] border-2 border-brand bg-white p-[22px]">
      <p className="m-0 text-[28px] font-bold text-brand">{answer}</p>
      {children}
    </div>
  );
}
