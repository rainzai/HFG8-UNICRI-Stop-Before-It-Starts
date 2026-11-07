import { connection } from "next/server";
import { Suspense } from "react";

import { EventTable } from "@/components/stats/event-table";
import { ForumTable } from "@/components/stats/forum-table";
import { PeriodNav } from "@/components/stats/period-nav";
import { readCounts, SAVED_SITE } from "@/lib/counter";
import { combineForums, periodOf, sumCounts, sumVariants } from "@/lib/stats";

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
  // no variant on the saved link, all in one column
  const saved = sites.get(SAVED_SITE);

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
        <p className="m-0 text-[15px]">
          Each screen and button, with the share of warnings.
        </p>
        <EventTable variants={variants} saved={saved && sumVariants(saved)} />
        <a
          href={`/admin/export?${new URLSearchParams(period)}`}
          className="self-start text-[15px] text-ink underline hover:text-black"
        >
          Export combined totals (JSON)
        </a>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">Per forum</h2>
        <ForumTable
          variants={variants.map(([variant]) => variant)}
          forums={forums}
        />
      </section>
    </main>
  );
}
