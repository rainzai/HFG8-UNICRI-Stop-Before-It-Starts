# SBIS: one-pager

## Target User Stage

**02 Starting (first searches).** This is the moment a forum's filter catches a search, so it is where a small platform can reach someone. People at this stage have not been reached by anyone yet, and a calm, honest answer can still change the direction.

The page also has a calm way back for people who got there by accident ("this was a mistake"), the help screen for people already in deep (03), and a line that the Preventielijn also helps partners and family (04).

## Target Platform Type

**Small and mid-sized Dutch forums**, like a 20K-member forum with one part-time moderator. They already have a word filter but no budget, no developers, and no time to maintain a plugin. So the install is one redirect from that filter. Everything else (softer notices, the dashboard) is optional.

## Country

**The Netherlands first.** Dutch law (articles 252 and 254), the Preventielijn of Offlimits, Dutch and English.

To add a country you add a folder with its own copy, law and helpline (`web/content/<country>/`). Packs are checked at build time, so a missing translation fails the build instead of showing an empty page. English for the Netherlands keeps Dutch law and the Dutch helpline, and says that conversations are in Dutch.

## Evidence Behind the Design

- **Warnings stop searches, but few people reach help.** 82% did not search again after a warning (reThink), but only about 1 in 100 click through to help (Project Intercept). So we focus on the step to help, not the warning.
- **Message content matters.** On Ahmia.fi, every tested message beat a neutral one, and help clicks went from 8.7% to 15.7%. Harm to children worked best, then legality and "getting help is easy" (Ciardha, Nurmi et al. 2026). Versions a, b and c start from those three themes.
- **Keep testing instead of picking one message.** The same study recommends an adaptive system that keeps refining messages. That is our bandit.
- **Images are uncertain.** Adding images did not make warnings more effective in a randomised trial (Prichard et al. 2024). Versions d (bars, fear) and e (a sprout, hope) test whether that holds on a forum and for the step to help.
- **People want help.** About half of over 17,000 ReDirection respondents want to stop, but only 3% got help. The help screen answers the questions that hold people back: is it anonymous, will I be reported, what is a call like.

## Safe Test Plan

1. **What we would measure:** per version, per day: page shown, each screen reached, and clicks on call and chat. The main number is call + chat per page shown.
2. **How we avoid tracking individuals:** counts are added up the moment they come in, as `(day, forum, version, event) → count`. No IP address, cookie, session ID or time of day is stored. The version is one of five letters in the link, shared by many visitors, so it is not a tracking token. Counts below 10 are hidden, also after adding up. Forums only see whole finished months. A forum can opt out of counting completely by adding `~` before its domain in the link.
3. **How we avoid real abuse-related terms:** the redirect never carries the search text, only the forum's domain and language. All testing uses `test-trigger-*` terms. We never publish a term list.
4. **How we protect participants:** no live testing during the hackathon, and no contact with anyone at risk. The page never asks for a name or details. Calls and chats go straight to trained Preventielijn staff, not to us.
5. **What a controlled rollout looks like:** one partner forum, agreed with Offlimits and with ethics approval. Start with all versions shared evenly, then let the bandit shift visitors once there is enough data. Stop any version that does clearly worse.
6. **Timeline and partners:** a 3-month pilot with one Dutch forum, Offlimits (the Preventielijn), and a research partner to review the numbers.
