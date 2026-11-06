import { Suspense } from "react";

import { MIN_COUNT, parseKey, readCounts } from "@/lib/counter";
import { decodeSite, STEPS } from "@/lib/flow";

const EVENTS = [
  ...Object.keys(STEPS).map((step) => `step:${step}`),
  "step:saved",
  "call",
  "chat",
];

// required by cacheComponents for params
export default function Page(props: PageProps<"/stats/[site]">) {
  return (
    <Suspense fallback={null}>
      <Stats {...props} />
    </Suspense>
  );
}

async function Stats({ params }: PageProps<"/stats/[site]">) {
  const site = decodeSite((await params).site);
  const totals = new Map<string, number>();
  for (const [key, count] of Object.entries(await readCounts())) {
    const { site: keySite, event } = parseKey(key);
    if (keySite !== site) continue;
    totals.set(event, (totals.get(event) ?? 0) + count);
  }

  return (
    <main className="mx-auto flex max-w-[720px] flex-col gap-6 px-6 py-12">
      <h1 className="m-0 text-3xl font-bold">{site}</h1>
      <table className="w-full border-collapse text-left">
        <tbody>
          {EVENTS.filter((e) => totals.has(e)).map((event) => (
            <tr key={event} className="border-b border-line">
              <th className="py-2 font-normal">{event}</th>
              <td className="py-2 text-right font-bold tabular-nums">
                {shown(totals.get(event) ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m-0 text-sm text-muted">
        All days together. Counts below {MIN_COUNT} are hidden.
      </p>
    </main>
  );
}

function shown(count: number) {
  return count < MIN_COUNT ? `< ${MIN_COUNT}` : String(count);
}
