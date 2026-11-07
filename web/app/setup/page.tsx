import { Suspense, type ReactNode } from "react";

import { statsKey, verifyCode } from "@/lib/access";
import { parseForumDomain } from "@/lib/flow";
import { ownOrigin } from "@/lib/origin";
import { hasVerification, VERIFY_FILE, VERIFY_META } from "@/lib/verify";

// own numbers for a forum: prove control of the domain, get a private key.
// TODO: install instructions (PLAN.md step 6) go above this

// required by cacheComponents for searchParams
export default function Page(props: PageProps<"/setup">) {
  return (
    <Suspense fallback={null}>
      <Setup {...props} />
    </Suspense>
  );
}

async function Setup({ searchParams }: PageProps<"/setup">) {
  const { domain: rawDomain, check } = await searchParams;
  const typed = typeof rawDomain === "string" ? rawDomain.trim() : "";
  const domain = typed ? parseForumDomain(typed) : null;
  const code = domain ? verifyCode(domain) : null;

  return (
    <main
      lang="en"
      className="mx-auto flex max-w-[960px] flex-col gap-10 px-4 py-12 sm:px-6"
    >
      <div className="flex flex-col gap-3">
        <h1 className="m-0 text-3xl font-bold">Your forum&apos;s numbers</h1>
        <p className="m-0 text-[15px]">
          See how many visitors from your forum reached help, per variant.
          Totals only: we never know who anyone is. Only you get the link.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">
          <label htmlFor="domain">Forum domain</label>
        </h2>
        <form
          method="get"
          className="flex items-center gap-4 border-b-2 border-line pb-2 focus-within:border-ink"
        >
          <input
            id="domain"
            name="domain"
            defaultValue={typed}
            placeholder="forum.example.nl"
            required
            // the underline darkens on focus, no box around the text
            className="min-w-0 flex-1 bg-transparent py-2 text-lg focus-visible:outline-none"
          />
          <Submit>Next</Submit>
        </form>
        <p className="m-0 text-[15px]">
          {typed && !domain
            ? "That is not a domain. Just the name, like forum.example.nl."
            : "Just the name, like forum.example.nl. No https:// and nothing after it."}
        </p>
        {domain && !code && (
          <p className="m-0 text-[15px]">
            Stats are not set up on this server yet.
          </p>
        )}
      </section>

      {domain && code && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-xl font-bold">Prove it is your forum</h2>
          <Rows
            header={["Option", "Put this there"]}
            rows={[
              [`File at https://${domain}${VERIFY_FILE}`, code],
              [
                "Meta tag in the <head> of your home page",
                `<meta name="${VERIFY_META}" content="${code}">`,
              ],
            ]}
          />
          <form method="get">
            <input type="hidden" name="domain" value={domain} />
            <input type="hidden" name="check" value="1" />
            <Submit>Check</Submit>
          </form>
        </section>
      )}

      {domain && code && check === "1" && (
        <Result domain={domain} code={code} />
      )}
    </main>
  );
}

async function Result({ domain, code }: { domain: string; code: string }) {
  if (!(await hasVerification(domain, code))) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">Not verified yet</h2>
        <p className="m-0 text-[15px]">
          Code not found. We looked at https://{domain}
          {VERIFY_FILE} and the home page, without following redirects.
        </p>
      </section>
    );
  }

  const key = statsKey(domain);
  const origin = await ownOrigin();
  const link = `${origin}/stats/${domain}?k=${key}`;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="m-0 text-xl font-bold">Your stats link</h2>
      <Rows
        header={["What", "Value"]}
        rows={[
          [
            "Stats page",
            <a key="link" href={link} className="text-ink underline">
              {link}
            </a>,
          ],
          ["API key", key ?? ""],
          [
            "Fetch as JSON",
            `curl -H "Authorization: Bearer ${key}" "${origin}/api/metrics/${domain}"`,
          ],
        ]}
      />
      <p className="m-0 text-[15px]">
        Keep the link and key private, like a password. You can remove the code
        from your site now.
      </p>
    </section>
  );
}

// same look as the dashboard tables
function Rows({
  header,
  rows,
}: {
  header: [string, string];
  rows: [string, ReactNode][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line text-sm">
            <th className="py-2 pr-4 font-normal">{header[0]}</th>
            <th className="py-2 pl-4 font-normal">{header[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-line align-top">
              <th className="py-2 pr-4 font-normal">{label}</th>
              <td className="py-2 pl-4 break-all">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Submit({ children }: { children: string }) {
  return (
    <button
      type="submit"
      className="cursor-pointer rounded-lg bg-ink px-4 py-2 text-[15px] font-bold text-white hover:bg-black"
    >
      {children}
    </button>
  );
}
