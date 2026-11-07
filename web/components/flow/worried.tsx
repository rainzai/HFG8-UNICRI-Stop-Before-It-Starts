import { ContactBlock } from "@/components/flow/contact-block";
import type { Copy, Pack } from "@/lib/content";
import type { Variant } from "@/lib/flow";

type Props = {
  copy: Copy;
  pack: Pack;
  forum: string | null;
  site: string;
  lang: string;
  variant: Variant;
};

export function Worried({ copy, pack, forum, site, lang, variant }: Props) {
  const t = copy.worried;

  return (
    <>
      <h1 className="m-0 text-[clamp(30px,3.4vw,42px)] leading-tight font-bold">
        {t.title}
      </h1>
      <p className="m-0 max-w-[34em] text-[19px] leading-normal">{t.body}</p>
      <p className="m-0 text-[19px] leading-normal">{t.help}</p>
      <div className="mt-1 flex justify-center">
        <ContactBlock
          copy={copy}
          pack={pack}
          site={site}
          statsSite={forum}
          lang={lang}
          variant={variant}
        />
      </div>
    </>
  );
}
