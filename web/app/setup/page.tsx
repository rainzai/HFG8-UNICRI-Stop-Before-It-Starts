import Form from "next/form";
import { Suspense } from "react";

import { Code } from "@/components/setup/code";
import { NoticeSetup } from "@/components/setup/notice-setup";
import { statsKey, verifyCode } from "@/lib/access";
import { parseForumDomain } from "@/lib/flow";
import { ownOrigin } from "@/lib/origin";
import { hasVerification, VERIFY_FILE, VERIFY_META } from "@/lib/verify";

// for forum moderators: install (one redirect), then optionally the
// dashboard, by proving control of the domain and getting a private key

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
  const origin = await ownOrigin();

  return (
    <main
      lang="en"
      className="mx-auto flex max-w-[760px] flex-col gap-10 px-4 py-12 sm:px-6 [&_p_code]:text-[0.85em]"
    >
      <div className="flex flex-col gap-3">
        <h1 className="m-0 text-3xl font-bold">Install</h1>
        <p className="m-0">
          SBIS shows a help page instead of search results when a search matches
          your word filter. Installing it is one redirect.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">
          <label htmlFor="domain">1. Enter your domain</label>
        </h2>
        {/* next/form: same GET, swapped in place instead of a full reload */}
        <Form
          action="/setup"
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
        </Form>
        {typed && !domain && (
          <p className="m-0 text-[15px]">
            Enter a domain like forum.example.nl.
          </p>
        )}
      </section>

      {domain && <Install domain={domain} origin={origin} />}

      {domain && (
        <section className="flex flex-col gap-3 border-t border-line pt-10">
          <h2 className="m-0 text-xl font-bold">
            Dashboard <span className="font-normal text-muted">(optional)</span>
          </h2>
          <p className="m-0">
            The dashboard shows, per month, how many visitors from your forum
            saw the page and how many called or chatted with the helpline. It
            only has totals, no individual visits.
          </p>
          {!code && <p className="m-0">Not available right now.</p>}
        </section>
      )}

      {domain && code && (
        <section className="flex flex-col gap-3">
          <h3 className="m-0 text-lg font-bold">Verify your domain</h3>
          <p className="m-0">
            Add one of these to your site, then click Check.
          </p>
          <Code
            tabs={[
              [
                "Meta tag",
                `<meta name="${VERIFY_META}" content="${code}">`,
                `In the <head> of https://${domain}/`,
              ],
              ["File", code, `Save as https://${domain}${VERIFY_FILE}`],
            ]}
          />
          <Form action="/setup">
            <input type="hidden" name="domain" value={domain} />
            <input type="hidden" name="check" value="1" />
            <Submit>Check</Submit>
          </Form>
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
        <h3 className="m-0 text-lg font-bold">Not verified yet</h3>
        <p className="m-0">
          Couldn&apos;t find the code at https://{domain}
          {VERIFY_FILE} or on your home page. Redirects aren&apos;t followed.
        </p>
      </section>
    );
  }

  const key = statsKey(domain);
  const origin = await ownOrigin();
  const link = `${origin}/stats/${domain}?k=${key}`;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="m-0 text-lg font-bold">Your dashboard</h3>
      <p className="m-0">
        Open your dashboard:{" "}
        <a href={link} className="[overflow-wrap:anywhere] text-ink underline">
          {link}
        </a>
      </p>
      <p className="m-0">Or get the same numbers as JSON:</p>
      <Code
        tabs={[
          [
            "curl",
            `curl -H "Authorization: Bearer ${key}" \\
  "${origin}/api/metrics/${domain}"`,
          ],
        ]}
      />
      <p className="m-0">
        Keep the link and key private. You can remove the code from your site
        now.
      </p>
    </section>
  );
}

function Install({ domain, origin }: { domain: string; origin: string }) {
  const link = `${origin}/w/${domain}?l=nl`;

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">2. Add the redirect</h2>
        <p className="m-0">
          When a search matches your filter, send the visitor to this address
          instead of showing results:
        </p>
        <Code tabs={[["Link", link]]} />
        <p className="m-0">For example:</p>
        <Code
          tabs={[
            [
              "JavaScript",
              `<meta name="referrer" content="no-referrer">
<script>
  // call this when your filter matches
  function sbisRedirect() {
    const url = "${link}";
    // replace a results page, so Back doesn't open it again
    if (location.search) location.replace(url);
    else location.assign(url);
  }
</script>`,
            ],
            [
              "PHP",
              `if (matches_word_filter($query)) {
  header('Referrer-Policy: no-referrer');
  header('Location: ${link}', true, 302);
  exit;
}`,
            ],
            [
              "Node.js",
              `if (matchesWordFilter(query)) {
  res.set("Referrer-Policy", "no-referrer");
  return res.redirect(302, "${link}");
}`,
            ],
          ]}
        />
        <p className="m-0">
          The examples set <code>Referrer-Policy: no-referrer</code>, so the
          search address isn&apos;t sent to SBIS. Keep it if you write your own.
        </p>
        <p className="m-0">
          Don&apos;t want your forum to be counted at all? Put <code>~</code>{" "}
          before your domain:{" "}
          <code className="[overflow-wrap:anywhere]">{`${origin}/w/~${domain}?l=nl`}</code>
          . The page looks the same, but we count nothing for your forum, so
          there&apos;s no dashboard and your visitors don&apos;t help improve
          the page. For the notices below, use{" "}
          <code>data-site=&quot;~{domain}&quot;</code>.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">3. Choose your terms</h2>
        <p className="m-0">
          Only add terms that are clearly about child sexual abuse material.
          Leave out words people also use innocently, since a match always
          replaces the search results. Don&apos;t publish your list.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-xl font-bold">
          Softer notices{" "}
          <span className="font-normal text-muted">(optional)</span>
        </h2>
        <p className="m-0">
          If your filter has a lighter level, for terms that are sometimes used
          innocently, you can keep the results and show a notice instead: a
          popup, or a small box above the results. It uses your site&apos;s font
          and colours, plus the button colour you pick.
        </p>
        <NoticeSetup origin={origin} domain={domain} />
      </section>
    </>
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
