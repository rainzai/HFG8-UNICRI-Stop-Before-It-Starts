/**
 * Our module: on a trigger, send the visitor to the hosted help page.
 *
 * This is the whole integration. Only the forum's own domain and a
 * language go along, never the search text, a username or an IP.
 */

// where the hosted page runs, web/ dev server by default
const HELP_BASE = window.SBIS_HELP_BASE || 'http://localhost:3100';

// the forum's own language, not the visitor's browser
const LANG = 'nl';

document.body.addEventListener('sbis:trigger', () => {
  const site = encodeURIComponent(window.location.host);
  const target = `${HELP_BASE}/w/${site}?l=${LANG}`;
  // a results page has the term in its url: replace it, so Back does not reopen it
  // (it stays in the browser's history list, no page can remove that).
  // otherwise (typed on any forum page) a normal step, so Back returns to the forum
  if (window.location.search) window.location.replace(target);
  else window.location.assign(target);
});
