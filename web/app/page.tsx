import { redirect } from "next/navigation";

import { DEFAULT_COUNTRY } from "@/lib/content";
import { REVISIT_PARAM, savedLinkPath } from "@/lib/flow";

// no page of its own: someone who types the domain gets the general help page.
// marked as a revisit, so it is not counted as an opened saved link
export default function Home() {
  redirect(`${savedLinkPath(DEFAULT_COUNTRY)}?${REVISIT_PARAM}=1`);
}
