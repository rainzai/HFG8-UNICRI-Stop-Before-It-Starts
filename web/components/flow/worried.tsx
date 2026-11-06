import { CallBlock } from "@/components/flow/call-block";
import type { Copy, Pack } from "@/lib/content";

type Props = {
  copy: Copy;
  pack: Pack;
  site: string;
  lang: string;
};

export function Worried({ copy, pack, site, lang }: Props) {
  const t = copy.worried;

  return (
    <>
      <h1 className="m-0 text-[clamp(30px,3.4vw,42px)] leading-tight font-bold">
        {t.title}
      </h1>
      <p className="m-0 max-w-[34em] text-[19px] leading-normal">{t.body}</p>
      <p className="m-0 text-[19px] leading-normal">{t.help}</p>
      <div className="mt-1">
        <CallBlock copy={copy} pack={pack} site={site} lang={lang} />
      </div>
    </>
  );
}
