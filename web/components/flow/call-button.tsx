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
      className={`flex min-h-15 items-center justify-center gap-2.5 rounded-xl bg-brand px-4 text-lg font-bold whitespace-nowrap text-white no-underline hover:bg-brand-dark hover:text-white in-data-[variant=b]:min-h-[68px] in-data-[variant=b]:justify-start in-data-[variant=b]:gap-3.5 in-data-[variant=b]:rounded-full in-data-[variant=b]:py-2 in-data-[variant=b]:pr-5 in-data-[variant=b]:pl-2.5 in-data-[variant=b]:text-xl in-data-[variant=b]:font-extrabold sm:gap-3 sm:px-5 sm:text-[19px] ${className}`}
    >
      {/* variant b: icon in a white bubble */}
      <span className="flex shrink-0 items-center justify-center in-data-[variant=b]:size-12 in-data-[variant=b]:rounded-full in-data-[variant=b]:bg-white in-data-[variant=b]:text-brand">
        <Phone />
      </span>
      {fill(copy.contact.call, { phone })}
    </BeaconLink>
  );
}
