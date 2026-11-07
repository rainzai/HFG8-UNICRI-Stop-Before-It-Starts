# Architecture

What is done and what is next: [PLAN.md](PLAN.md).

## The idea

Warnings already work at stopping a search. Where they fail is the next step: roughly 1 in 100 people who see a warning click through to help, and far fewer actually contact anyone. Everyone else is improving the warning. We shrink the jump from warning to help.

A platform does not install a widget. Its existing word filter redirects a matching search to our hosted page. That page is not a warning with a link at the bottom. It is the first small step of help itself, so that contacting a helpline feels like a small next step instead of a leap.

## How a platform plugs in

```
Forum (its own word filter)
   │ match → redirect, nothing else
   ▼
<our domain>/w/<forum-domain>?l=nl  forum domain and language only, never the search text
```

- The site ID is the forum's own domain (`/w/forum-x.nl`). No setup and nothing stored on our side: the domain gives the name on screen, the "back to the forum" link and the stats key. Only a valid hostname is accepted, and it is shown on the back button so visitors see where it goes.
- Country and language come only from the URL. We never use IP addresses or the host's geo headers.
- The redirect must never carry the search text, a username or an IP address.
- The platform should set `Referrer-Policy: no-referrer` on the redirect, so its search URL never reaches us.
- The domain must be neutral: it ends up in browser history, so it must not reveal what the page is about.

## The visitor flow

| Step | Screen | Purpose |
|---|---|---|
| 1 | Interruption | One short message (per variant), then one question: mistake / worried / consequences. Must work on its own, since most people leave here. |
| 2a | Mistake | Non-accusatory, back to the forum, soft link to help. |
| 2b | Worried | "You're not alone, this can change, help is anonymous." |
| 2c | Consequences | Article 252 / 254, then the route to help. |
| 3 | Help | Call and chat at the top, then "Will I be reported?" (honest answer, including the one exception), what a call is like, self-help, and the call button again. Reassurance sits next to the call button, not in front of it. |
| 4 | Not ready yet | A neutral link to save and come back to later. |

2b and 2c show the call button directly, so a worried visitor reaches the number in two taps. Screen 1 has a small direct link to screen 3.

Every screen: one calm exit, a way back to the forum, and "Vorige". Dutch only for now; the NL/EN toggle comes back with English.

## Code layout

```
web/                              Next.js (app router), pnpm
  app/w/[site]/[[...step]]/page.tsx  all flow screens, one page
  app/i/[country]/page.tsx           saved link: help screen without forum, same for everyone
  components/flow/                   one component per screen + shell, call button, FlowLink
  lib/flow.ts                        steps, neutral slugs, back links, domain check
  lib/content.ts                     getContent(country, lang), zod validation
  content/NL/{nl,en,pack}.json       copy per language + shared facts (helpline, hours, law)
  content/NL/variants/<id>.json      per-variant copy overrides, every language (base copy = variant a)
  proxy.ts                           the only writer: +1 per step request, and POST /api/count for call/chat beacons
  lib/bandit.ts                      picks the variant for a new visit from the totals
  lib/counter.ts                     (day, site, variant, event) → count in web/.data/counts.json (gitignored)
  app/admin/page.tsx                 internal dashboard, all forums, basic auth in proxy.ts
  app/admin/export/route.ts          combined totals per variant as JSON, for partners
  app/stats/[site]/page.tsx          a forum's own totals, needs its key (?k=)
  app/api/metrics/[site]/route.ts    same as JSON, key in the Authorization header
  app/setup/page.tsx                 domain check → private stats link and key
  lib/stats.ts                       sum per period, funnel, suppression, metrics event
  lib/access.ts                      HMAC codes and keys, admin password check
  lib/verify.ts                      fetch the code from the forum's site (https, public ips only)
  scripts/key.ts, scripts/seed.ts    demo key for a forum, fake counts in the real format

  not built yet:
  install instructions on /setup, bandit shares on the dashboard
```

Copy lives in country packs, keyed by country **and** language (`nl.json` is the reference shape; other languages must match it): English for the Netherlands carries Dutch law and Dutch helplines (saying conversations are in Dutch, see PLAN.md), which differs from English for Belgium. Adding a country means adding a folder. Packs are validated at build time, so a missing translation fails the build instead of rendering blank.

Facts (phone numbers, legal articles, confidentiality) come from `data/*.json`. Where the data is silent, we use the helpline's own site: opening hours, staff professional secrecy, and the one reporting exception (agreed with the organiser, since `data/legal-confidentiality.json` says there is none). Anything not verified gets a `[VERIFY]` marker, never a guess.

## Privacy rules

These are the product, not an afterthought.

- **Aggregate at ingest.** The counter stores `(day, site, variant, event) → count` and nothing else: no IP, no timestamp finer than a day, no session ID, no cookies. Individual visits never exist in storage.
- **No analytics tools on the visitor flow.** No PostHog, Plausible, Google Analytics or similar: they all store individual events. They are fine on the moderator and public pages.
- **`<Link prefetch={false}>` between steps (via `FlowLink`).** Prefetching would request later steps in the background and inflate the counts. External links stay plain `<a>`.
- **Count in `proxy.ts`, per real step request.** Verified: a load and each in-app click count exactly once. Only valid forum domains and known events are counted, so nobody can fill the file with made-up keys.
- **Phone links stay direct** (`tel:`), counted with a small `sendBeacon`. Apart from navigation, the copy button on screen 4 and the leave button (`location.replace`, so Back does not return to the page), the only client JS in the flow.
- **The saved link is identical for everyone** (`/i/nl`). A per-person code would be a tracking token.
- **Suppress counts below 10** when reading stats.
- **Access logs off** in our code. The host may still log requests, so we say "our code stores nothing", not "nobody ever sees an IP".

## Variants

Three versions of the page, each a whole direction (text, layout, style), starting from the strongest themes in Ciardha, Nurmi et al. (2026). We look for what works, not why, so a variant may change anything. See PLAN.md under Research.

- `a` harm: the original page.
- `b` help first: "help is easy" text, call and chat on screen 1 with the options below, warm style (purple, Nunito) on every screen.
- `c` clear and serious: legality text in bold, then a dark full-width band "Er is een uitweg." with call and chat, then the options as a numbered list. Black on white, Public Sans, square corners on every screen.

- The variant is in the URL (`?v=b`), never in a cookie. A request to `/w/...` without a valid `v` (the forum's redirect) gets a 307 to the same URL with one picked by the bandit; only that next request is counted.
- **Bandit** (`lib/bandit.ts`): per variant it sums, over the last 30 days and all forums, how often screen 1 was shown (`step:start`) and how often call or chat was clicked. Thompson sampling: draw a plausible help rate per variant from those totals and take the highest. Little data means wide draws and much variety; clear differences send most visits to the best one. 10% of visits are picked evenly, so no variant is starved. Counts are re-read at most once a minute. It reads only the totals, nothing about a visitor. `currentShares()` gives the current split for the dashboard.
- `stepHref` carries `v` through every link, and the call and chat beacon sends it along.
- Copy overrides live in `content/<CC>/variants/<id>.json`, validated against the base shape (only existing keys, every language).
- Style per variant: `[data-variant="b"]` in `globals.css` overrides the colour and font tokens, so every screen follows. Layout per variant: small checks like `helpFirst(variant)` and `clearAndSerious(variant)` in `lib/flow.ts`, with their own screen 1 component (`help-first.tsx`, `clear-and-serious.tsx`).

## Counts (what the dashboard reads)

Everything we store is one JSON object in `web/.data/counts.json` (gitignored, created on the first count):

```json
{ "2026-11-06|forum-x.nl|a|step:start": 12, "2026-11-06|forum-x.nl|a|call": 11 }
```

Key = `day|site|variant|event`, value = how many times it happened. Nothing else exists: no IP, no time of day, no visitor or session ID.

| Part | Values |
|---|---|
| `day` | `YYYY-MM-DD` (UTC) |
| `site` | the forum domain, `localhost:<port>` in dev, or `saved` for the saved-link page `/i/<country>` |
| `variant` | `a` harm, `b` help first, `c` clear and serious. The saved-link page is always `a` |
| `event` | `step:start`, `step:mistake`, `step:worried`, `step:consequences`, `step:help`, `step:later`, `step:saved`, `call`, `chat`, `website` (helpline site), `selfhelp`, `forum` (back to forum), `exit` (close) |

How it gets counted:

- **Steps:** `web/proxy.ts` adds 1 for every real request to `/w/<site>/<step>` (page load or in-app click, each exactly once; prefetch is off) and to `/i/<country>`. A language switch adds `switch=1` to the URL and is not counted, since it is the same step again.
- **Clicks** (call, chat, helpline site, self-help, back to forum, close): the links send `{ site, variant, event }` with `sendBeacon` to `POST /api/count`, which the proxy also handles. The link itself is not delayed.
- Only valid forum domains and known events are counted, so nobody can fill the file with made-up keys.

For the dashboard:

- **Read only.** Use `readCounts()` and `parseKey()` from `web/lib/counter.ts`. Only the proxy writes, so there is one writer.
- **Suppress counts below 10** (`MIN_COUNT`) in anything shown, also after summing or filtering.
- The useful number is the funnel: `step:start` → `step:help` → `call` + `chat`.
- All stats are private:
  - `/admin`: internal dashboard for us, all forums and the variant comparison. Basic auth in `proxy.ts`, password from `ADMIN_PASSWORD`. `/admin/export` gives combined totals for partners.
  - `/stats/<forum>?k=<key>` and `GET /api/metrics/<forum>` with `Authorization: Bearer <key>`: one forum's own totals per variant, in the contract's metrics event format. A wrong key gives 404, so nobody learns which forums take part.
  - The key is `HMAC(STATS_SECRET, "stats:<domain>")`, the public verification code `HMAC(STATS_SECRET, "verify:<domain>")`. Nothing is stored; both are recomputed per request. A forum gets its key on `/setup` after putting the code in `/.well-known/sbis.txt` or a `<meta name="sbis-verify">` tag.
  - All take `?days=` or `?from=YYYY-MM-DD&to=YYYY-MM-DD` (default 30 days).
- For demo data: `pnpm seed` writes fake counts in this same format for `*.example` forums with variants a and b (restart the dev server afterwards). Do not use `tools/generate-traffic.js` as is: it creates per-session events with a UUID, which is exactly what we do not store.

## Running it

The mock forum loads `mock-platform/redirect.js` instead of the starter widget: on an `sbis:trigger` it replaces the page with `/w/<forum host>?l=<lang>`. In dev, `localhost:<port>` counts as a valid forum so "back to the forum" works locally.

```bash
nix develop
cd web && cp .env.example .env.local   # fill in STATS_SECRET and ADMIN_PASSWORD
pnpm seed                      # optional: fake counts for the dashboard
pnpm key forum-a.example       # private stats link and API key for one forum
pnpm dev -p 3100     # the starter's mock platform uses port 3000
pnpm format && pnpm lint && pnpm typecheck

# mock forum (repo root), redirects test-trigger-* searches to :3100
npx vite --config vite.config.js --port 3005
```

Run `npm run check` at the repo root before pushing.
