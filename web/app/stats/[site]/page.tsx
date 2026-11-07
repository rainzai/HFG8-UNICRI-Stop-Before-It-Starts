import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { EventTable } from "@/components/stats/event-table";
import { MonthNav } from "@/components/stats/period-nav";
import { isStatsKey } from "@/lib/access";
import { readCounts } from "@/lib/counter";
import { decodeSite, parseForumDomain } from "@/lib/flow";
import { ownOrigin } from "@/lib/origin";
import { monthOf, sumCounts } from "@/lib/stats";

// a forum's private stats link, from /setup after the domain check

// required by cacheComponents for params
export default function Page(props: PageProps<"/stats/[site]">) {
  return (
    <Suspense fallback={null}>
      <Stats {...props} />
    </Suspense>
  );
}

async function Stats({ params, searchParams }: PageProps<"/stats/[site]">) {
  // request time only: the period depends on today
  await connection();
  const site = parseForumDomain(decodeSite((await params).site));
  const query = await searchParams;
  const key = typeof query.k === "string" ? query.k : null;
  // same 404 as an unknown page: does not tell which forums take part
  if (!site || !key || !isStatsKey(site, key)) notFound();

  const period = monthOf(query);
  const variants = sumCounts(await readCounts(), period, site).get(site);
  const sorted = [...(variants ?? [])].sort(([a], [b]) => a.localeCompare(b));

  return (
    <main
      lang="en"
      className="mx-auto flex max-w-[960px] flex-col gap-10 px-4 py-12 sm:px-6"
    >
      <div className="flex flex-col gap-3">
        <h1 className="m-0 text-3xl font-bold break-words">{site}</h1>
        <MonthNav month={period.month} keep={{ k: key }} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">Variants</h2>
        <p className="m-0 text-[15px]">
          Each screen and button, with the share of warnings.
        </p>
        <EventTable variants={sorted} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-xl font-bold">Fetch these numbers</h2>
        <p className="m-0">
          Same totals as JSON, per variant. Keep this key private, like a
          password.
        </p>
        <pre className="m-0 overflow-x-auto border-y border-line py-2 font-sans text-sm">
          {`curl -H "Authorization: Bearer ${key}" \\\n  "${await ownOrigin()}/api/metrics/${site}?month=${period.month}"`}
        </pre>
      </section>
    </main>
  );
}
