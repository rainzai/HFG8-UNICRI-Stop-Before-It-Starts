import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

import { isAdmin } from "@/lib/access";
import { chooseVariant } from "@/lib/bandit";
import { hasCountry } from "@/lib/content";
import { CLICK_EVENTS, countKey, increment, SAVED_SITE } from "@/lib/counter";
import {
  decodeSite,
  DEFAULT_VARIANT,
  parseForumDomain,
  parseStep,
  parseVariant,
  REVISIT_PARAM,
} from "@/lib/flow";

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/count") {
    if (request.method !== "POST")
      return new NextResponse(null, { status: 405 });
    const body = await request.json().catch(() => null);
    const site = statsSite(body?.site);
    const click = CLICK_EVENTS.find((e) => e === body?.event);
    const variant = parseVariant(body?.variant) ?? DEFAULT_VARIANT;
    if (site && click)
      event.waitUntil(increment(countKey(site, variant, click)));
    return new NextResponse(null, { status: 204 });
  }

  const [, kind, rawSite, ...segments] = pathname.split("/");
  if (kind === "admin") {
    if (isAdmin(request.headers.get("authorization")))
      return NextResponse.next();
    return new NextResponse("Login required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="dashboard", charset="UTF-8"',
      },
    });
  }

  const params = request.nextUrl.searchParams;

  // no variant yet (the forum's redirect): the bandit picks one, count the next request
  if (kind === "w" && !parseVariant(params.get("v"))) {
    const url = request.nextUrl.clone();
    url.searchParams.set("v", await chooseVariant());
    return NextResponse.redirect(url, 307);
  }

  if (params.has(REVISIT_PARAM)) return NextResponse.next();

  if (kind === "w") {
    const site = statsSite(decodeSite(rawSite ?? ""));
    const step = parseStep(segments);
    const variant = parseVariant(params.get("v")) ?? DEFAULT_VARIANT;
    if (site && step)
      event.waitUntil(increment(countKey(site, variant, `step:${step}`)));
  } else if (kind === "i" && rawSite && hasCountry(rawSite.toUpperCase())) {
    // the saved link is the same for everyone, so no variant
    event.waitUntil(
      increment(countKey(SAVED_SITE, DEFAULT_VARIANT, "step:saved")),
    );
  }

  return NextResponse.next();
}

// only real forum domains, so nobody can fill the file with made-up keys
function statsSite(value: unknown) {
  if (value === SAVED_SITE) return SAVED_SITE;
  return typeof value === "string" ? parseForumDomain(value) : null;
}

export const config = {
  matcher: ["/w/:path*", "/i/:path*", "/api/count", "/admin/:path*"],
};
