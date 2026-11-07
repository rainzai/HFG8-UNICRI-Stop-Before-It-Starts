import { MIN_COUNT } from "@/lib/counter";
import { finishedMonths, type Period } from "@/lib/stats";

const CHOICES = [7, 30, 90];

type Props = {
  period: Period;
  // other query params to keep, e.g. the forum key
  keep?: Record<string, string>;
};

export function PeriodNav({ period, keep = {} }: Props) {
  return (
    <div className="flex flex-col gap-1 text-[15px]">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span>
          {period.from} – {period.to} (UTC)
        </span>
        {CHOICES.map((days) => (
          <a
            key={days}
            className="text-ink underline hover:text-black"
            href={`?${new URLSearchParams({ ...keep, days: String(days) })}`}
          >
            {days} days
          </a>
        ))}
      </div>
      <span>
        Counts below {MIN_COUNT} are hidden, also after adding up. Rates only
        when both numbers are {MIN_COUNT} or more.
      </span>
    </div>
  );
}

// forums: one finished month at a time, see monthOf in lib/stats.ts
export function MonthNav({
  month,
  keep = {},
}: {
  month: string;
  keep?: Record<string, string>;
}) {
  const months = finishedMonths();
  const i = months.indexOf(month);
  const link = (m: string) => `?${new URLSearchParams({ ...keep, month: m })}`;
  return (
    <div className="flex flex-col gap-1 text-[15px]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {i < months.length - 1 && (
          <a
            className="text-ink underline hover:text-black"
            href={link(months[i + 1])}
          >
            ‹ {months[i + 1]}
          </a>
        )}
        <span className="font-bold">{month} (UTC)</span>
        {i > 0 && (
          <a
            className="text-ink underline hover:text-black"
            href={link(months[i - 1])}
          >
            {months[i - 1]} ›
          </a>
        )}
      </div>
      <span>
        Whole months only, once they are over. Counts below {MIN_COUNT} are
        hidden, also after adding up. Rates only when both numbers are{" "}
        {MIN_COUNT} or more.
      </span>
    </div>
  );
}
