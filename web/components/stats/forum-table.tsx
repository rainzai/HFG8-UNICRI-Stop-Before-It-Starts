import { MIN_COUNT } from "@/lib/counter";
import { funnel, hidden, rate, type Totals } from "@/lib/stats";

type Props = {
  variants: string[];
  // forum → variant → totals
  forums: [string, Map<string, Totals>][];
};

// one row per forum, warnings and reached help side by side per variant
export function ForumTable({ variants, forums }: Props) {
  if (forums.length === 0)
    return <p className="m-0">Nothing counted in this period.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left tabular-nums">
        <thead>
          <tr className="text-sm">
            <th className="pt-2 pr-4 font-normal" />
            {variants.map((variant) => (
              <th
                key={variant}
                colSpan={2}
                className="pt-2 pl-4 text-right font-normal"
              >
                Variant {variant}
              </th>
            ))}
          </tr>
          <tr className="border-b border-line text-sm">
            <th className="py-2 pr-4 font-normal">Forum</th>
            {variants.map((variant) => [
              <th
                key={`${variant}-n`}
                className="py-2 pl-4 text-right font-normal"
              >
                Warnings
              </th>,
              <th
                key={`${variant}-p`}
                className="py-2 pl-3 text-right font-normal"
              >
                Reached help
              </th>,
            ])}
          </tr>
        </thead>
        <tbody>
          {forums.map(([site, perVariant]) => (
            <tr key={site} className="border-b border-line">
              <th className="py-2 pr-4 font-normal break-all">{site}</th>
              {variants.map((variant) => {
                const { shown, reached } = funnel(
                  perVariant.get(variant) ?? {},
                );
                const share = rate(reached, shown);
                return [
                  <td key={`${variant}-n`} className="py-2 pl-4 text-right">
                    {hidden(shown) ?? `< ${MIN_COUNT}`}
                  </td>,
                  <td
                    key={`${variant}-p`}
                    className="py-2 pl-3 text-right font-bold"
                  >
                    {share === null ? "–" : `${(share * 100).toFixed(1)}%`}
                  </td>,
                ];
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
