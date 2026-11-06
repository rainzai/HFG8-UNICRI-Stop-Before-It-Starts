import { Chat } from "@/components/flow/icons";
import type { Copy, Pack } from "@/lib/content";

type Props = {
  copy: Copy;
  pack: Pack;
};

export function ChatButton({ copy, pack }: Props) {
  return (
    <a
      href={pack.helpline.chatUrl}
      className="flex min-h-15 items-center justify-center gap-2.5 rounded-xl border-2 border-brand bg-white px-4 text-lg font-bold whitespace-nowrap text-brand no-underline sm:gap-3 sm:px-5 sm:text-[19px]"
    >
      <Chat />
      {copy.contact.chat}
    </a>
  );
}
