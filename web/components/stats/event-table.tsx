import { MIN_COUNT } from "@/lib/counter";
import { EVENTS, funnel, hidden, rate, type Totals } from "@/lib/stats";

type Props = {
  // variant → totals
  variants: [string, Totals][];
  // the saved link has no variant and no warning: own column, no shares
  saved?: Totals;
};

const SAVED_EVENT = "step:saved";

// every screen and button per variant, with the share of warnings
export function EventTable({ variants, saved }: Props) {
  if (variants.length === 0 && !saved)
    return <p className="m-0">Nothing counted in this period.</p>;

  const events = saved
    ? [...EVENTS, { event: SAVED_EVENT, label: "Saved link opened" }]
    : EVENTS;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left tabular-nums">
        <thead>
          <tr className="border-b border-line text-sm">
            <th className="py-2 pr-4 font-normal">Screen or button</th>
            {variants.map(([variant]) => (
              <th
                key={variant}
                colSpan={2}
                className="py-2 pl-4 text-right font-normal"
              >
                Variant {variant}
              </th>
            ))}
            {saved && (
              <th className="py-2 pl-6 text-right font-normal">Saved link</th>
            )}
          </tr>
        </thead>
        <tbody>
          {events.map(({ event, label }) => (
            <tr key={event} className="border-b border-line">
              <th className="py-2 pr-4 font-normal">{label}</th>
              {variants.map(([variant, totals]) => {
                if (event === SAVED_EVENT)
                  return <td key={variant} colSpan={2} />;
                const count = totals[event] ?? 0;
                return (
                  <Cells
                    key={variant}
                    count={count}
                    share={rate(count, totals["step:start"] ?? 0)}
                  />
                );
              })}
              {saved && (
                <td className="py-2 pl-6 text-right">
                  {/* the saved page only shows the help screen */}
                  {event.startsWith("step:") && event !== SAVED_EVENT
                    ? ""
                    : count(saved[event] ?? 0)}
                </td>
              )}
            </tr>
          ))}
          <tr className="border-b border-line font-bold">
            <th className="py-2 pr-4">Reached help (call + chat)</th>
            {variants.map(([variant, totals]) => {
              const { shown, reached } = funnel(totals);
              return (
                <Cells
                  key={variant}
                  count={reached}
                  share={rate(reached, shown)}
                />
              );
            })}
            {saved && (
              <td className="py-2 pl-6 text-right">
                {count(funnel(saved).reached)}
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Cells({ count: n, share }: { count: number; share: number | null }) {
  return (
    <>
      <td className="py-2 pl-4 text-right">{count(n)}</td>
      <td className="py-2 pl-3 text-right">
        {share === null ? "–" : `${(share * 100).toFixed(1)}%`}
      </td>
    </>
  );
}

function count(n: number) {
  return hidden(n) ?? `< ${MIN_COUNT}`;
}
