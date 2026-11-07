import type { ReactNode } from "react";

// variant d, top of screen 1: the message in a dark cell, faint bars behind it

type Props = {
  title: ReactNode;
  body: string;
};

export function BehindBars({ title, body }: Props) {
  return (
    // full width, out of main's column like the band below it
    <div className="relative mx-[calc(50%-50vw)] -mt-12 overflow-hidden bg-[#0e1013] text-white">
      {/* behind the text: in front, the bars cut through the letters */}
      <div aria-hidden="true" className="bars" />
      <div className="relative mx-auto flex max-w-[720px] flex-col gap-[18px] px-6 py-16 sm:gap-[22px] sm:py-24">
        <h1 className="m-0 text-[clamp(36px,5vw,56px)] leading-[1.08] font-extrabold tracking-[-0.015em]">
          {title}
        </h1>
        <p className="m-0 max-w-[30em] text-[clamp(24px,2.6vw,32px)] leading-snug font-extrabold">
          {body}
        </p>
      </div>
    </div>
  );
}
