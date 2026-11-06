"use client";

import type { ComponentProps } from "react";

type Props = ComponentProps<"a"> & {
  // null: invalid forum, not counted
  site: string | null;
  event: "call" | "chat";
};

// counts the click without delaying it, sends only site and event
export function BeaconLink({ site, event, ...props }: Props) {
  function count() {
    if (!site) return;
    navigator.sendBeacon(
      "/api/count",
      new Blob([JSON.stringify({ site, event })], { type: "application/json" }),
    );
  }

  return <a {...props} onClick={count} />;
}
