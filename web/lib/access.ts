import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// no storage: codes and keys are recomputed from the domain on every request

// from .env.local or the host, never in the code
function secret() {
  const value = process.env.STATS_SECRET;
  return value && value.length >= 32 ? value : null;
}

function hmac(message: string) {
  const key = secret();
  return key
    ? createHmac("sha256", key).update(message).digest("base64url")
    : null;
}

// public: only proves the forum controls its site
export function verifyCode(domain: string) {
  const mac = hmac(`verify:${domain}`);
  return mac && `sbis-${mac.slice(0, 24)}`;
}

// private: other prefix, so it cannot be derived from the code
export function statsKey(domain: string) {
  return hmac(`stats:${domain}`);
}

export function isStatsKey(domain: string, key: string) {
  const expected = statsKey(domain);
  return expected !== null && safeEqual(key, expected);
}

// basic auth for the internal dashboard, password from ADMIN_PASSWORD
export function isAdmin(authorization: string | null) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !authorization?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(authorization.slice(6), "base64").toString();
  return safeEqual(decoded.slice(decoded.indexOf(":") + 1), password);
}

// hash first, so different lengths compare in constant time too
function safeEqual(a: string, b: string) {
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(a), hash(b));
}
