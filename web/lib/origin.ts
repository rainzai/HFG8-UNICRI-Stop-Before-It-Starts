import { headers } from "next/headers";

// our own origin, for links and curl examples shown to forums
export async function ownOrigin() {
  const h = await headers();
  const host = h.get("host") ?? "localhost";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
