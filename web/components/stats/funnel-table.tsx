import { MIN_COUNT } from "@/lib/counter";
import { funnel, hidden, rate, type Totals } from "@/lib/stats";

type Row = { label: string; totals: Totals };

type Props = {
  labelHeader: string;
  rows: Row[];
};

export function FunnelTable({ labelHeader, rows }: Props) {
  if (rows.length === 0)
    return <p className="m-0">Nothing counted in this period.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left tabular-nums">
        <thead>
          <tr className="border-b border-line text-sm">
            <th className="py-2 pr-4 font-normal">{labelHeader}</th>
            <th className="py-2 pl-4 text-right font-normal">Warnings</th>
            <th className="py-2 pl-4 text-right font-normal">Help screen</th>
            <th className="py-2 pl-4 text-right font-normal">Call</th>
            <th className="py-2 pl-4 text-right font-normal">Chat</th>
            <th className="py-2 pl-4 text-right font-normal">Reached help</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, totals }) => {
            const f = funnel(totals);
            return (
              <tr key={label} className="border-b border-line">
                <th className="py-2 pr-4 font-normal">{label}</th>
                <Cell count={f.shown} />
                <Cell count={f.help} />
                <Cell count={f.call} />
                <Cell count={f.chat} />
                <td className="py-2 pl-4 text-right font-bold">
                  {percent(rate(f.reached, f.shown))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ count }: { count: number }) {
  return (
    <td className="py-2 pl-4 text-right">
      {hidden(count) ?? `< ${MIN_COUNT}`}
    </td>
  );
}

function percent(value: number | null) {
  return value === null ? "–" : `${(value * 100).toFixed(1)}%`;
}
