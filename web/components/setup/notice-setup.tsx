"use client";

import { useState } from "react";

import { Code } from "@/components/setup/code";

// the optional notice (popup or box): pick the button colour, get the code, preview it
export function NoticeSetup({
  origin,
  domain,
}: {
  origin: string;
  domain: string;
}) {
  const [color, setColor] = useState("#2d5a27");
  const valid = /^#[0-9a-f]{6}$/i.test(color);
  const src = `${origin}/notice.js`;
  const tag = (kind: string) =>
    `<script src="${src}" data-site="${domain}" data-show="${kind}" data-color="${color}" defer></script>`;

  // loads the real script on this page, as a forum would
  function preview(kind: "popup" | "box") {
    document
      .querySelectorAll(".sbis-box, dialog.sbis-dialog")
      .forEach((el) => el.remove());
    const script = document.createElement("script");
    script.src = src;
    Object.assign(script.dataset, {
      site: domain,
      show: kind,
      color,
      preview: "1",
    });
    document.head.append(script);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="notice-color" className="text-[15px]">
            Button colour
          </label>
          <div className="flex items-center gap-3 border-b-2 border-line pb-1 focus-within:border-ink">
            {/* the round swatch opens the browser's own colour picker */}
            <span
              className="relative size-6 shrink-0 rounded-full"
              style={{ background: valid ? color : "transparent" }}
            >
              <input
                type="color"
                aria-label="Pick a colour"
                value={valid ? color : "#2d5a27"}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </span>
            <input
              id="notice-color"
              value={color}
              onChange={(e) => setColor(e.target.value.trim())}
              spellCheck={false}
              className="w-28 bg-transparent py-1 font-mono text-[15px] focus-visible:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(["popup", "box"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => preview(kind)}
              disabled={!valid}
              className="cursor-pointer rounded-lg border-[1.5px] border-edge px-3 py-1.5 text-[15px] hover:bg-tint-hover disabled:cursor-default disabled:opacity-50"
            >
              Preview {kind}
            </button>
          ))}
        </div>
      </div>
      {/* the preview box lands here, like a forum's own spot */}
      <div data-sbis-notice />
      <p className="m-0">
        Add this to the results page when a search matches that lighter level.
        Use <code>data-show=&quot;box&quot;</code> for the box instead of the
        popup.
      </p>
      <Code
        tabs={[
          [
            "PHP",
            `if (is_light_match($query)) {  // your filter's lighter level
  echo '${tag("popup")}';
}`,
          ],
          [
            "Node.js",
            `// in your results template
const notice = isLightMatch(query)  // your filter's lighter level
  ? \`${tag("popup")}\`
  : "";`,
          ],
          [
            "JavaScript",
            `<script>
  // call this when a search matches your filter's lighter level
  function sbisNotice() {
    const s = document.createElement("script");
    s.src = "${src}";
    Object.assign(s.dataset, { site: "${domain}", show: "popup", color: "${color}" });
    document.head.append(s);
  }
</script>`,
          ],
        ]}
      />
    </>
  );
}
