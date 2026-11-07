"use client";

import type { ComponentProps } from "react";

type Props = ComponentProps<"a"> & {
  // null: invalid forum, not counted
  site: string | null;
  event: "call" | "chat";
};

// counts the click without delaying it, sends only site, variant and event
export function BeaconLink({ site, event, ...props }: Props) {
  function count() {
    if (!site) return;
    const variant = new URLSearchParams(location.search).get("v");
    navigator.sendBeacon(
      "/api/count",
      new Blob([JSON.stringify({ site, variant, event })], {
        type: "application/json",
      }),
    );
  }

  return <a {...props} onClick={count} />;
}
