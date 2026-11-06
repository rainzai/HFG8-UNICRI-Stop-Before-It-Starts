import { CopyLink } from "@/components/flow/copy-link";
import type { Copy, Pack } from "@/lib/content";
import { savedLinkPath } from "@/lib/flow";

type Props = {
  copy: Copy;
  pack: Pack;
};

export function Later({ copy, pack }: Props) {
  const t = copy.later;

  return (
    <>
      <h1 className="m-0 text-[clamp(30px,3.4vw,42px)] leading-tight font-bold">
        {t.title}
      </h1>
      <p className="m-0 max-w-[34em] text-lg leading-normal">{t.body}</p>
      <CopyLink
        path={savedLinkPath(pack.country)}
        label={t.copy}
        copiedLabel={t.copied}
      />
      <p className="m-0 text-[15px] leading-snug text-muted">{t.note}</p>
    </>
  );
}
