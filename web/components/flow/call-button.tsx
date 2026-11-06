import { Phone } from "@/components/flow/icons";
import { fill, type Copy, type Pack } from "@/lib/content";

type Props = {
  copy: Copy;
  pack: Pack;
  className?: string;
};

export function CallButton({ copy, pack, className = "" }: Props) {
  const { phone } = pack.helpline;

  return (
    // TODO: count call clicks
    <a
      href={`tel:${phone.replaceAll(" ", "")}`}
      className={`flex min-h-15 items-center justify-center gap-2.5 rounded-xl bg-brand px-4 text-lg font-bold whitespace-nowrap text-white no-underline hover:bg-brand-dark hover:text-white sm:gap-3 sm:px-5 sm:text-[19px] ${className}`}
    >
      <Phone />
      {fill(copy.contact.call, { phone })}
    </a>
  );
}
