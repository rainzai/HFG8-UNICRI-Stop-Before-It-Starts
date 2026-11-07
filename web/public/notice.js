// optional extra for forums, next to the redirect.
// data-show="popup" → a popup over the results, "box" → a box above them.
// the forum only adds the tag on a results page its filter marked amber or green.
// it also listens for sbis:trigger events (medium = amber, low = green), for
// forums that fire those; high is the forum's redirect, nothing to do here.
// no own font or text colour: it takes the forum's. nothing is sent until a
// visitor clicks the help link, and then only the forum's domain and language.
//
// <script src="https://<our domain>/notice.js" data-site="forum.example.nl"
//   data-show="popup" data-lang="nl" data-color="#2d5a27" defer></script>
(() => {
  const script = document.currentScript;
  if (!script) return;
  const base = new URL(script.src).origin;
  const site = script.dataset.site || location.host;
  const lang = script.dataset.lang === "en" ? "en" : "nl";
  const color = script.dataset.color || "#2b2f33";
  // the preview on /setup: the link works but is not counted (r=1)
  const preview = script.dataset.preview === "1";

  const text = {
    nl: {
      title: "Even stilstaan",
      body: "Sommige zoekopdrachten zoals deze gaan over seksueel misbruik van kinderen. Maak je je zorgen over wat je zoekt of bekijkt? Er is anonieme hulp.",
      help: "Anonieme hulp",
      continue: "Doorgaan naar resultaten",
      small: "Zorgen over je gedachten of wat je bekijkt?",
    },
    en: {
      title: "Take a moment",
      body: "Some searches like this one are about child sexual abuse. Worried about what you are searching for or watching? Anonymous help is available.",
      help: "Anonymous help",
      continue: "Continue to results",
      small: "Worried about your thoughts or what you watch?",
    },
  }[lang];

  // s=m / s=l: counted apart from the forum's redirects
  const helpUrl = (level) =>
    `${base}/w/${encodeURIComponent(site)}?l=${lang}&s=${level}${preview ? "&r=1" : ""}`;

  // forums often reset margins, which would undo the dialog's own centring
  function addStyle() {
    if (document.getElementById("sbis-style")) return;
    const style = document.createElement("style");
    style.id = "sbis-style";
    style.textContent = `
      .sbis-dialog{position:fixed;inset:0;margin:auto;height:fit-content;box-sizing:border-box;width:min(440px,calc(100vw - 32px));max-width:none;border:1px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:12px;padding:24px;
        font:inherit;line-height:1.5;box-shadow:0 12px 40px rgb(0 0 0/.25)}
      .sbis-dialog::backdrop{background:rgb(0 0 0/.35)}
      .sbis-dialog h2{margin:0 0 8px;font-size:1.15em;outline:none}
      .sbis-dialog p{margin:0 0 20px}
      .sbis-actions{display:flex;flex-wrap:wrap;gap:10px}
      .sbis-actions a,.sbis-actions button{font:inherit;padding:10px 16px;border-radius:8px;cursor:pointer;text-decoration:none}
      .sbis-help{background:${color};color:#fff;border:0;font-weight:600}
      .sbis-continue{background:transparent;color:inherit;border:1px solid color-mix(in srgb,currentColor 30%,transparent)}
      .sbis-box{margin:0 0 16px;padding:12px 16px;border-radius:8px;line-height:1.5;
        border:1px solid color-mix(in srgb,currentColor 18%,transparent);background:color-mix(in srgb,currentColor 5%,transparent)}`;
    document.head.append(style);
  }

  function link(level, label, className) {
    const a = document.createElement("a");
    a.href = helpUrl(level);
    a.textContent = label;
    a.rel = "noreferrer";
    if (className) a.className = className;
    return a;
  }

  // amber: a modal dialog, so focus, Esc and the backdrop work as expected
  function popup() {
    const dialog = document.createElement("dialog");
    dialog.className = "sbis-dialog";
    dialog.setAttribute("aria-labelledby", "sbis-title");
    // the forum's own background and text colour, so it fits dark themes too
    const page = getComputedStyle(document.body);
    const root = getComputedStyle(document.documentElement);
    const clear = (c) => c === "transparent" || c === "rgba(0, 0, 0, 0)";
    const bg = !clear(page.backgroundColor)
      ? page.backgroundColor
      : !clear(root.backgroundColor)
        ? root.backgroundColor
        : "#fff";
    dialog.style.background = bg;
    dialog.style.color = page.color;
    const h2 = document.createElement("h2");
    h2.id = "sbis-title";
    h2.textContent = text.title;
    // focus the heading on open, not the help button (it looked pressed)
    h2.tabIndex = -1;
    h2.autofocus = true;
    const p = document.createElement("p");
    p.textContent = text.body;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "sbis-continue";
    close.textContent = text.continue;
    close.addEventListener("click", () => dialog.close());
    const actions = document.createElement("div");
    actions.className = "sbis-actions";
    actions.append(link("m", text.help, "sbis-help"), close);
    dialog.append(h2, p, actions);
    // a click on the backdrop closes it too
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => dialog.remove());
    document.body.append(dialog);
    dialog.showModal();
  }

  // green: a quiet box above the results
  function box() {
    const p = document.createElement("p");
    p.className = "sbis-box";
    p.append(`${text.small} `, link("l", text.help));
    const spot = document.querySelector("[data-sbis-notice]");
    if (spot) spot.append(p);
    else (document.querySelector("main") || document.body).prepend(p);
  }

  let shown = false;
  function show(kind) {
    if (shown || (kind !== "popup" && kind !== "box")) return;
    shown = true;
    addStyle();
    if (kind === "popup") popup();
    else box();
  }

  const kind = script.dataset.show;
  if (kind) {
    if (document.body) show(kind);
    else document.addEventListener("DOMContentLoaded", () => show(kind));
  }

  document.addEventListener(
    "sbis:trigger",
    (event) => {
      const severity = event.detail && event.detail.severity;
      show({ medium: "popup", low: "box" }[severity]);
    },
    true,
  );
})();
