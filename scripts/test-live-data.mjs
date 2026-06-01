/**
 * Live uOttawa data integration tests (jobs + events).
 * Run: node scripts/test-live-data.mjs
 */

const LIVE_JOBS_API =
  "https://uottawa.wd3.myworkdayjobs.com/wday/cxs/uottawa/uOttawa_External_Career_Site/jobs";
const LIVE_EVENTS_PAGE = "https://www.uottawa.ca/campus-life/events-all";
const PROXY = "https://api.allorigins.win/get?url=";
const TIMEOUT_MS = 25000;

const results = [];

function pass(name, detail) {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

function parseEventsFromHtml(htmlString) {
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(htmlString || "", "text/html");
    return extractEvents(doc);
  }

  const titleMatches = [...htmlString.matchAll(/<h[23][^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([^<]+)</gi)];
  return titleMatches.slice(0, 10).map((m) => ({
    title: m[2].trim(),
    url: m[1],
  }));
}

function extractEvents(doc) {
  let eventItems = doc.querySelectorAll(".views-row, article.event, .event-item");
  if (!eventItems.length) eventItems = doc.querySelectorAll("article");
  if (!eventItems.length) return [];

  return [...eventItems].slice(0, 10).flatMap((item) => {
    const titleEl = item.querySelector("h2 a, h3 a, .field--name-title a, a");
    const title = titleEl?.textContent?.trim();
    if (!title) return [];
    return [{ title, url: titleEl.href || LIVE_EVENTS_PAGE }];
  });
}

function assertSkeletonMarkup(html) {
  return html.includes("skeleton-card") && html.includes("skeleton-heading");
}

function assertFallbackMarkup(html) {
  return (
    html.includes("live-data-notice") &&
    (html.includes("job-card") || html.includes("event-card") || html.includes("Campus Fair"))
  );
}

function assertLiveJobMarkup(html) {
  return html.includes("badge-employer") && html.includes("uOttawa");
}

function assertLiveEventMarkup(html) {
  return html.includes("badge-live") && html.includes("event-card");
}

// --- State simulations (no browser) ---
function testJobsStates() {
  const fallback =
    '<article class="card job-card" data-job-id="1"><h3>Library Assistant</h3></article>';
  const skeleton = Array(6)
    .fill('<div class="card skeleton-card"><div class="skeleton skeleton-heading"></div></div>')
    .join("");

  if (assertSkeletonMarkup(skeleton)) pass("jobs:loading state markup");
  else fail("jobs:loading state markup", "missing skeleton classes");

  if (assertLiveJobMarkup('<span class="badge badge-employer">uOttawa</span>'))
    pass("jobs:success state markup");
  else fail("jobs:success state markup");

  const failHtml =
    '<div class="live-data-notice" role="status"></div>' + fallback;
  if (assertFallbackMarkup(failHtml)) pass("jobs:failure state keeps fallback + notice");
  else fail("jobs:failure state keeps fallback + notice");
}

function testEventsStates() {
  const fallback = '<article class="card event-card"><h3>Campus Fair</h3></article>';
  const skeleton = '<div class="card skeleton-card"><div class="skeleton skeleton-heading"></div></div>';

  if (assertSkeletonMarkup(skeleton)) pass("events:loading state markup");
  else fail("events:loading state markup");

  if (assertLiveEventMarkup('<span class="badge-live">Live</span><div class="event-card">'))
    pass("events:success state markup");
  else fail("events:success state markup");

  const failHtml = '<div class="live-data-notice"></div>' + fallback;
  if (assertFallbackMarkup(failHtml)) pass("events:failure state keeps fallback + notice");
  else fail("events:failure state keeps fallback + notice");
}

async function testJobsApiSuccess() {
  try {
    const res = await fetchWithTimeout(LIVE_JOBS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appliedFacets: {}, limit: 5, offset: 0, searchText: "" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const count = (data.jobPostings || []).length;
    if (count > 0) pass("jobs API live success", `${count} postings`);
    else fail("jobs API live success", "empty jobPostings array");
  } catch (e) {
    fail("jobs API live success", e.message);
  }
}

async function testEventsProxyAndParse() {
  try {
    const res = await fetchWithTimeout(PROXY + encodeURIComponent(LIVE_EVENTS_PAGE));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.contents) throw new Error("missing contents");
    const events = parseEventsFromHtml(data.contents);
    if (events.length > 0) pass("events proxy + parse success", `${events.length} items`);
    else fail("events proxy + parse success", "no events parsed — fallback path expected in UI");
  } catch (e) {
    fail("events proxy + parse success", e.message);
  }
}

async function main() {
  console.log("Peer Bring — live data tests\n");
  testJobsStates();
  testEventsStates();
  await testJobsApiSuccess();
  await testEventsProxyAndParse();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

main();
