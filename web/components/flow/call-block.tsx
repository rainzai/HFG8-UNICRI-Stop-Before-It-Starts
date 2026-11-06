import { CallButton } from "@/components/flow/call-button";
import { FlowLink } from "@/components/flow/flow-link";
import { fill, type Copy, type Pack } from "@/lib/content";
import { ANONYMOUS_ANCHOR, stepHref } from "@/lib/flow";

type Props = {
  copy: Copy;
  pack: Pack;
  site: string;
  lang: string;
};

export function CallBlock({ copy, pack, site, lang }: Props) {
  const { name, org } = pack.helpline;

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-2">
      <CallButton copy={copy} pack={pack} />
      <p className="m-0 text-center text-[15px] text-muted">
        {fill(copy.call.caption, { helpline: name, org })}
      </p>
      <FlowLink
        href={stepHref(site, "help", lang, ANONYMOUS_ANCHOR)}
        className="inline-flex min-h-11 items-center self-center text-[17px] font-bold underline"
      >
        {copy.call.anonymousLink}
      </FlowLink>
    </div>
  );
}
