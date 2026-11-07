"use client";

import { useState } from "react";

// one code block, with tabs when there are several versions.
// a tab can have a note (e.g. where the code goes): shown, never copied
export function Code({ tabs }: { tabs: [string, string, string?][] }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [, code, note] = tabs[active];

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked, the code stays selectable
    }
  }

  const copyButton = (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 cursor-pointer px-3 py-2 text-sm text-white/70 hover:text-white"
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );

  // a single line: code and copy on one row
  if (tabs.length === 1)
    return (
      <div className="flex items-center gap-2 overflow-hidden rounded-lg bg-[#1e2a2f] pl-4 text-[#f7f6f2]">
        <pre className="m-0 min-w-0 flex-1 overflow-x-auto py-3 font-mono text-[13px]">
          {code}
        </pre>
        {copyButton}
      </div>
    );

  return (
    <div className="overflow-hidden rounded-lg bg-[#1e2a2f] text-[#f7f6f2]">
      <div className="flex items-center justify-between gap-4 border-b border-white/15 px-2">
        <div role="tablist" className="flex">
          {tabs.map(([name], i) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className="cursor-pointer border-b-2 border-transparent px-3 py-2 text-sm text-white/70 hover:text-white aria-selected:border-white aria-selected:text-white"
            >
              {name}
            </button>
          ))}
        </div>
        {copyButton}
      </div>
      {note && (
        <p className="m-0 px-4 pt-3 font-mono text-[13px] [overflow-wrap:anywhere] text-white/55">
          {note}
        </p>
      )}
      <pre className="m-0 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
