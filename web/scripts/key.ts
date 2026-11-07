// prints a forum's private stats link and api key, for the demo
// pnpm key forum-a.example

import { statsKey } from "../lib/access.ts";
import { parseForumDomain } from "../lib/flow.ts";

const domain = parseForumDomain(process.argv[2] ?? "");
if (!domain) {
  console.error("usage: pnpm key <forum-domain>");
  process.exit(1);
}

const key = statsKey(domain);
if (!key) {
  console.error(
    "STATS_SECRET missing or under 32 characters, see .env.example",
  );
  process.exit(1);
}

const base = process.env.SBIS_BASE ?? "http://localhost:3100";
console.log(`key   ${key}
link  ${base}/stats/${domain}?k=${key}
api   curl -H "Authorization: Bearer ${key}" "${base}/api/metrics/${domain}"`);
