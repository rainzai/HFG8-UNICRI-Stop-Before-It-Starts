import Link from "next/link";
import type { ComponentProps } from "react";

// no prefetch: server counts step requests, prefetch would inflate them.
// replace: the whole flow is one entry in the tab, so browser Back goes
// straight to the forum; "Vorige" steps back inside the flow
export function FlowLink(
  props: Omit<ComponentProps<typeof Link>, "prefetch" | "replace">,
) {
  return <Link {...props} prefetch={false} replace />;
}
