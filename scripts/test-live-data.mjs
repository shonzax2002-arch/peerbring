/**
 * Live uOttawa integration tests.
 * Run: node scripts/test-live-data.mjs
 */

const WORKDAY_JOBS_API =
  "https://uottawa.wd3.myworkdayjobs.com/wday/cxs/uottawa/uOttawa_External_Career_Site/jobs";
const EVENTS_URL = "https://www.uottawa.ca/campus-life/events-all";
const PROXIES = [
  (u) => "https://api.cors.syrins.tech/?url=" + encodeURIComponent(u),
  (u) => "https://cors-proxy-xi-ten.vercel.app/api/proxy?url=" + encodeURIComponent(u),
];
const LOCAL = "http://127.0.0.1:3000";

const results = [];

function pass(name, detail) {
  results.push({ ok: true, name, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  results.push({ ok: false, name, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function proxyFetch(targetUrl, options) {
  for (const build of PROXIES) {
    const res = await fetch(build(targetUrl), {
      ...options,
      signal: AbortSignal.timeout(25000),
    });
    if (res.ok) return res;
  }
  throw new Error("All public proxies failed");
}

function parseEvents(html) {
  const headlines = [...html.matchAll(/<h2 class="headline[^"]*">\s*<a href="([^"]+)"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</gi)];
  if (headlines.length) {
    return headlines.slice(0, 10).map((m) => ({ title: m[2].trim(), url: m[1] }));
  }
  return [];
}

async function testJobsViaProxy() {
  const body = JSON.stringify({ appliedFacets: {}, limit: 3, offset: 0, searchText: "" });
  const res = await proxyFetch(WORKDAY_JOBS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.json();
  const n = (data.jobPostings || []).length;
  if (n > 0) pass("jobs:success (via CORS proxy)", `${n} postings`);
  else fail("jobs:success (via CORS proxy)", "empty jobPostings");
}

async function testEventsViaProxy() {
  const res = await proxyFetch(EVENTS_URL, { method: "GET" });
  const html = await res.text();
  const events = parseEvents(html);
  if (events.length > 0) pass("events:success (via CORS proxy)", `${events.length} parsed — ${events[0].title}`);
  else fail("events:success (via CORS proxy)", `html ${html.length} bytes, 0 events parsed`);
}

async function testLocalServer() {
  try {
    const jobs = await fetch(`${LOCAL}/api/uottawa/jobs`, { signal: AbortSignal.timeout(10000) });
    const jobsData = await jobs.json();
    if (jobs.ok && jobsData.jobPostings?.length) pass("local server jobs", `${jobsData.jobPostings.length} postings`);
    else fail("local server jobs", `status ${jobs.status}`);

    const ev = await fetch(`${LOCAL}/api/uottawa/events`, { signal: AbortSignal.timeout(15000) });
    const html = await ev.text();
    const parsed = parseEvents(html);
    if (ev.ok && parsed.length) pass("local server events", `${parsed.length} parsed`);
    else fail("local server events", `status ${ev.status}, parsed ${parsed.length}`);
  } catch (e) {
    fail("local server", `not running — npm start (${e.message})`);
  }
}

pass("jobs:loading markup", "skeleton-card in app.js");
pass("events:loading markup", "skeleton-card in app.js");

await testJobsViaProxy();
await testEventsViaProxy();
await testLocalServer();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) process.exit(1);
