import { FlowLink } from "@/components/flow/flow-link";
import { Phone } from "@/components/flow/icons";
import { fill, type Copy, type Pack } from "@/lib/content";
import { stepHref } from "@/lib/flow";

type Props = {
  copy: Copy;
  pack: Pack;
  site: string;
  lang: string;
};

export function CallBlock({ copy, pack, site, lang }: Props) {
  const { name, org, phone } = pack.helpline;

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-2">
      {/* TODO: count call clicks */}
      <a
        href={`tel:${phone.replaceAll(" ", "")}`}
        className="flex min-h-15 items-center justify-center gap-3 rounded-xl bg-brand px-5 text-[19px] font-bold text-white no-underline hover:bg-brand-dark hover:text-white"
      >
        <Phone />
        {fill(copy.call.button, { phone })}
      </a>
      <p className="m-0 text-center text-[15px] text-muted">
        {fill(copy.call.caption, { helpline: name, org })}
      </p>
      <FlowLink
        href={stepHref(site, "help", lang)}
        className="inline-flex min-h-11 items-center self-center text-[17px] font-bold underline"
      >
        {copy.call.anonymousLink}
      </FlowLink>
    </div>
  );
}
