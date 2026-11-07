import { connection } from "next/server";
import { Suspense } from "react";

import { FunnelTable } from "@/components/stats/funnel-table";
import { PeriodNav } from "@/components/stats/period-nav";
import { MIN_COUNT, readCounts, SAVED_SITE } from "@/lib/counter";
import { combineForums, hidden, periodOf, sumCounts } from "@/lib/stats";

// internal dashboard, behind basic auth in proxy.ts

// required by cacheComponents for searchParams
export default function Page(props: PageProps<"/admin">) {
  return (
    <Suspense fallback={null}>
      <Admin {...props} />
    </Suspense>
  );
}

async function Admin({ searchParams }: PageProps<"/admin">) {
  // request time only: the period depends on today
  await connection();
  const period = periodOf(await searchParams);
  const sites = sumCounts(await readCounts(), period);
  const variants = [...combineForums(sites)].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const forums = [...sites]
    .filter(([site]) => site !== SAVED_SITE)
    .sort(([a], [b]) => a.localeCompare(b));
  const saved = sites.get(SAVED_SITE);
  const savedTotal = (event: string) => {
    const sum = [...(saved?.values() ?? [])].reduce(
      (total, t) => total + (t[event] ?? 0),
      0,
    );
    return hidden(sum) ?? `< ${MIN_COUNT}`;
  };

  return (
    <main
      lang="en"
      className="mx-auto flex max-w-[960px] flex-col gap-10 px-4 py-12 sm:px-6"
    >
      <div className="flex flex-col gap-3">
        <h1 className="m-0 text-3xl font-bold">Dashboard</h1>
        <PeriodNav period={period} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">Variants, all forums</h2>
        <FunnelTable
          labelHeader="Variant"
          rows={variants.map(([variant, totals]) => ({
            label: variant,
            totals,
          }))}
        />
        <a
          href={`/admin/export?${new URLSearchParams(period)}`}
          className="self-start text-[15px] text-ink underline hover:text-black"
        >
          Export combined totals (JSON)
        </a>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">Per forum</h2>
        <FunnelTable
          labelHeader="Forum / variant"
          rows={forums.flatMap(([site, perVariant]) =>
            [...perVariant]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([variant, totals]) => ({
                label: `${site} / ${variant}`,
                totals,
              })),
          )}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-xl font-bold">Saved link</h2>
        <p className="m-0">
          Visits {savedTotal("step:saved")}, call {savedTotal("call")}, chat{" "}
          {savedTotal("chat")}. Not in the totals above: these visitors saw no
          warning.
        </p>
      </section>
    </main>
  );
}
