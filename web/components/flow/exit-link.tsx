"use client";

import type { ComponentProps, MouseEvent } from "react";

import { countClick } from "@/components/flow/beacon-link";

// replaces this page in history, so Back does not return here.
// earlier steps stay in history; without JS it is a plain link
export function ExitLink({
  href,
  site,
  ...props
}: ComponentProps<"a"> & { site: string | null }) {
  function leave(e: MouseEvent<HTMLAnchorElement>) {
    countClick(site, "exit");
    if (!href || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    location.replace(href);
  }

  return <a href={href} {...props} onClick={leave} />;
}
