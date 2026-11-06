import Link from "next/link";
import type { ComponentProps } from "react";

// no prefetch: server counts step requests, prefetch would inflate them
export function FlowLink(props: Omit<ComponentProps<typeof Link>, "prefetch">) {
  return <Link {...props} prefetch={false} />;
}
