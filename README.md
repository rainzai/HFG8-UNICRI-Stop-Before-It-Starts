# SBIS

Our entry for the UNICRI challenge *Stop Before It Starts* at Hackathon for Good #8. The original challenge description is in [docs/CHALLENGE.md](docs/CHALLENGE.md), our one-pager in [submission/ONE_PAGER.md](submission/ONE_PAGER.md), and how it all works in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Team Name

**Detour**: it's not too late.

## What We Built

A hosted help page that forums send people to when a search matches their word filter. Most warnings end in a dead end with a link at the bottom, and about 1 in 100 people click through to help (Project Intercept). We focus on that step: the page is the first small step of help itself, so contacting the Preventielijn feels like a small next step instead of a leap.

We cover all three building blocks:

- **Warning:** one short message, then one question ("this was a mistake", "I'm worried", "what are the consequences?"), so everyone gets an answer that fits.
- **Route to help:** call and chat with the Preventielijn of Offlimits two taps away, with honest answers to "is it anonymous?" and "will I be reported?", what a call is like, opening hours, self-help, and a neutral link to save for later.
- **Plug-and-play:** the install is one redirect. No plugin, no account, nothing to update.

The page improves itself without tracking anyone. There are five versions (`a` to `e`), based on the strongest message themes in the largest warning study so far (Ciardha, Nurmi et al. 2026), plus two image versions. A bandit sends more visitors to the version that gets more people to call or chat, using only daily totals.

Main persona: **02 Starting** (first searches), with a route for **03** and a line for **04** (the Preventielijn also helps partners and family).

## How to Run It

Prerequisites: Node 20+ and pnpm (or `nix develop`, which provides both).

```bash
# the help page
cd web
pnpm install
cp .env.example .env.local   # fill in STATS_SECRET (32+ characters) and ADMIN_PASSWORD
pnpm seed                    # optional: 60 days of fake counts for the dashboard
pnpm dev -p 3100

# the mock forum, in a second terminal, from the repo root
npm install
npx vite --config vite.config.js --port 3000
```

Then open http://localhost:3000/mock-platform/ and search for:

- `test-trigger-red`: the forum sends you to the help page
- `test-trigger-amber`: the results stay, with a popup
- `test-trigger-green`: the results stay, with a small box

Other pages: `/setup` (install instructions and a preview), `/admin` (internal dashboard, any username and `ADMIN_PASSWORD`).

## How a Platform Installs It

One redirect, about an afternoon of work. On `/setup` a moderator enters their domain and gets their link and code:

```php
if (matches_word_filter($query)) {  // your existing filter
  header('Referrer-Policy: no-referrer');
  header('Location: https://<our domain>/w/forum.example.nl?l=nl', true, 302);
  exit;
}
```

There are also Node.js and browser-only versions. The link only holds the forum's domain and language, never the search text, a username or an IP address. Only terms that are clearly about child sexual abuse material go in the redirect list.

Optional extras, never required:

- **Softer notices:** for terms people also use innocently, one `<script>` line shows a popup or a small box above the results instead of redirecting. It uses the forum's own font and colours.
- **Dashboard:** a forum proves it owns its domain (meta tag or file) and gets a private link to its own numbers, per finished month.
- **No counting at all:** a forum that does not want to be counted links to `/w/~forum.example.nl`. The page is the same, and nothing is stored for that forum.

## How to Test Impact Safely

- **Totals only:** we store `(day, forum, version, event) → count`, nothing else. No IP address, no cookie, no session ID, no time finer than a day. Single visits never exist in storage.
- **Small numbers hidden:** counts below 10 are hidden, also after adding up. Forums only see whole finished months, one at a time, so live counts or subtracting two periods can't reveal a single person.
- **No real terms:** all testing uses `test-trigger-*` terms. The redirect never carries the search text.
- **No live testing during the hackathon:** everything runs on the mock forum, and demo numbers come from `pnpm seed`.

See the one-pager for the full test plan.

## What We Would Do Next

- Run a pilot with one Dutch forum and Offlimits, with a research partner and ethics approval.
- Confirm with Offlimits whether the Preventielijn can help English speakers, and where to send them if not.
- Add Belgium (Flemish Dutch and French) as the second country pack.
- Let the bandit learn per country, and count how often the optional notices are shown, so they can be tested too.
- Get an accessibility review with screen reader users.

## Team Members

| Name | Role |
|------|------|
| Denzel Wolvekamp | Idea and design, visitor flow, versions and bandit, notices, install page |
| Ronald Koning | Counting, dashboards, stats access |
