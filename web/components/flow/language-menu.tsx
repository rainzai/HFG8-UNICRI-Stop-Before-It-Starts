import { ChevronDown } from "@/components/flow/icons";
import { LanguageLink } from "@/components/flow/language-link";

export type LanguageOption = { code: string; href: string };

type Props = {
  label: string;
  current: string;
  options: LanguageOption[];
};

// each language in its own name, so people find theirs
function nativeName(code: string) {
  const name = new Intl.DisplayNames([code], { type: "language" }).of(code);
  return name ? name[0].toUpperCase() + name.slice(1) : code;
}

export function LanguageMenu({ label, current, options }: Props) {
  if (options.length < 2) return null;

  return (
    <details className="relative">
      <summary
        aria-label={label}
        className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-[10px] px-3 text-[15px] font-bold [&::-webkit-details-marker]:hidden"
      >
        {nativeName(current)}
        <ChevronDown />
      </summary>
      <ul className="absolute right-0 z-10 m-0 mt-1 flex min-w-40 list-none flex-col rounded-xl border border-line bg-white p-1.5 shadow-lg">
        {options.map(({ code, href }) => (
          <li key={code}>
            <LanguageLink
              href={href}
              lang={code}
              aria-current={code === current ? "true" : undefined}
              className="flex min-h-11 items-center rounded-lg px-3 text-base text-ink no-underline hover:bg-tint-hover hover:text-ink aria-[current]:font-bold"
            >
              {nativeName(code)}
            </LanguageLink>
          </li>
        ))}
      </ul>
    </details>
  );
}
