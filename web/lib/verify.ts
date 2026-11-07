import { lookup } from "node:dns/promises";
import { BlockList } from "node:net";

import { forumHref, isLocalForum } from "@/lib/flow";

// we fetch a url built from user input: https, that exact host, public ips only

export const VERIFY_FILE = "/.well-known/sbis.txt";
export const VERIFY_META = "sbis-verify";

const TIMEOUT_MS = 5000;
const MAX_BYTES = 64 * 1024;

const PRIVATE: [string, number, "ipv4" | "ipv6"][] = [
  ["0.0.0.0", 8, "ipv4"],
  ["10.0.0.0", 8, "ipv4"],
  ["100.64.0.0", 10, "ipv4"],
  ["127.0.0.0", 8, "ipv4"],
  ["169.254.0.0", 16, "ipv4"],
  ["172.16.0.0", 12, "ipv4"],
  ["192.168.0.0", 16, "ipv4"],
  ["198.18.0.0", 15, "ipv4"],
  ["224.0.0.0", 3, "ipv4"],
  ["::", 127, "ipv6"],
  ["::ffff:0:0", 96, "ipv6"],
  ["64:ff9b::", 96, "ipv6"],
  ["fc00::", 7, "ipv6"],
  ["fe80::", 10, "ipv6"],
  ["ff00::", 8, "ipv6"],
];

const blocked = new BlockList();
for (const [net, prefix, type] of PRIVATE) blocked.addSubnet(net, prefix, type);

async function isPublicHost(domain: string) {
  const addresses = await lookup(domain, { all: true }).catch(() => []);
  return (
    addresses.length > 0 &&
    addresses.every(
      ({ address, family }) =>
        !blocked.check(address, family === 6 ? "ipv6" : "ipv4"),
    )
  );
}

// no redirects: they could point anywhere
async function fetchText(url: string) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok || !response.body) return null;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    await reader.cancel();
    return Buffer.concat(chunks).subarray(0, MAX_BYTES).toString("utf8");
  } catch {
    return null;
  }
}

function metaContents(html: string) {
  return (html.match(/<meta\b[^>]*>/gi) ?? [])
    .filter((tag) =>
      new RegExp(`\\bname\\s*=\\s*["']?${VERIFY_META}["'\\s>]`, "i").test(tag),
    )
    .map((tag) => tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1]?.trim());
}

// the code in /.well-known/sbis.txt or in a <meta> tag on the home page
export async function hasVerification(domain: string, code: string) {
  // dev only: the local mock forum, over http on localhost
  const local = isLocalForum(domain);
  if (!local && !(await isPublicHost(domain))) return false;
  const origin = `${local ? "http" : "https"}://${domain}`;
  const file = await fetchText(`${origin}${VERIFY_FILE}`);
  if (file?.trim() === code) return true;
  const home = await fetchText(local ? forumHref(domain) : `${origin}/`);
  return home !== null && metaContents(home).includes(code);
}
