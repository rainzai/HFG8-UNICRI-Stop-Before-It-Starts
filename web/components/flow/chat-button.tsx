import { BeaconLink } from "@/components/flow/beacon-link";
import { Chat } from "@/components/flow/icons";
import type { Copy, Pack } from "@/lib/content";

type Props = {
  copy: Copy;
  pack: Pack;
  statsSite: string | null;
};

export function ChatButton({ copy, pack, statsSite }: Props) {
  return (
    <BeaconLink
      site={statsSite}
      event="chat"
      href={pack.helpline.chatUrl}
      className="flex min-h-15 items-center justify-center gap-2.5 rounded-xl border-2 border-brand bg-white px-4 text-lg font-bold whitespace-nowrap text-brand no-underline in-data-[variant=b]:justify-start in-data-[variant=b]:gap-3.5 in-data-[variant=b]:rounded-full in-data-[variant=b]:py-1.5 in-data-[variant=b]:pr-5 in-data-[variant=b]:pl-2.5 in-data-[variant=b]:font-extrabold in-data-[variant=b]:hover:bg-[#fbf1f7] sm:gap-3 sm:px-5 sm:text-[19px] sm:in-data-[variant=b]:min-h-[68px]"
    >
      <span className="flex shrink-0 items-center justify-center in-data-[variant=b]:size-11 in-data-[variant=b]:rounded-full in-data-[variant=b]:bg-[#f3e6ef]">
        <Chat />
      </span>
      {copy.contact.chat}
    </BeaconLink>
  );
}
