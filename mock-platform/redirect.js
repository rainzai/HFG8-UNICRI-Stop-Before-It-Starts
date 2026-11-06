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
  // replace, so the search url with the term is not left in history
  window.location.replace(`${HELP_BASE}/w/${site}?l=${LANG}`);
});
