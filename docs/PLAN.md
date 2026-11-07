# Plan

Where we are and what is next. How it works lives in [ARCHITECTURE.md](ARCHITECTURE.md).

## Done (6 Nov)

- Full visitor flow in Dutch and English: start, mistake, worried, consequences, help, later, plus the saved-link page `/i/nl`.
- Call and chat on worried, consequences and help. Chat links straight to the Preventielijn chat.
- Help screen: opening hours, "Is it anonymous? Yes", "Will I be reported? No" with the one exception, what a call is like.
- Mock forum hooked up: `mock-platform/redirect.js` listens for `sbis:trigger` and redirects with only the forum host and language.
- Language dropdown (language names, not flags). Country packs per folder (`content/NL/`).

## Open questions

- **Domain.** Name is SBIS (7 Nov). The domain must be just as neutral, it ends up in browser history.
- **Does the Preventielijn help in English?** Mentor says no, the StepToSupport directory says Dutch and English (old name, undated). Ask Offlimits; the answer decides step 5.

## Decided

- **English for NL links to the Preventielijn, saying conversations are in Dutch** (7 Nov). No verified English alternative: the Dutch self-help module is Dutch only, the ReDirection link in `data/` is a research page, not the programme, and the Offlimits Hulplijn (English) is for people affected by online abuse, not for our visitors. Helplinks.eu is not linked: it is compiled by police services, which clashes with "you will not be reported". In the pitch this is a known gap.

## Next, in order

1. **Research: what gets people to help.** Go through `research/EVIDENCE.md` and the studies in `BRIEF.md` (Prichard 2024 deterrent vs therapeutic, Ciardha 2026 harm-focused, reThink chatbot, Google redesign, ReDirection, Prevent It). Output: a short list of techniques we can turn into testable variants. Ciardha 2026 done (7 Nov), see Research below; the others still open.
2. **Counter with variants.** Counter done (6 Nov): proxy counts steps, call/chat via beacon, bare `/stats/<forum>`. Variants (7 Nov): a harm (original), b help first (built), c clear and serious (built), picked evenly at random, see ARCHITECTURE.md. Still to do from the setup below: pack overrides, flags, step lists. `(forum, variant, step, day) → count`, nothing else. Count in `proxy.ts` per real step request, call and chat clicks via `sendBeacon`. Variant assigned at random per visit, carried in the URL (`?v=b`), no cookie.
   Variants are more than restyles: wording, buttons, links to other services, even flow. Setup:
   - `content/<CC>/variants/<id>.json`: partial overrides of copy (per language) and pack (e.g. a different self-help service, verified only), deep-merged in `getContent(country, lang, variant)`; zod rejects keys that do not exist in the base.
   - Optional flags per variant that components read (e.g. `contactOrder: ["chat", "call"]`), and an optional own component per screen for bigger changes.
   - Optional step list per variant in `lib/flow.ts` (e.g. call button on screen 1).
   - `?v=` added once in `stepHref`, so it carries through every link.
3. **Stats and metrics** (Ron: analytics dashboard; data format and rules in ARCHITECTURE.md under "Counts"). The redirect stays the whole install; stats are fetched separately, never in the visitor's request.
   Done (7 Nov): `/admin` behind basic auth with export, `/stats/<forum>?k=`, `GET /api/metrics/<forum>` with the key, `/setup` domain check, `pnpm seed` and `pnpm key` for the demo. Still open: the optional `sbis:result` event, and a key version to revoke one forum's key without changing all.
   - **Private by default.** Nothing is public. Counts below 10 suppressed everywhere.
   - **Internal dashboard for us (the provider):** all forums, behind a login (password from an environment variable, never in the code). Includes an export of combined totals for partners like UNICRI or Offlimits, only when we choose to share.
   - **Own numbers, optional and self-service:** on the instructions page a forum enters its domain and gets a verification code, puts it in a `<meta>` tag or file on its own site, clicks check; we fetch it and show its private stats link. Same idea as Google Search Console.
   - **No storage, secret never leaves the server:** verification code = `HMAC(secret, "verify:<domain>")` (public, only proves control of the site), stats key = `HMAC(secret, "stats:<domain>")` (private, shown after a successful check). Different prefixes, so the key cannot be derived from the code. Both are recomputed on every request.
   - `GET /api/metrics/<forum>` with that key returns the contract's metrics event format: the "payload back to the forum" from `contract/PLUGIN_CONTRACT.md`. Optionally `redirect.js` fires one `sbis:result` (`shown: true`) before redirecting.
   - For the demo: the internal dashboard, plus a hand-made private forum link if there is time.
4. **Feedback loop.** Bandit done (7 Nov): new visits get a variant by Thompson sampling on call/chat per screen 1 view, totals only, see ARCHITECTURE.md. Still open: show `currentShares()` on the dashboard (Ron), variant c in `pnpm seed`. Mentor: this is the most important part.
5. **English help alternative** if Offlimits says the Preventielijn cannot help English speakers: their own advice first, otherwise a verified English programme (ReDirection, Troubled Desire, Help Wanted).
6. **Install instructions page** done (7 Nov) at the top of `/setup`: three steps (domain, redirect with JavaScript / PHP / Node.js examples, choose terms), then the optional dashboard (verify domain, get the link). Only red (high) for now: amber/green would need code on the forum's own page (an optional one-line script is the idea).
   - The forum picks its country once and gets the full redirect URL (e.g. `/w/forum.nl?c=be&l=fr`). Not built yet: country is fixed to NL.
   - No country or an unknown one falls back to NL. No guessing from the domain (`.com` forums) or IP.
   - No generic country-less pack: without a country there is no law to name and no number to call, so it would be a warning with a link again.
7. **Live open/closed status** done (7 Nov): above every call button, green pulsing dot "Nu open · tot 18:00" or grey "Gesloten · weer open morgen om 09:00", from the regular hours in the helpline's time zone. Holidays and ad-hoc closures are not visible to us.
8. **Deploy** for the demo, and the submission docs in `submission/`.

## Research (7 Nov)

Ciardha, Nurmi et al. (2026), [arXiv:2606.06417](https://arxiv.org/html/2606.06417v2): warning messages on Ahmia.fi (Tor search), 8 messages plus a neutral one, randomised per day.

- Every message beat the neutral one (a plain description of the help programme). Randomised days: neutral 12.17% click-through, odds ratios 1.12 to 1.76.
- Harm to children worked best, then legality and "getting help is easy", distress about yourself (shame, guilt) worked least.
- Negative versus positive framing (e.g. "puts you at risk" vs "help keeps your job"): small difference, overlapping intervals.
- Over the whole campaign the platform went from 8.73% to 15.67% click-through. No message changed how often people searched.
- Authors recommend an adaptive system that keeps refining messages, not one fixed best message. That is our feedback loop.
- Limits: dark web, clicks only (not calls), daily rotation. May not carry over to a forum.

Our variants start from the three strongest themes (harm, legality, help is easy), in our own words; distress is left out (weakest). Each variant is a whole direction (text, layout, style), since we look for what works, not why. Pitch: "starting from the strongest themes in the largest warning study to date". The differences were small even with millions of searches, so one forum will not tell them apart quickly; the bandit matters as forums and countries are added.

## Pitch angle

Everyone else improves the warning. We shrink the jump from warning to help, and the page **keeps improving itself without tracking a single visitor**: variants plus aggregate counts plus a bandit.

## Mentor input (6 Nov)

- Feedback loop is the most important: different versions, measure which works best, converge on it.
- Do more research into methods that keep people engaged and get them to help, and follow the research.
- Look for something unique (see pitch angle).
- Preventielijn does not support English: use the EU English service for English speakers. For other countries, use their own service in English if it supports it.
