import type { ReactNode } from "react";

import { BeaconLink } from "@/components/flow/beacon-link";
import { ExitLink } from "@/components/flow/exit-link";
import { FlowLink } from "@/components/flow/flow-link";
import { ChevronLeft, Lock } from "@/components/flow/icons";
import {
  LanguageMenu,
  type LanguageOption,
} from "@/components/flow/language-menu";
import { fill, type Copy, type Pack } from "@/lib/content";
import { forumHref } from "@/lib/flow";

type Props = {
  copy: Copy;
  pack: Pack;
  forum: string | null;
  statsSite: string | null;
  backHref?: string;
  lang: string;
  languages: LanguageOption[];
  children: ReactNode;
};

export function Shell({
  copy,
  pack,
  forum,
  statsSite,
  backHref,
  lang,
  languages,
  children,
}: Props) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper font-sans text-ink">
      <header className="border-b border-line in-data-[theme=c]:border-b-2 in-data-[theme=c]:border-ink">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-between gap-3 py-3 pr-4 pl-6">
          <span className="text-[17px] font-bold">
            {copy.chrome.serviceName}
          </span>
          <div className="flex items-center gap-1">
            <LanguageMenu
              label={copy.chrome.language}
              current={lang}
              options={languages}
            />
            <ExitLink
              site={statsSite}
              href={pack.exitUrl}
              className="inline-flex min-h-11 items-center rounded-[10px] border-[1.5px] border-edge px-4 text-[15px] font-bold text-ink no-underline hover:text-ink in-data-[theme=c]:rounded-[4px] in-data-[theme=c]:border-2"
            >
              {copy.chrome.close}
            </ExitLink>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[720px] grow flex-col gap-[22px] px-6 pt-12 pb-10">
        {backHref && (
          <FlowLink
            href={backHref}
            className="inline-flex min-h-11 items-center gap-1 self-start text-base text-muted underline"
          >
            <ChevronLeft />
            {copy.chrome.back}
          </FlowLink>
        )}
        {children}
      </main>

      <footer className="border-t border-line in-data-[theme=c]:border-t-2 in-data-[theme=c]:border-ink">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-1.5 px-6 pt-4 pb-7 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-6">
          {/* on phones the text is centered and the icon hangs left of it: -ml equals icon + gap */}
          {forum && (
            <BeaconLink
              site={statsSite}
              event="forum"
              href={forumHref(forum)}
              className="inline-flex min-h-11 items-center gap-1.5 text-base font-bold max-sm:-ml-6"
            >
              <ChevronLeft />
              {fill(copy.chrome.backToForum, { forum })}
            </BeaconLink>
          )}
          <p className="flex items-center gap-2 text-sm text-muted max-sm:-ml-6">
            <Lock />
            {copy.chrome.privacy}
          </p>
        </div>
      </footer>
    </div>
  );
}
