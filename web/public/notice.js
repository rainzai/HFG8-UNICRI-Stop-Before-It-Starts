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
      .sbis-help{background:var(--sbis-color);color:#fff;border:0;font-weight:600}
      .sbis-continue{background:transparent;color:inherit;border:1px solid color-mix(in srgb,currentColor 30%,transparent)}
      .sbis-box{box-sizing:border-box;width:fit-content;max-width:100%;grid-column:1/-1;margin:0 0 12px;padding:2px 0 2px 10px;
        font-size:.875em;line-height:1.4;border-left:3px solid var(--sbis-color)}
      .sbis-box a{color:var(--sbis-color);font-weight:600}`;
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
    // on the element, not in the shared style: that is only added once
    dialog.style.setProperty("--sbis-color", color);
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

  // green: one line above the results, with a bar in the button colour.
  // fit-content and grid-column, since forums often make <main> a grid,
  // where it would otherwise take a whole cell
  function box() {
    const p = document.createElement("p");
    p.className = "sbis-box";
    p.style.setProperty("--sbis-color", color);
    p.append(`${text.small} `, link("l", text.help));
    const spot = document.querySelector("[data-sbis-notice]");
    if (spot) spot.append(p);
    else (document.querySelector("main") || document.body).prepend(p);
  }

  // each kind on its own: a box already on the page doesn't block a popup.
  // no second box, and no popup while one is open
  function show(kind) {
    if (kind === "popup" && !document.querySelector("dialog.sbis-dialog")) {
      addStyle();
      popup();
    } else if (kind === "box" && !document.querySelector(".sbis-box")) {
      addStyle();
      box();
    }
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
