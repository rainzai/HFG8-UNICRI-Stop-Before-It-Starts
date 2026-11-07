import { CallButton } from "@/components/flow/call-button";
import { ChatButton } from "@/components/flow/chat-button";
import { FlowLink } from "@/components/flow/flow-link";
import { OpenStatus } from "@/components/flow/open-status";
import { fill, type Copy, type Pack } from "@/lib/content";
import {
  ANONYMOUS_ANCHOR,
  NOT_READY_ANCHOR,
  stepHref,
  type Variant,
} from "@/lib/flow";

type Props = {
  copy: Copy;
  pack: Pack;
  site: string;
  statsSite: string | null;
  lang: string;
  variant: Variant;
};

export function ContactBlock({
  copy,
  pack,
  site,
  statsSite,
  lang,
  variant,
}: Props) {
  const { name, org } = pack.helpline;

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-2">
      <OpenStatus
        copy={copy}
        pack={pack}
        lang={lang}
        className="mb-1 justify-center"
      />
      <CallButton copy={copy} pack={pack} statsSite={statsSite} />
      <ChatButton copy={copy} pack={pack} statsSite={statsSite} />
      <p className="m-0 text-center text-[15px] text-muted">
        {fill(copy.contact.caption, { helpline: name, org })}
      </p>
      <FlowLink
        href={stepHref(site, "help", lang, variant, ANONYMOUS_ANCHOR)}
        className="inline-flex min-h-11 items-center self-center text-[17px] font-bold underline"
      >
        {copy.contact.anonymousLink}
      </FlowLink>
      {/* quiet way out for people not ready to call: self-help or save the link */}
      <FlowLink
        href={stepHref(site, "help", lang, variant, NOT_READY_ANCHOR)}
        className="-mt-2 inline-flex min-h-11 items-center self-center text-[15px] text-muted underline"
      >
        {copy.help.notReadyTitle}
      </FlowLink>
    </div>
  );
}
