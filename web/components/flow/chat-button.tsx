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
      className="flex min-h-15 items-center justify-center gap-2.5 rounded-xl border-2 border-brand bg-white px-4 text-lg font-bold whitespace-nowrap text-brand no-underline in-data-[theme=b]:justify-start in-data-[theme=b]:gap-3.5 in-data-[theme=b]:rounded-full in-data-[theme=b]:py-1.5 in-data-[theme=b]:pr-5 in-data-[theme=b]:pl-2.5 in-data-[theme=b]:font-extrabold in-data-[theme=b]:hover:bg-[#fbf1f7] sm:gap-3 sm:px-5 sm:text-[19px] sm:in-data-[theme=b]:min-h-[68px]"
    >
      <span className="flex shrink-0 items-center justify-center in-data-[theme=b]:size-11 in-data-[theme=b]:rounded-full in-data-[theme=b]:bg-[#f3e6ef]">
        <Chat />
      </span>
      {copy.contact.chat}
    </BeaconLink>
  );
}
