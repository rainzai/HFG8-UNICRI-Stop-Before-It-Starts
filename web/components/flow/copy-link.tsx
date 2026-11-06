"use client";

import { useState, useSyncExternalStore } from "react";

import { Copy } from "@/components/flow/icons";

type Props = {
  path: string;
  label: string;
  copiedLabel: string;
};

const noop = () => () => {};

export function CopyLink({ path, label, copiedLabel }: Props) {
  // origin only exists in the browser, empty on the server render
  const origin = useSyncExternalStore(
    noop,
    () => window.location.origin,
    () => "",
  );
  const [copied, setCopied] = useState(false);
  const url = origin + path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // clipboard blocked, the link stays visible to copy by hand
    }
  }

  return (
    <div className="flex w-full max-w-[480px] flex-col gap-2.5">
      <a
        href={path}
        className="rounded-xl border border-line bg-white px-4 py-3.5 text-base break-all"
      >
        {url}
      </a>
      <button
        type="button"
        onClick={copy}
        className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-brand px-5 text-lg font-bold text-white hover:bg-brand-dark"
      >
        <Copy />
        <span aria-live="polite">{copied ? copiedLabel : label}</span>
      </button>
    </div>
  );
}
