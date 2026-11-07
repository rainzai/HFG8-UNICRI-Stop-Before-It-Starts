import { NextResponse, type NextRequest } from "next/server";

import { isStatsKey } from "@/lib/access";
import { readCounts } from "@/lib/counter";
import { decodeSite, parseForumDomain } from "@/lib/flow";
import { metricsEvent, periodOf, sumCounts } from "@/lib/stats";

// a forum's own totals per variant, with its key in the header, never the url
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/metrics/[site]">,
) {
  const site = parseForumDomain(decodeSite((await params).site));
  const key = request.headers
    .get("authorization")
    ?.match(/^Bearer (\S+)$/)?.[1];
  // 404, not 401: does not tell which forums take part
  if (!site || !key || !isStatsKey(site, key))
    return new NextResponse(null, { status: 404 });

  const period = periodOf(Object.fromEntries(request.nextUrl.searchParams));
  const variants = sumCounts(await readCounts(), period, site).get(site);
  const events = [...(variants ?? [])].map(([variant, totals]) =>
    metricsEvent(variant, totals, period),
  );
  return NextResponse.json(events, {
    headers: { "Cache-Control": "no-store" },
  });
}
