/**
 * Our module: on a trigger, send the visitor to the hosted help page.
 *
 * This is the whole integration. Only the forum's own domain and a
 * language go along, never the search text, a username or an IP.
 */

// where the hosted page runs, web/ dev server by default
const HELP_BASE = window.SBIS_HELP_BASE || 'http://localhost:3100';

document.body.addEventListener('sbis:trigger', (e) => {
  const site = encodeURIComponent(window.location.host);
  const lang = e.detail?.language || 'nl';
  // replace, so the search url with the term is not left in history
  window.location.replace(`${HELP_BASE}/w/${site}?l=${lang}`);
});
