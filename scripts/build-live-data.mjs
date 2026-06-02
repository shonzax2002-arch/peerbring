/**
 * Build data/uottawa-jobs.json and data/uottawa-events.json for GitHub Pages.
 * Run: node scripts/build-live-data.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");

const JOBS_URL =
  "https://uottawa.wd3.myworkdayjobs.com/wday/cxs/uottawa/uOttawa_External_Career_Site/jobs";
const EVENTS_URL = "https://www.uottawa.ca/campus-life/events-all";
const PROXY = (url) => "https://api.cors.syrins.tech/?url=" + encodeURIComponent(url);

async function fetchJobs() {
  const res = await fetch(PROXY(JOBS_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText: "" }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error("Jobs fetch HTTP " + res.status);
  return res.json();
}

function parseEvents(html) {
  const events = [];
  const articleRe = /<article[^>]*class="[^"]*article-teaser[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
  let m;
  while ((m = articleRe.exec(html)) && events.length < 12) {
    const block = m[1];
    const titleM = block.match(/<h2[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</i);
    const dateM = block.match(/<strong>\s*([^<]{8,120}?)\s*<\/strong>/i);
    const descM = block.match(/article-teaser__item-text[^>]*>([^<]{20,200})/i);
    let location = "uOttawa Campus";
    const locM = block.match(/(In person[^<]{5,80})/i);
    if (locM) location = locM[1].trim();
    if (titleM) {
      events.push({
        title: titleM[2].replace(/\s+/g, " ").trim(),
        date: dateM ? dateM[1].replace(/\s+/g, " ").trim() : "",
        location,
        description: descM ? descM[1].trim() : "",
        url: titleM[1],
      });
    }
  }
  return events;
}

async function fetchEvents() {
  const res = await fetch(PROXY(EVENTS_URL), {
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error("Events fetch HTTP " + res.status);
  return parseEvents(await res.text());
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const jobs = await fetchJobs();
  const events = await fetchEvents();
  const stamp = new Date().toISOString();

  fs.writeFileSync(
    path.join(DATA_DIR, "uottawa-jobs.json"),
    JSON.stringify({ updatedAt: stamp, jobPostings: jobs.jobPostings || [] }, null, 2)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "uottawa-events.json"),
    JSON.stringify({ updatedAt: stamp, events }, null, 2)
  );

  console.log("Wrote", jobs.jobPostings?.length, "jobs and", events.length, "events");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
