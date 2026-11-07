import { BeaconLink } from "@/components/flow/beacon-link";
import { Phone } from "@/components/flow/icons";
import { fill, type Copy, type Pack } from "@/lib/content";

type Props = {
  copy: Copy;
  pack: Pack;
  statsSite: string | null;
  className?: string;
};

export function CallButton({ copy, pack, statsSite, className = "" }: Props) {
  const { phone } = pack.helpline;

  return (
    <BeaconLink
      site={statsSite}
      event="call"
      href={`tel:${phone.replaceAll(" ", "")}`}
      className={`flex min-h-15 items-center justify-center gap-2.5 rounded-xl bg-brand px-4 text-lg font-bold whitespace-nowrap text-white no-underline hover:bg-brand-dark hover:text-white in-data-[theme=b]:min-h-[68px] in-data-[theme=b]:justify-start in-data-[theme=b]:gap-3.5 in-data-[theme=b]:rounded-full in-data-[theme=b]:py-2 in-data-[theme=b]:pr-5 in-data-[theme=b]:pl-2.5 in-data-[theme=b]:text-xl in-data-[theme=b]:font-extrabold sm:gap-3 sm:px-5 sm:text-[19px] ${className}`}
    >
      {/* variant b: icon in a white bubble */}
      <span className="flex shrink-0 items-center justify-center in-data-[theme=b]:size-12 in-data-[theme=b]:rounded-full in-data-[theme=b]:bg-white in-data-[theme=b]:text-brand">
        <Phone />
      </span>
      {fill(copy.contact.call, { phone })}
    </BeaconLink>
  );
}
