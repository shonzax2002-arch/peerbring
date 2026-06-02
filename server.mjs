/**
 * Local static server + CORS-safe proxies for uOttawa live data.
 * Run: node server.mjs  →  http://127.0.0.1:3000
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;

const JOBS_URL =
  "https://uottawa.wd3.myworkdayjobs.com/wday/cxs/uottawa/uOttawa_External_Career_Site/jobs";
const EVENTS_URL = "https://www.uottawa.ca/campus-life/events-all";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
}

function sendText(res, status, body, contentType) {
  res.writeHead(status, {
    "Content-Type": contentType || "text/plain; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

async function proxyJobs() {
  const upstream = await fetch(JOBS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText: "" }),
  });
  const text = await upstream.text();
  return { status: upstream.status, text };
}

async function proxyEvents() {
  const upstream = await fetch(EVENTS_URL, {
    headers: { Accept: "text/html", "User-Agent": "PeerBring/1.0" },
  });
  const text = await upstream.text();
  return { status: upstream.status, text };
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    sendText(res, 403, "Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendText(res, 404, "Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".html") {
      let html = data.toString("utf8");
      if (!html.includes('name="peer-bring-server"')) {
        html = html.replace(
          "</head>",
          '    <meta name="peer-bring-server" content="1" />\n  </head>'
        );
      }
      res.writeHead(200, { "Content-Type": MIME[ext] });
      res.end(html);
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  try {
    if (req.url.startsWith("/api/uottawa/jobs") && req.method === "GET") {
      const { status, text } = await proxyJobs();
      sendText(res, status, text, "application/json");
      return;
    }
    if (req.url.startsWith("/api/uottawa/events") && req.method === "GET") {
      const { status, text } = await proxyEvents();
      sendText(res, status, text, "text/html; charset=utf-8");
      return;
    }
    serveStatic(req, res);
  } catch (e) {
    sendJson(res, 502, { error: e.message || "Proxy error" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Peer Bring → http://127.0.0.1:${PORT}`);
  console.log("  Jobs:   /api/uottawa/jobs");
  console.log("  Events: /api/uottawa/events");
});
