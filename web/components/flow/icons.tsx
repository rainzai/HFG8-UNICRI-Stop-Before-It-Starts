import type { ReactNode } from "react";

function Icon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ChevronLeft() {
  return (
    <Icon size={18}>
      <path d="M15 6l-6 6 6 6" />
    </Icon>
  );
}

export function ChevronRight() {
  return (
    <Icon size={20}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function Lock() {
  return (
    <Icon size={16}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icon>
  );
}

export function Phone() {
  return (
    <Icon size={22}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </Icon>
  );
}

export function Chat() {
  return (
    <Icon size={22}>
      <path d="M4 5h16v11H9l-5 4z" />
    </Icon>
  );
}

export function Check() {
  return (
    <Icon size={22}>
      <path d="M5 12l4 4 10-10" />
    </Icon>
  );
}

export function Copy() {
  return (
    <Icon size={20}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a1 1 0 0 1 1-1h10" />
    </Icon>
  );
}

export function ChevronDown() {
  return (
    <Icon size={18}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}
