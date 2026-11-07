"use client";

import type { ComponentProps } from "react";

import type { ClickEvent } from "@/lib/counter";

type Props = ComponentProps<"a"> & {
  // null: invalid forum, not counted
  site: string | null;
  event: ClickEvent;
};

// counts the click without delaying it, sends only site, variant and event
export function countClick(site: string | null, event: ClickEvent) {
  if (!site) return;
  const variant = new URLSearchParams(location.search).get("v");
  navigator.sendBeacon(
    "/api/count",
    new Blob([JSON.stringify({ site, variant, event })], {
      type: "application/json",
    }),
  );
}

export function BeaconLink({ site, event, ...props }: Props) {
  return <a {...props} onClick={() => countClick(site, event)} />;
}
