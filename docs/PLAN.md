# Plan

Where we are and what is next. How it works lives in [ARCHITECTURE.md](ARCHITECTURE.md).

## Done (6 Nov)

- Full visitor flow in Dutch and English: start, mistake, worried, consequences, help, later, plus the saved-link page `/i/nl`.
- Call and chat on worried, consequences and help. Chat links straight to the Preventielijn chat.
- Help screen: opening hours, "Is it anonymous? Yes", "Will I be reported? No" with the one exception, what a call is like.
- Mock forum hooked up: `mock-platform/redirect.js` listens for `sbis:trigger` and redirects with only the forum host and language.
- Language dropdown (language names, not flags). Country packs per folder (`content/NL/`).

## Open questions

- **Which "EU English" service for English speakers?** The mentor said the Preventielijn does not support English and to use the EU English one instead. Candidates from the brief: ReDirection (English self-help, `verified: false` in `data/`), Troubled Desire, Help Wanted. Not Helplinks.eu: it is run by police services, which clashes with "you will not be reported".
- **Service name and domain.** Still `[Service name]`. Must be neutral, it ends up in browser history.

## Next, in order

1. **Research: what gets people to help.** Go through `research/EVIDENCE.md` and the studies in `BRIEF.md` (Prichard 2024 deterrent vs therapeutic, Ciardha 2026 harm-focused, reThink chatbot, Google redesign, ReDirection, Prevent It). Output: a short list of techniques we can turn into testable variants.
2. **Counter with variants.** `(forum, variant, step, day) → count`, nothing else. Count in `proxy.ts` per real step request, call and chat clicks via `sendBeacon`. Variant assigned at random per visit, carried in the URL (`?v=b`), no cookie.
3. **Stats page and metrics endpoint.** Per forum, counts below 10 suppressed. `GET /api/metrics/<forum>` returns the contract's metrics event format: this is the "payload back to the forum" from `contract/PLUGIN_CONTRACT.md`. Optionally `redirect.js` fires one `sbis:result` (`shown: true`) before redirecting.
4. **Feedback loop.** Compare variants on reaching call/chat, then a multi-armed bandit that shifts traffic to the better variant using totals only. Mentor: this is the most important part.
5. **English help alternative** once the question above is answered.
6. **Install instructions page** (redirect URL format, Referrer-Policy).
7. **Live open/closed status** in the contact block, worded as "according to regular opening hours" (ad-hoc closures are not visible to us).
8. **Deploy** for the demo, and the submission docs in `submission/`.

## Pitch angle

Everyone else improves the warning. We shrink the jump from warning to help, and the page **keeps improving itself without tracking a single visitor**: variants plus aggregate counts plus a bandit.

## Mentor input (6 Nov)

- Feedback loop is the most important: different versions, measure which works best, converge on it.
- Do more research into methods that keep people engaged and get them to help, and follow the research.
- Look for something unique (see pitch angle).
- Preventielijn does not support English: use the EU English service for English speakers. For other countries, use their own service in English if it supports it.
