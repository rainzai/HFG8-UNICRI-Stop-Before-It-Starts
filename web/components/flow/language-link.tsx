"use client";

import type { ComponentProps } from "react";

import { FlowLink } from "@/components/flow/flow-link";
import { languageSwitchHref } from "@/lib/flow";

// in-app switch: no reload, Back skips it, and the proxy does not count it
export function LanguageLink({
  href,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  return (
    <FlowLink
      {...props}
      href={languageSwitchHref(href)}
      replace
      scroll={false}
      onClick={(e) =>
        e.currentTarget.closest("details")?.removeAttribute("open")
      }
    />
  );
}
