"use client";

import { useSyncExternalStore } from "react";

import { fill, type Copy, type Pack } from "@/lib/content";

type Props = {
  copy: Copy;
  pack: Pack;
  lang: string;
  // on a dark background (variant c's band)
  onDark?: boolean;
  className?: string;
};

// re-render once a minute, so an open page flips to closed on time
function subscribe(update: () => void) {
  const timer = setInterval(update, 60_000);
  return () => clearInterval(timer);
}
const minute = () => Math.floor(Date.now() / 60_000);

// open or closed by the regular opening hours, in the helpline's time zone.
// holidays and ad-hoc closures are not known here
export function OpenStatus({
  copy,
  pack,
  lang,
  onDark = false,
  className = "justify-center",
}: Props) {
  // null on the server: the time is only known in the browser
  const now = useSyncExternalStore(subscribe, minute, () => null);
  if (now === null) return null;

  const t = copy.contact;
  const status = statusAt(new Date(now * 60_000), pack.helpline);
  const label = status.open
    ? fill(t.openNow, { close: status.close })
    : fill(t.closedNext, {
        day:
          status.inDays === 0
            ? t.today
            : status.inDays === 1
              ? t.tomorrow
              : weekdayName(status.weekday, lang),
        open: status.nextOpen,
      });

  return (
    <p
      className={`m-0 flex items-center gap-2 text-[15px] font-bold ${onDark ? "text-white" : "text-ink"} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`mx-1 inline-flex size-2.5 shrink-0 rounded-full ${status.open ? "animate-breathe bg-[#2e9e5b] motion-reduce:animate-none" : onDark ? "bg-[#9aa0a6]" : "bg-muted"}`}
      />
      {label}
    </p>
  );
}

type Status =
  | { open: true; close: string }
  | { open: false; nextOpen: string; inDays: number; weekday: number };

function statusAt(date: Date, helpline: Pack["helpline"]): Status {
  const { weekday, time } = localNow(date, helpline.timeZone);
  const hoursOn = (day: number) =>
    helpline.hours.find(
      ({ days: [first, last] }) => day >= first && day <= last,
    );

  const today = hoursOn(weekday);
  if (today && time >= today.open && time < today.close)
    return { open: true, close: today.close };

  // later today, or the first day after with hours
  for (let inDays = 0; inDays < 8; inDays++) {
    const day = ((weekday - 1 + inDays) % 7) + 1;
    const hours = hoursOn(day);
    if (!hours || (inDays === 0 && time >= hours.open)) continue;
    return { open: false, nextOpen: hours.open, inDays, weekday: day };
  }
  return { open: false, nextOpen: "", inDays: 0, weekday };
}

// weekday (1 = monday) and "HH:MM" in the given time zone
function localNow(date: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const weekday =
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday) +
    1;
  return { weekday, time: `${parts.hour}:${parts.minute}` };
}

function weekdayName(day: number, lang: string) {
  // 2024-01-01 was a monday
  const date = new Date(Date.UTC(2024, 0, day));
  return new Intl.DateTimeFormat(lang, {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
}
