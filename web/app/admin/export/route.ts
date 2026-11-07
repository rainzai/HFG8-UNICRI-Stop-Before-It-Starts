import { NextResponse, type NextRequest } from "next/server";

import { readCounts } from "@/lib/counter";
import { combineForums, metricsEvent, periodOf, sumCounts } from "@/lib/stats";

// combined totals for partners, behind basic auth in proxy.ts
export async function GET(request: NextRequest) {
  const period = periodOf(Object.fromEntries(request.nextUrl.searchParams));
  const variants = combineForums(sumCounts(await readCounts(), period));
  const events = [...variants].map(([variant, totals]) =>
    metricsEvent(variant, totals, period),
  );
  return NextResponse.json(events, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="totals-${period.from}-${period.to}.json"`,
    },
  });
}
