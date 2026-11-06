# Architecture

## The idea

Warnings already work at stopping a search. Where they fail is the next step: roughly 1 in 100 people who see a warning click through to help, and far fewer actually contact anyone. Everyone else is improving the warning. We shrink the jump from warning to help.

A platform does not install a widget. Its existing word filter redirects a matching search to our hosted page. That page is not a warning with a link at the bottom. It is the first small step of help itself, so that contacting a helpline feels like a small next step instead of a leap.

## How a platform plugs in

```
Forum (its own word filter)
   │ match → redirect, nothing else
   ▼
<our domain>/w/<siteId>?l=nl        site ID and language only, never the search text
```

- The platform gets one redirect URL from the setup page. That is the whole install.
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
| 3 | Will I be reported? | Honest, country-specific answer about confidentiality, scoped to the helpline. |
| 4 | What to expect | What a call or chat is actually like. |
| 5 | Handover | Preventielijn call/chat, self-help, English option. |
| 6 | Not ready yet | A neutral link to save and come back to later. |

Every screen: a calm exit, an NL/EN toggle, a way back to the forum, and a direct shortcut to step 5 for people who are already ready.

## Code layout

```
web/                              Next.js (app router), pnpm
  app/w/[site]/[step]/page.tsx    flow screens, server components
  app/go/[service]/route.ts       count a help click, then redirect
  app/i/[country]/page.tsx        neutral saved-link landing page
  app/setup/page.tsx              moderator setup
  app/stats/[site]/page.tsx       aggregate stats
  middleware.ts                   count real step visits
  lib/content.ts                  getContent(country, lang)
  lib/counter.ts                  (site, event, day) → count
  content/NL/{nl,en,pack}.json    copy per language + shared legal/help facts
```

Copy lives in country packs, keyed by country **and** language: English for the Netherlands carries Dutch law and Dutch helplines, which differs from English for Belgium. Adding a country means adding a folder. Packs are validated at build time, so a missing translation fails the build instead of rendering blank.

Facts (phone numbers, legal articles, confidentiality) come from `data/*.json`. Anything not verified there gets a `[VERIFY]` marker, never a guess.

## Privacy rules

These are the product, not an afterthought.

- **Aggregate at ingest.** The counter stores `(site, event, day) → count` and nothing else: no IP, no timestamp finer than a day, no session ID, no cookies. Individual visits never exist in storage.
- **No analytics tools on the visitor flow.** No PostHog, Plausible, Google Analytics or similar: they all store individual events. They are fine on the moderator and public pages.
- **`<Link prefetch={false}>` between steps (via `FlowLink`).** Prefetching would request later steps in the background and inflate the counts. External links stay plain `<a>`.
- **Count in middleware, skip prefetch requests.**
- **Phone links stay direct** (`tel:`), counted with a small `sendBeacon`, the only client JS in the flow.
- **The saved link is identical for everyone** (`/i/nl`). A per-person code would be a tracking token.
- **Suppress counts below 10** when reading stats.
- **Access logs off** in our code. The host may still log requests, so we say "our code stores nothing", not "nobody ever sees an IP".

## Running it

```bash
nix develop
cd web && pnpm dev -p 3100     # the starter's mock platform uses port 3000
```

Run `npm run check` at the repo root before pushing.
