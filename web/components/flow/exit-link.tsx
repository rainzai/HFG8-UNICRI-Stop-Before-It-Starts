"use client";

import type { ComponentProps, MouseEvent } from "react";

// replaces this page in history, so Back does not return here.
// earlier steps stay in history; without JS it is a plain link
export function ExitLink({ href, ...props }: ComponentProps<"a">) {
  function leave(e: MouseEvent<HTMLAnchorElement>) {
    if (!href || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    location.replace(href);
  }

  return <a href={href} {...props} onClick={leave} />;
}
