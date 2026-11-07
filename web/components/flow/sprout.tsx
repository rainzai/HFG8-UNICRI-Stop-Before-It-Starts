// variant e, above the heading on screen 1: a small sprout, decorative only
export function Sprout() {
  return (
    <div
      aria-hidden="true"
      className="-mx-2.5 -mb-2 w-[calc(100%+20px)] max-w-[460px] sm:mx-0 sm:w-full"
    >
      <svg
        viewBox="0 0 360 150"
        focusable="false"
        className="block h-auto w-full"
      >
        <ellipse cx="180" cy="140" rx="160" ry="20" fill="#f6e4d4" />
        <path d="M104 140 C134 112 226 112 256 140 Z" fill="#f9e1cf" />
        <path
          d="M180 126 C180 106 176 88 184 62"
          stroke="#5b2c5e"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M183 76 C196 54 224 50 236 56 C226 76 204 86 183 76 Z"
          fill="#5b2c5e"
        />
        <path
          d="M179 98 C164 82 142 80 130 86 C140 102 162 108 179 98 Z"
          fill="#c9a6c4"
        />
        <circle cx="96" cy="132" r="3" fill="#f9e1cf" />
        <circle cx="276" cy="130" r="3" fill="#f9e1cf" />
        <circle cx="300" cy="136" r="2" fill="#f9e1cf" />
      </svg>
    </div>
  );
}
