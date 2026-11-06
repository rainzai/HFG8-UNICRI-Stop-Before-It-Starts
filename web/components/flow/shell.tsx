import type { ReactNode } from "react";

import { ChevronLeft, Lock } from "@/components/flow/icons";
import { fill, type Copy, type Pack } from "@/lib/content";

type Props = {
  copy: Copy;
  pack: Pack;
  forum: string | null;
  children: ReactNode;
};

export function Shell({ copy, pack, forum, children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-between gap-3 py-3 pr-4 pl-6">
          <span className="text-[17px] font-bold">
            {copy.chrome.serviceName}
          </span>
          <a
            href={pack.exitUrl}
            className="inline-flex min-h-11 items-center rounded-[10px] border-[1.5px] border-edge px-4 text-[15px] font-bold text-ink no-underline hover:text-ink"
          >
            {copy.chrome.close}
          </a>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[720px] grow flex-col gap-[22px] px-6 pt-12 pb-10">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[720px] flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-6 pt-4 pb-7">
          {forum && (
            <a
              href={`https://${forum}`}
              className="inline-flex min-h-11 items-center gap-1.5 text-base font-bold"
            >
              <ChevronLeft />
              {fill(copy.chrome.backToForum, { forum })}
            </a>
          )}
          <p className="flex items-center gap-2 text-sm text-muted">
            <Lock />
            {copy.chrome.privacy}
          </p>
        </div>
      </footer>
    </div>
  );
}
