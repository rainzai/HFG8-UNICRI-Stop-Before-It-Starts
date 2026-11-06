# Architecture

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
| 1 | Interruption | Short legal and harm message, then one question: mistake / worried / consequences. Must work on its own, since most people leave here. |
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
  content/NL/{nl,pack}.json          Dutch copy + shared facts (helpline, hours, law)

  not built yet:
  app/go/[service]/route.ts          count a help click, then redirect
  app/setup/page.tsx                 install instructions (no form)
  app/stats/[site]/page.tsx          aggregate stats
  proxy.ts                           count real step visits (Next 16 name for middleware)
  lib/counter.ts                     (site, event, day) → count
```

Copy lives in country packs, keyed by country **and** language (`nl.json` is the reference shape; other languages must match it): English for the Netherlands carries Dutch law and Dutch helplines, which differs from English for Belgium. Adding a country means adding a folder. Packs are validated at build time, so a missing translation fails the build instead of rendering blank.

Facts (phone numbers, legal articles, confidentiality) come from `data/*.json`. Where the data is silent, we use the helpline's own site: opening hours, staff professional secrecy, and the one reporting exception (agreed with the organiser, since `data/legal-confidentiality.json` says there is none). Anything not verified gets a `[VERIFY]` marker, never a guess.

## Privacy rules

These are the product, not an afterthought.

- **Aggregate at ingest.** The counter stores `(site, event, day) → count` and nothing else: no IP, no timestamp finer than a day, no session ID, no cookies. Individual visits never exist in storage.
- **No analytics tools on the visitor flow.** No PostHog, Plausible, Google Analytics or similar: they all store individual events. They are fine on the moderator and public pages.
- **`<Link prefetch={false}>` between steps (via `FlowLink`).** Prefetching would request later steps in the background and inflate the counts. External links stay plain `<a>`.
- **Count in `proxy.ts`, per real step request.**
- **Phone links stay direct** (`tel:`), counted with a small `sendBeacon`. Apart from navigation and the copy button on screen 4, the only client JS in the flow.
- **The saved link is identical for everyone** (`/i/nl`). A per-person code would be a tracking token.
- **Suppress counts below 10** when reading stats.
- **Access logs off** in our code. The host may still log requests, so we say "our code stores nothing", not "nobody ever sees an IP".

## Running it

The mock forum loads `mock-platform/redirect.js` instead of the starter widget: on an `sbis:trigger` it replaces the page with `/w/<forum host>?l=<lang>`. In dev, `localhost:<port>` counts as a valid forum so "back to the forum" works locally.

```bash
nix develop
cd web && pnpm dev -p 3100     # the starter's mock platform uses port 3000
pnpm format && pnpm lint && pnpm typecheck

# mock forum (repo root), redirects test-trigger-* searches to :3100
npx vite --config vite.config.js --port 3005
```

Run `npm run check` at the repo root before pushing.
