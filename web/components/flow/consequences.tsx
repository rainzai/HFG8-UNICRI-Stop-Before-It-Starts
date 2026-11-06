import { ContactBlock } from "@/components/flow/contact-block";
import { fill, type Copy, type Pack } from "@/lib/content";

type Props = {
  copy: Copy;
  pack: Pack;
  forum: string | null;
  site: string;
  lang: string;
};

export function Consequences({ copy, pack, forum, site, lang }: Props) {
  const t = copy.consequences;
  const { law } = pack;

  const articles = new Intl.ListFormat(lang, { type: "conjunction" }).format(
    law.articles.map(String),
  );
  // utc, otherwise the date can shift a day depending on server timezone
  const since = new Intl.DateTimeFormat(lang, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(law.since));

  const penalties = [
    [t.maxLabel, fill(t.maxValue, { years: law.maxYears })],
    [t.habitualLabel, fill(t.habitualValue, { years: law.habitualMaxYears })],
  ];

  return (
    <>
      <h1 className="m-0 text-[clamp(30px,3.4vw,42px)] leading-tight font-bold">
        {t.title}
      </h1>
      <p className="m-0 text-[19px] leading-normal">{t.body}</p>

      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3">
        {penalties.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-xl border border-line bg-white px-5 py-[18px]"
          >
            <dt className="text-[15px] text-muted">{label}</dt>
            <dd className="m-0 text-2xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-[15px] leading-normal text-muted">
        {fill(t.source, { articles, since })}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-xl bg-tint p-4 sm:p-5">
        <p className="m-0 flex-[1_1_240px] text-lg leading-snug font-bold">
          {t.help}
        </p>
        <div className="flex flex-[1_1_260px]">
          <ContactBlock
            copy={copy}
            pack={pack}
            site={site}
            statsSite={forum}
            lang={lang}
          />
        </div>
      </div>
    </>
  );
}
