/**
 * Peer Bring — client-side interactions (static prototype)
 */

(function () {
  "use strict";

  /**
   * Show a coral toast bottom-right; auto-dismiss after 3s.
   * @param {string} message
   */
  function showToast(message) {
    var container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    container.appendChild(el);

    requestAnimationFrame(function () {
      el.classList.add("show");
    });

    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () {
        el.remove();
      }, 320);
    }, 3000);
  }

  /**
   * Map filename to nav item href basename for active state.
   */
  function setActiveNav() {
    var path = window.location.pathname || "";
    var file = path.split("/").pop() || "index.html";
    if (!file || file === "") file = "index.html";

    document.querySelectorAll(".nav-item").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var base = href.split("/").pop();
      link.classList.toggle("active", base === file);
    });

    document.querySelectorAll(".mobile-nav a").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var base = href.split("/").pop();
      link.classList.toggle("active", base === file);
    });
  }

  /**
   * Profile page tabs: Overview | Listings | Reviews | Activity
   */
  function initProfileTabs() {
    var tabs = document.querySelectorAll(".profile-tab");
    var panels = document.querySelectorAll(".tab-panel");
    if (!tabs.length || !panels.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach(function (p) {
          p.classList.toggle("active", p.getAttribute("data-panel") === target);
        });
      });
    });
  }

  /** Dummy chat threads keyed by conversation id */
  var chatThreads = {
    marcus: {
      name: "Marcus T.",
      subtitle: "Brooklyn College · CS",
      tag: "re: Calculus Textbook",
      messages: [
        { side: "sent", text: "Hi, I'm interested in the Calculus textbook. Would you take $45?" },
        { side: "recv", text: "Hey! The lowest I can go is $70." },
        { side: "sent", text: "I'd say $55 is fair given the condition." },
        { side: "recv", text: "How about $65? It's barely used." },
        { side: "system", text: "🤖 Hagglit AI sent offer: $58" },
        { side: "recv", text: "Deal! Let's meet Thursday." },
      ],
    },
    priya: {
      name: "Priya S.",
      subtitle: "Brooklyn College · Design",
      tag: "re: Desk Lamp",
      messages: [
        { side: "recv", text: "Is the lamp still available?" },
        { side: "sent", text: "Yes! Still have it. Want to see it on campus?" },
      ],
    },
    jordan: {
      name: "Jordan L.",
      subtitle: "Brooklyn College · Engineering",
      tag: "re: Bike",
      messages: [
        { side: "sent", text: "Can we meet at the library?" },
        { side: "recv", text: "Let's meet at the library — south entrance at 4pm?" },
        { side: "sent", text: "Works for me." },
      ],
    },
    sarah: {
      name: "Sarah K.",
      subtitle: "Brooklyn College",
      tag: "General",
      messages: [
        { side: "recv", text: "Deal complete! 🎉" },
        { side: "sent", text: "Thanks again!" },
      ],
    },
    alexm: {
      name: "Alex M.",
      subtitle: "Brooklyn College",
      tag: "Marketplace",
      messages: [
        { side: "recv", text: "Hey, saw your listing" },
        { side: "sent", text: "Hi! Which one — happy to answer questions." },
      ],
    },
  };

  function renderChat(threadId) {
    var data = chatThreads[threadId];
    if (!data) return;

    var titleEl = document.getElementById("chat-title");
    var subEl = document.getElementById("chat-subtitle");
    var tagEl = document.getElementById("chat-item-tag");
    var area = document.getElementById("chat-messages-area");
    var avatarEl = document.getElementById("chat-header-avatar");

    if (titleEl) titleEl.textContent = data.name;
    if (subEl) subEl.textContent = data.subtitle;
    if (tagEl) tagEl.textContent = data.tag;
    if (avatarEl) {
      var initials = data.name
        .split(" ")
        .map(function (p) {
          return p[0];
        })
        .join("");
      avatarEl.textContent = initials;
    }

    if (!area) return;
    area.innerHTML = "";

    data.messages.forEach(function (m) {
      if (m.side === "system") {
        var sys = document.createElement("div");
        sys.className = "msg-system";
        sys.textContent = m.text;
        area.appendChild(sys);
      } else {
        var bubble = document.createElement("div");
        bubble.className = "bubble " + (m.side === "sent" ? "bubble--right" : "bubble--left");
        bubble.textContent = m.text;
        area.appendChild(bubble);
      }
    });

    area.scrollTop = area.scrollHeight;
  }

  function initMessages() {
    var items = document.querySelectorAll(".conv-item[data-thread]");
    if (!items.length) return;

    items.forEach(function (item) {
      function activateConv() {
        items.forEach(function (i) {
          i.classList.toggle("active", i === item);
        });
        var threadId = item.getAttribute("data-thread");
        if (threadId) renderChat(threadId);
      }

      item.addEventListener("click", activateConv);
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateConv();
        }
      });
    });

    var first = document.querySelector(".conv-item[data-thread].active");
    if (first) {
      renderChat(first.getAttribute("data-thread") || "marcus");
    }
  }

  /**
   * Hagglit page: Auto-Negotiate toggle
   */
  function initHagglitToggle() {
    var toggle = document.getElementById("auto-negotiate-toggle");
    var label = document.getElementById("auto-negotiate-label");
    if (!toggle) return;

    function sync() {
      var on = toggle.classList.contains("on");
      toggle.setAttribute("aria-pressed", on ? "true" : "false");
      if (label) label.textContent = on ? "ON" : "OFF";
    }

    toggle.addEventListener("click", function () {
      toggle.classList.toggle("on");
      sync();
    });

    sync();
  }

  /**
   * Home: Quick Actions modal
   */
  function initQuickActions() {
    var overlay = document.getElementById("quick-action-modal");
    var titleEl = document.getElementById("quick-action-modal-title");
    var bodyEl = document.getElementById("quick-action-modal-body");
    var closeBtn = document.getElementById("quick-action-modal-close");

    function openModal(title, body) {
      if (!overlay) return;
      if (titleEl) titleEl.textContent = title;
      if (bodyEl) bodyEl.textContent = body;
      overlay.classList.add("is-open");
    }

    function closeModal() {
      if (overlay) overlay.classList.remove("is-open");
    }

    document.querySelectorAll(".quick-btn[data-quick]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-quick");
        var copy = {
          email: {
            title: "Draft Email",
            body: "Hagglit would draft a polite email to your professor here. (Demo — no AI connected.)",
          },
          plan: {
            title: "Study Plan",
            body: "Suggested blocks: 2× 45m for CS301, 1× review session with flashcards. (Demo content.)",
          },
          notes: {
            title: "Summarize Notes",
            body: "Paste notes in the real app; here’s a sample summary: key definitions + 3 practice problems. (Demo.)",
          },
          deal: {
            title: "Find Deal",
            body: "Scanning marketplace… Top pick: Organic Chem Textbook at $35, 0.3 mi. (Demo.)",
          },
        };
        var c = copy[key] || { title: "Quick Action", body: "Demo action." };
        openModal(c.title, c.body);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
    }
  }

  /**
   * Marketplace: Hagglit It → toast
   */
  function initMarketplaceHagglit() {
    document.querySelectorAll(".btn-hagglit-it").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showToast("AI is negotiating for you!");
      });
    });
  }

  /**
   * Marketplace: category filter highlight only
   */
  function initMarketplaceFilters() {
    var cats = document.querySelectorAll(".filter-cat");
    cats.forEach(function (btn) {
      btn.addEventListener("click", function () {
        cats.forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
      });
    });
  }

  /**
   * Hagglit: switch negotiation detail (optional enhancement — list items)
   */
  function initHagglitList() {
    var items = document.querySelectorAll(".neg-list-item[data-neg]");
    if (items.length <= 1) return;

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        items.forEach(function (i) {
          i.classList.toggle("active", i === item);
        });
      });
    });
  }

  function initLucide() {
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var jobsFallbackHtml = "";
  var eventsFallbackHtml = "";

  var LIVE_DATA_URLS = {
    jobs: "https://uottawa.wd3.myworkdayjobs.com/uOttawa_External_Career_Site",
    events: "https://www.uottawa.ca/campus-life/events-all",
  };

  var WORKDAY_JOBS_API =
    "https://uottawa.wd3.myworkdayjobs.com/wday/cxs/uottawa/uOttawa_External_Career_Site/jobs";

  var CORS_PROXIES = [
    function (url) {
      return "https://api.cors.syrins.tech/?url=" + encodeURIComponent(url);
    },
    function (url) {
      return "https://cors-proxy-xi-ten.vercel.app/api/proxy?url=" + encodeURIComponent(url);
    },
  ];

  var FETCH_TIMEOUT_MS = 12000;

  /** GitHub Pages project sites live under /repo-name/ */
  function getDeployBase() {
    var path = window.location.pathname || "/";
    var parts = path.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return "/" + parts[0] + "/";
    }
    if (parts.length === 1 && parts[0].indexOf(".html") === -1) {
      return "/" + parts[0] + "/";
    }
    return "/";
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    var ms = timeoutMs || FETCH_TIMEOUT_MS;
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, ms);
    return fetch(url, Object.assign({}, options || {}, { signal: controller.signal })).finally(
      function () {
        clearTimeout(timer);
      }
    );
  }

  async function fetchCachedJobs() {
    try {
      var res = await fetchWithTimeout(getDeployBase() + "data/uottawa-jobs.json", {
        cache: "no-store",
      });
      if (!res.ok) return null;
      var data = await res.json();
      return data.jobPostings && data.jobPostings.length ? data.jobPostings : null;
    } catch (e) {
      return null;
    }
  }

  async function fetchCachedEvents() {
    try {
      var res = await fetchWithTimeout(getDeployBase() + "data/uottawa-events.json", {
        cache: "no-store",
      });
      if (!res.ok) return null;
      var data = await res.json();
      return data.events && data.events.length ? data.events : null;
    } catch (e) {
      return null;
    }
  }

  function seedEventsFallbackList() {
    var list = document.getElementById("events-list");
    if (list && !list.innerHTML.trim() && eventsFallbackHtml) {
      list.innerHTML = eventsFallbackHtml;
    }
  }

  function hasPeerBringServer() {
    if (document.querySelector('meta[name="peer-bring-server"]')) return true;
    var host = window.location.hostname;
    return (
      window.location.port === "3000" &&
      (host === "localhost" || host === "127.0.0.1")
    );
  }

  function isJobsTarget(url) {
    return url === WORKDAY_JOBS_API || url.indexOf("/wday/cxs/") !== -1;
  }

  async function fetchWithCorsProxy(targetUrl, options, responseKind) {
    var opts = options || {};
    var kind = responseKind || (isJobsTarget(targetUrl) ? "json" : "html");
    var method = opts.method || "GET";
    var errors = [];

    if (hasPeerBringServer()) {
      try {
        var apiPath = isJobsTarget(targetUrl) ? "/api/uottawa/jobs" : "/api/uottawa/events";
        var localRes = await fetchWithTimeout(apiPath, { method: "GET", cache: "no-store" });
        var localText = await localRes.text();
        if (localRes.ok && validateProxyPayload(localText, kind)) {
          return { ok: true, text: localText, source: "local" };
        }
        errors.push("local API returned invalid " + kind);
      } catch (localErr) {
        errors.push("local API: " + localErr.message);
      }
    }

    var i;
    for (i = 0; i < CORS_PROXIES.length; i++) {
      try {
        var proxied = await fetchWithTimeout(CORS_PROXIES[i](targetUrl), {
          method: method,
          headers: opts.headers || {},
          body: opts.body,
          cache: "no-store",
        });
        var proxiedText = await proxied.text();
        if (proxied.ok && validateProxyPayload(proxiedText, kind)) {
          return { ok: true, text: proxiedText, source: "proxy" };
        }
        errors.push("proxy " + (i + 1) + ": HTTP " + proxied.status);
      } catch (proxyErr) {
        errors.push("proxy " + (i + 1) + ": " + proxyErr.message);
      }
    }

    throw new Error(errors.join(" | "));
  }

  function validateProxyPayload(text, kind) {
    if (!text || text.length < 20) return false;
    if (kind === "json") {
      if (text.trim().charAt(0) === "<") return false;
      try {
        JSON.parse(text);
        return true;
      } catch (parseErr) {
        return false;
      }
    }
    return text.indexOf("<") !== -1 && text.length > 500;
  }

  function setLiveStatus(el, state, message) {
    if (!el) return;
    el.className = "live-status live-status--" + state;
    el.textContent = message;
  }

  function showFallbackSection(sectionId) {
    var section = document.getElementById(sectionId);
    if (section) section.hidden = false;
  }

  function hideFallbackSection(sectionId) {
    var section = document.getElementById(sectionId);
    if (section) section.hidden = true;
  }

  function initLiveDataFallbacks() {
    var jobsGrid = document.getElementById("jobs-grid");
    if (jobsGrid && jobsGrid.innerHTML.trim() && !jobsFallbackHtml) {
      jobsFallbackHtml = jobsGrid.innerHTML;
    }

    var eventsTpl = document.getElementById("events-fallback");
    if (eventsTpl && eventsTpl.innerHTML.trim()) {
      eventsFallbackHtml = eventsTpl.innerHTML;
    }

    var eventsList = document.getElementById("events-list");
    if (eventsList && !eventsList.innerHTML.trim() && eventsFallbackHtml) {
      eventsList.innerHTML = eventsFallbackHtml;
    }
  }

  function getLiveTestMode(section) {
    if (typeof window === "undefined" || !window.location || !window.location.search) return null;
    return new URLSearchParams(window.location.search).get("live_" + section);
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function buildLiveNotice(section, variant) {
    var url = LIVE_DATA_URLS[section];
    var copy = {
      jobs: {
        fail: "Could not load live uOttawa jobs right now. Your campus listings are shown below.",
        empty: "No live uOttawa postings at the moment. Your campus listings are shown below.",
        parse: "Live job listings could not be displayed. Your campus listings are shown below.",
      },
      events: {
        fail: "Could not load live uOttawa events right now. Sample campus events are shown below.",
        empty: "No live campus events were found. Sample campus events are shown below.",
        parse: "Live events could not be parsed from uOttawa. Sample campus events are shown below.",
      },
    };
    var message = (copy[section] && copy[section][variant]) || copy[section].fail;
    return (
      '<div class="live-data-notice" role="status">' +
      '<i data-lucide="alert-circle" aria-hidden="true"></i>' +
      "<p><span>" +
      escapeHtml(message) +
      '</span> <a href="' +
      escapeHtml(url) +
      '" target="_blank" rel="noopener noreferrer">Browse on uOttawa →</a></p>' +
      "</div>"
    );
  }

  function getFallbackFromTemplate(templateId) {
    var tpl = document.getElementById(templateId);
    return tpl && tpl.innerHTML.trim() ? tpl.innerHTML : "";
  }

  function ensureJobsFallback() {
    if (jobsFallbackHtml) return jobsFallbackHtml;
    var fromTemplate = getFallbackFromTemplate("jobs-fallback");
    if (fromTemplate) {
      jobsFallbackHtml = fromTemplate;
      return jobsFallbackHtml;
    }
    var grid = document.getElementById("jobs-grid");
    if (grid && grid.innerHTML.trim()) {
      jobsFallbackHtml = grid.innerHTML;
      var persist = document.getElementById("jobs-fallback");
      if (!persist) {
        persist = document.createElement("template");
        persist.id = "jobs-fallback";
        grid.insertAdjacentElement("afterend", persist);
      }
      if (!persist.innerHTML.trim()) persist.innerHTML = jobsFallbackHtml;
    }
    return jobsFallbackHtml;
  }

  function ensureEventsFallback() {
    if (eventsFallbackHtml) return eventsFallbackHtml;
    eventsFallbackHtml = getFallbackFromTemplate("events-fallback");
    if (!eventsFallbackHtml) {
      var list = document.getElementById("events-list");
      if (list && list.innerHTML.trim()) eventsFallbackHtml = list.innerHTML;
    }
    return eventsFallbackHtml;
  }

  function seedEventsList() {
    var list = document.getElementById("events-list");
    var html = ensureEventsFallback();
    if (list && html && !list.innerHTML.trim()) list.innerHTML = html;
  }

  function showGridSkeleton(container, count) {
    container.innerHTML = Array(count || 6)
      .fill(
        '<div class="card skeleton-card">' +
          '<div class="skeleton skeleton-heading"></div>' +
          '<div class="skeleton skeleton-text"></div>' +
          '<div class="skeleton skeleton-text"></div>' +
          '<div class="skeleton skeleton-text" style="width:60%"></div>' +
          "</div>"
      )
      .join("");
  }

  function restoreJobsFallback(container, variant) {
    var html = ensureJobsFallback();
    if (!container || !html) return;
    container.innerHTML = buildLiveNotice("jobs", variant || "fail") + html;
    initLucide();
  }

  function restoreEventsFallback(container, variant) {
    var html = ensureEventsFallback();
    if (!container || !html) return;
    container.innerHTML = buildLiveNotice("events", variant || "fail") + html;
    initLucide();
  }

  function restoreHomeEventsFallback(noticeVariant) {
    var container = document.getElementById("home-upcoming-events");
    var tpl = document.getElementById("home-events-fallback");
    if (!container || !tpl) return;
    var notice = noticeVariant
      ? buildLiveNotice("events", noticeVariant)
      : "";
    container.innerHTML =
      notice +
      tpl.innerHTML +
      '<a href="' +
      escapeHtml(LIVE_DATA_URLS.events) +
      '" target="_blank" rel="noopener noreferrer" class="see-all-link">View uOttawa events →</a>' +
      '<a href="events.html" class="see-all-link">See all campus events →</a>';
    initLucide();
  }

  function renderLiveJobs(container, jobs) {
    container.innerHTML = jobs
      .map(function (job) {
        var title = job.title || "Untitled Position";
        var location = job.locationsText || "Ottawa, ON";
        var posted = job.postedOn || "";
        var path = job.externalPath || "#";
        var jobUrl = LIVE_DATA_URLS.jobs + path;

        return (
          '<div class="card job-card">' +
          '<div class="job-card-header">' +
          '<span class="badge badge-employer">uOttawa</span>' +
          '<span class="job-posted">' +
          escapeHtml(posted) +
          "</span>" +
          "</div>" +
          '<h3 class="job-title">' +
          escapeHtml(title) +
          "</h3>" +
          '<p class="job-location"><i data-lucide="map-pin"></i> ' +
          escapeHtml(location) +
          "</p>" +
          '<div class="job-card-footer">' +
          '<a href="' +
          escapeHtml(jobUrl) +
          '" target="_blank" rel="noopener noreferrer" class="btn-primary">Apply</a>' +
          '<button type="button" class="btn-ghost" onclick="saveJob(' +
          JSON.stringify(title) +
          ')"><i data-lucide="heart"></i> Save</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");
    initLucide();
  }

  function parseUOttawaEventsFromHtml(htmlString) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlString || "", "text/html");

    var teasers = doc.querySelectorAll("article.article-teaser");
    if (teasers.length) {
      return Array.from(teasers)
        .slice(0, 10)
        .map(function (article) {
          var titleEl = article.querySelector("h2.headline a, h2 a");
          var dateEl = article.querySelector(".article-teaser__item-body-wordwrap strong");
          var descEl = article.querySelector(".article-teaser__item-text");
          var metaBlocks = article.querySelectorAll(".article-teaser__item-body-wordwrap.body");
          var location = "uOttawa Campus";
          metaBlocks.forEach(function (block) {
            var text = block.textContent.trim();
            if (/person|campus|hall|complex|room|online/i.test(text) && text.length < 120) {
              location = text;
            }
          });

          return {
            title: (titleEl && titleEl.textContent.trim()) || "",
            date: (dateEl && dateEl.textContent.trim().replace(/\s+/g, " ")) || "",
            location: location,
            description: (descEl && descEl.textContent.trim().slice(0, 120)) || "",
            url: (titleEl && titleEl.href) || LIVE_DATA_URLS.events,
          };
        })
        .filter(function (e) {
          return e.title.length > 0;
        });
    }

    var eventItems = doc.querySelectorAll(".views-row, article.event, .event-item");
    if (eventItems.length === 0) {
      eventItems = doc.querySelectorAll("h2.headline a, h2.headline--three-up-articles-item a");
      if (eventItems.length) {
        return Array.from(eventItems)
          .slice(0, 10)
          .map(function (link) {
            return {
              title: link.textContent.trim(),
              date: "",
              location: "uOttawa Campus",
              description: "",
              url: link.href || LIVE_DATA_URLS.events,
            };
          })
          .filter(function (e) {
            return e.title.length > 0;
          });
      }
      eventItems = doc.querySelectorAll("article");
    }
    if (eventItems.length === 0) return [];

    return Array.from(eventItems)
      .slice(0, 10)
      .map(function (item) {
        var titleEl = item.querySelector("h2 a, h3 a, .field--name-title a, a");
        var dateEl = item.querySelector("time, .field--name-field-date, .date-display-single");
        var locationEl = item.querySelector(".field--name-field-location, .location");
        var descEl = item.querySelector(".field--name-body, .description, p");

        return {
          title: (titleEl && titleEl.textContent.trim()) || "",
          date:
            (dateEl && dateEl.getAttribute("datetime")) ||
            (dateEl && dateEl.textContent.trim()) ||
            "",
          location: (locationEl && locationEl.textContent.trim()) || "uOttawa Campus",
          description: (descEl && descEl.textContent.trim().slice(0, 120)) || "",
          url: (titleEl && titleEl.href) || LIVE_DATA_URLS.events,
        };
      })
      .filter(function (e) {
        return e.title.length > 0;
      });
  }

  function renderLiveEvents(container, events) {
    container.innerHTML = events
      .map(function (event) {
        return (
          '<div class="card event-card">' +
          '<div class="event-card-header">' +
          '<span class="badge badge-event">Campus Event</span>' +
          '<span class="badge-live">🟢 Live</span>' +
          "</div>" +
          '<h3 class="event-title">' +
          escapeHtml(event.title) +
          "</h3>" +
          '<p class="event-meta"><i data-lucide="calendar"></i> ' +
          escapeHtml(event.date || "Date TBA") +
          "</p>" +
          '<p class="event-meta"><i data-lucide="map-pin"></i> ' +
          escapeHtml(event.location) +
          "</p>" +
          (event.description
            ? '<p class="event-desc">' + escapeHtml(event.description) + "...</p>"
            : "") +
          '<div class="event-card-footer">' +
          '<a href="' +
          escapeHtml(event.url) +
          '" target="_blank" rel="noopener noreferrer" class="btn-primary">View Event</a>' +
          '<button type="button" class="btn-ghost" onclick="rsvpEvent(' +
          JSON.stringify(event.title) +
          ')"><i data-lucide="check-circle"></i> RSVP</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");
    initLucide();
  }

  async function loadUOttawaJobs() {
    var liveGrid = document.getElementById("jobs-live-grid");
    var statusEl = document.getElementById("jobs-live-status");
    if (!liveGrid) return;

    ensureJobsFallback();
    hideFallbackSection("jobs-fallback-section");
    var testMode = getLiveTestMode("jobs");
    showGridSkeleton(liveGrid, 6);
    setLiveStatus(statusEl, "loading", "Loading live uOttawa jobs…");

    if (testMode === "loading") return;

    var jobsCompleted = false;

    try {
      if (testMode === "fail") {
        await delay(500);
        liveGrid.innerHTML = buildLiveNotice("jobs", "fail");
        showFallbackSection("jobs-fallback-section");
        var failGrid = document.getElementById("jobs-grid");
        if (failGrid && jobsFallbackHtml) failGrid.innerHTML = jobsFallbackHtml;
        setLiveStatus(statusEl, "error", "Live jobs unavailable — showing campus listings below.");
        initLucide();
        jobsCompleted = true;
        return;
      }
      if (testMode === "empty") {
        await delay(500);
        liveGrid.innerHTML = buildLiveNotice("jobs", "empty");
        showFallbackSection("jobs-fallback-section");
        var emptyGrid = document.getElementById("jobs-grid");
        if (emptyGrid && jobsFallbackHtml) emptyGrid.innerHTML = jobsFallbackHtml;
        setLiveStatus(statusEl, "error", "No live uOttawa postings at the moment.");
        initLucide();
        jobsCompleted = true;
        return;
      }
      if (testMode === "success") {
        await delay(500);
        renderLiveJobs(liveGrid, [
          {
            title: "Test — Student Services Assistant",
            locationsText: "Ottawa, ON",
            postedOn: "Posted today",
            externalPath: "/job/test",
          },
        ]);
        setLiveStatus(statusEl, "success", "🟢 1 live job from uOttawa (test mode)");
        jobsCompleted = true;
        return;
      }

      var jobs = await fetchCachedJobs();
      var fromCache = !!jobs;

      if (!jobs) {
        var payload = await fetchWithCorsProxy(
          WORKDAY_JOBS_API,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ appliedFacets: {}, limit: 20, offset: 0, searchText: "" }),
          },
          "json"
        );
        var data = JSON.parse(payload.text);
        jobs = data.jobPostings || [];
      }

      if (!jobs.length) {
        liveGrid.innerHTML = buildLiveNotice("jobs", "empty");
        showFallbackSection("jobs-fallback-section");
        var noJobsGrid = document.getElementById("jobs-grid");
        if (noJobsGrid && jobsFallbackHtml) noJobsGrid.innerHTML = jobsFallbackHtml;
        setLiveStatus(statusEl, "error", "No live uOttawa postings at the moment.");
        initLucide();
        jobsCompleted = true;
        return;
      }

      renderLiveJobs(liveGrid, jobs);
      hideFallbackSection("jobs-fallback-section");
      setLiveStatus(
        statusEl,
        "success",
        "🟢 " + jobs.length + " live jobs from uOttawa" + (fromCache ? " (cached)" : "")
      );
      jobsCompleted = true;
    } catch (err) {
      console.warn("[Peer Bring] Jobs load failed:", err.message);
      liveGrid.innerHTML = buildLiveNotice("jobs", "fail");
      showFallbackSection("jobs-fallback-section");
      var fallbackGrid = document.getElementById("jobs-grid");
      if (fallbackGrid && jobsFallbackHtml) fallbackGrid.innerHTML = jobsFallbackHtml;
      setLiveStatus(statusEl, "error", "Live jobs unavailable — showing campus listings below.");
      initLucide();
      jobsCompleted = true;
    } finally {
      if (!jobsCompleted && liveGrid.querySelector(".skeleton-card")) {
        showFallbackSection("jobs-fallback-section");
        var stuckGrid = document.getElementById("jobs-grid");
        if (stuckGrid && jobsFallbackHtml) stuckGrid.innerHTML = jobsFallbackHtml;
        liveGrid.innerHTML = buildLiveNotice("jobs", "fail");
        setLiveStatus(statusEl, "error", "Timed out loading live jobs — showing campus listings below.");
        initLucide();
      }
    }
  }

  async function loadUOttawaEvents() {
    var liveList = document.getElementById("events-live-list");
    var statusEl = document.getElementById("events-live-status");
    if (!liveList) return;

    initLiveDataFallbacks();
    ensureEventsFallback();
    hideFallbackSection("events-fallback-section");
    var testMode = getLiveTestMode("events");
    showGridSkeleton(liveList, 4);
    setLiveStatus(statusEl, "loading", "Loading live uOttawa events…");

    if (testMode === "loading") return;

    var eventsCompleted = false;

    try {
      if (testMode === "fail") {
        await delay(500);
        liveList.innerHTML = buildLiveNotice("events", "fail");
        showFallbackSection("events-fallback-section");
        seedEventsFallbackList();
        setLiveStatus(statusEl, "error", "Live events unavailable — showing sample events below.");
        initLucide();
        eventsCompleted = true;
        return;
      }
      if (testMode === "empty") {
        await delay(500);
        liveList.innerHTML = buildLiveNotice("events", "empty");
        showFallbackSection("events-fallback-section");
        seedEventsFallbackList();
        setLiveStatus(statusEl, "error", "No live campus events found.");
        initLucide();
        eventsCompleted = true;
        return;
      }
      if (testMode === "success") {
        await delay(500);
        renderLiveEvents(liveList, [
          {
            title: "Test — uOttawa Open House",
            date: "Saturday, September 12",
            location: "uOttawa Campus",
            description: "Preview day for prospective students.",
            url: LIVE_DATA_URLS.events,
          },
        ]);
        setLiveStatus(statusEl, "success", "🟢 1 live event from uOttawa (test mode)");
        eventsCompleted = true;
        return;
      }

      var events = await fetchCachedEvents();
      var fromCache = !!events;

      if (!events) {
        var payload = await fetchWithCorsProxy(LIVE_DATA_URLS.events, { method: "GET" }, "html");
        events = parseUOttawaEventsFromHtml(payload.text);
      }

      if (!events.length) {
        liveList.innerHTML = buildLiveNotice("events", "parse");
        showFallbackSection("events-fallback-section");
        seedEventsFallbackList();
        setLiveStatus(statusEl, "error", "Could not parse live events — showing sample events below.");
        initLucide();
        eventsCompleted = true;
        return;
      }

      renderLiveEvents(liveList, events);
      hideFallbackSection("events-fallback-section");
      setLiveStatus(
        statusEl,
        "success",
        "🟢 " + events.length + " live events from uOttawa" + (fromCache ? " (cached)" : "")
      );
      eventsCompleted = true;
    } catch (err) {
      console.warn("[Peer Bring] Events load failed:", err.message);
      liveList.innerHTML = buildLiveNotice("events", "fail");
      showFallbackSection("events-fallback-section");
      seedEventsFallbackList();
      setLiveStatus(statusEl, "error", "Live events unavailable — showing sample events below.");
      initLucide();
      eventsCompleted = true;
    } finally {
      if (!eventsCompleted && liveList.querySelector(".skeleton-card")) {
        liveList.innerHTML = buildLiveNotice("events", "fail");
        showFallbackSection("events-fallback-section");
        seedEventsFallbackList();
        setLiveStatus(statusEl, "error", "Timed out loading live events — showing sample events below.");
        initLucide();
      }
    }
  }

  async function loadHomeEvents() {
    var container = document.getElementById("home-upcoming-events");
    if (!container) return;

    var testMode = getLiveTestMode("home");
    container.innerHTML = '<div class="loading-text">Loading events from uOttawa...</div>';

    if (testMode === "loading") return;

    try {
      if (testMode === "fail" || testMode === "empty" || testMode === "parse") {
        await delay(400);
        restoreHomeEventsFallback(testMode);
        return;
      }
      if (testMode === "success") {
        await delay(400);
        container.innerHTML =
          '<div class="reminder-item">' +
          '<div class="reminder-content">' +
          '<span class="reminder-title">Test — uOttawa Open House</span>' +
          '<span class="reminder-time">Saturday, September 12</span>' +
          "</div>" +
          '<a href="' +
          escapeHtml(LIVE_DATA_URLS.events) +
          '" target="_blank" rel="noopener noreferrer" class="badge badge-event">View</a>' +
          "</div>" +
          '<a href="events.html" class="see-all-link">See all campus events →</a>';
        initLucide();
        return;
      }

      var events = await fetchCachedEvents();
      if (!events) {
        var payload = await fetchWithCorsProxy(LIVE_DATA_URLS.events, { method: "GET" }, "html");
        events = parseUOttawaEventsFromHtml(payload.text);
      }
      events = (events || []).slice(0, 3);
      if (!events.length) {
        restoreHomeEventsFallback("parse");
        return;
      }

      container.innerHTML =
        events
          .map(function (e) {
            return (
              '<div class="reminder-item">' +
              '<div class="reminder-content">' +
              '<span class="reminder-title">' +
              escapeHtml(e.title) +
              "</span>" +
              '<span class="reminder-time">' +
              escapeHtml(e.date || "Upcoming") +
              "</span>" +
              "</div>" +
              '<a href="' +
              escapeHtml(e.url) +
              '" target="_blank" rel="noopener noreferrer" class="badge badge-event">View</a>' +
              "</div>"
            );
          })
          .join("") +
        '<a href="events.html" class="see-all-link">See all campus events →</a>';

      initLucide();
    } catch (err) {
      restoreHomeEventsFallback("fail");
    }
  }

  window.saveJob = function (title) {
    showToast("Job saved: " + (title || "Listing"));
  };

  window.rsvpEvent = function (title) {
    showToast("RSVP recorded: " + (title || "Event"));
  };

  window.parseUOttawaEventsFromHtml = parseUOttawaEventsFromHtml;

  /** Open / close modal overlays (uses .is-open for smooth transitions) */
  function openModalOverlay(el) {
    if (!el) return;
    document.querySelectorAll(".modal-overlay.is-open").forEach(function (o) {
      if (o !== el) o.classList.remove("is-open");
    });
    el.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModalOverlay(el) {
    if (!el) return;
    el.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /** Job detail content keyed by data-job-id on cards */
  var JOBS_DATA = {
    1: {
      title: "Library Assistant",
      employer: "Brooklyn College Library",
      type: "On-Campus",
      pay: "$16/hr",
      hours: "10 hrs/wk",
      posted: "Mar 10, 2025",
      tags: ["Part-Time", "Work-Study", "Flexible"],
      desc:
        "Help students find resources, shelve books, and assist at the circulation desk. You'll work alongside full-time staff during peak hours and help maintain an organized, welcoming library environment.",
      reqs: [
        "Work-study eligibility required",
        "Customer service experience preferred",
        "Ability to lift up to 25 lbs for shelving",
        "Professional communication with students and faculty",
      ],
      deadline: "April 15, 2025",
    },
    2: {
      title: "IT Help Desk Technician",
      employer: "BC IT Department",
      type: "On-Campus",
      pay: "$18/hr",
      hours: "15 hrs/wk",
      posted: "Mar 8, 2025",
      tags: ["Part-Time", "On-Campus"],
      desc:
        "Provide tech support to students and faculty. Basic troubleshooting required. You'll handle password resets, Wi-Fi issues, and software questions at the campus help desk.",
      reqs: [
        "Familiarity with Windows and macOS",
        "Strong communication skills",
        "Patience with non-technical users",
        "Willingness to learn ticketing systems",
      ],
      deadline: "April 1, 2025",
    },
    3: {
      title: "Research Assistant",
      employer: "Psychology Dept",
      type: "On-Campus",
      pay: "$17/hr",
      hours: "12 hrs/wk",
      posted: "Mar 5, 2025",
      tags: ["Research", "Part-Time"],
      desc:
        "Assist Professor Chen with data collection and analysis for an ongoing study. Tasks include literature reviews, survey administration, and data entry.",
      reqs: [
        "Intro stats or research methods coursework",
        "Attention to detail",
        "Confidentiality with participant data",
        "Proficiency with Excel or SPSS a plus",
      ],
      deadline: "March 28, 2025",
    },
    4: {
      title: "Barista",
      employer: "Campus Coffee Co.",
      type: "Local Business",
      pay: "$16/hr + tips",
      hours: "20 hrs/wk",
      posted: "Mar 12, 2025",
      tags: ["Food & Service", "Flexible"],
      desc:
        "Busy campus café looking for friendly baristas. Training provided. Morning and afternoon shifts available near the student center.",
      reqs: [
        "Food handler certification (or willing to obtain)",
        "Reliable schedule",
        "Positive attitude in fast-paced environment",
      ],
      deadline: "Rolling",
    },
    5: {
      title: "Social Media Intern",
      employer: "Student Affairs",
      type: "On-Campus",
      pay: "$15/hr",
      hours: "8 hrs/wk",
      posted: "Mar 11, 2025",
      tags: ["Internship", "Part-Time"],
      desc:
        "Create content for BC's Instagram and TikTok. Must know Canva. You'll collaborate with the communications team on campaigns and student spotlights.",
      reqs: [
        "Portfolio or sample posts",
        "Knowledge of Canva or similar tools",
        "Understanding of campus tone and audience",
      ],
      deadline: "April 10, 2025",
    },
    6: {
      title: "Math Tutor",
      employer: "Academic Success Center",
      type: "On-Campus",
      pay: "$20/hr",
      hours: "Flexible hrs",
      posted: "Mar 9, 2025",
      tags: ["Tutoring", "Flexible"],
      desc:
        "Tutor students in Calculus I & II. Strong math background required. Sessions are scheduled around your availability.",
      reqs: [
        "B or better in Calc II",
        "Completion of tutor orientation",
        "Two faculty references",
      ],
      deadline: "April 5, 2025",
    },
    7: {
      title: "Campus Tour Guide",
      employer: "Admissions Office",
      type: "On-Campus",
      pay: "$16/hr",
      hours: "Weekends",
      posted: "Mar 6, 2025",
      tags: ["Part-Time", "On-Campus"],
      desc:
        "Lead prospective students on tours. Must be enthusiastic and reliable. Weekend availability is required during visit season.",
      reqs: [
        "Public speaking comfort",
        "Knowledge of campus layout and programs",
        "Punctuality and professional appearance",
      ],
      deadline: "March 30, 2025",
    },
    8: {
      title: "Web Dev Intern",
      employer: "BC StartupHub",
      type: "Local Business",
      pay: "$22/hr",
      hours: "15 hrs/wk",
      posted: "Mar 7, 2025",
      tags: ["Tech", "Internship"],
      desc:
        "Help build internal tools using React. Portfolio required. You'll work with a small product team on dashboards used by student founders.",
      reqs: [
        "React portfolio project",
        "Git basics",
        "Ability to work 15 hrs/wk on-site or hybrid",
      ],
      deadline: "April 20, 2025",
    },
  };

  var ROOMMATE_DATA = {
    1: {
      name: "Alex J.",
      major: "Computer Science · Junior",
      budget: "$900–1,100/mo",
      moveIn: "Immediately",
      location: "Near Campus",
      tags: ["Night Owl", "Quiet", "No Smoking"],
      match: 87,
      bioShort: "Looking for someone chill who respects study time. Work nights so I sleep days.",
      bioLong:
        "I'm a CS junior who works overnight shifts a few days a week, so I need roommates who are okay with quiet during the day. I keep common areas tidy and I'm looking for a respectful, low-drama household near campus or a short train ride.",
      schedule: "Night owl — typically awake 6pm–8am on work weeks.",
      pets: true,
      smoking: false,
      guests: true,
      quietHours: true,
      ideal: "2BR near campus, in-unit laundry preferred, no loud parties on weeknights.",
    },
    2: {
      name: "Mia L.",
      major: "Nursing · Senior",
      budget: "$800–1,000/mo",
      moveIn: "Next Month",
      location: "Flatbush",
      tags: ["Early Bird", "Clean", "Pet-Friendly"],
      match: 91,
      bioShort: "Have a cat 🐱. Need someone pet-friendly and responsible.",
      bioLong:
        "Senior nursing student with a calm indoor cat. I wake up early for clinicals and keep a clean apartment. Hoping to find someone who loves animals and communicates clearly about shared spaces.",
      schedule: "Early bird — up at 5:30am most weekdays.",
      pets: true,
      smoking: false,
      guests: true,
      quietHours: true,
      ideal: "Pet-friendly building, 2BR, roommate okay with cat on shared furniture with covers.",
    },
    3: {
      name: "Tyler W.",
      major: "Business · Junior",
      budget: "$1,000–1,300/mo",
      moveIn: "This Summer",
      location: "Downtown Brooklyn",
      tags: ["Social", "Active", "Non-Smoker"],
      match: 78,
      bioShort: "Looking for 2–3 roommates for a shared apartment. Love cooking.",
      bioLong:
        "Junior in business who enjoys hosting small dinners and exploring the city. Looking for social roommates who split chores fairly and want to make the apartment feel like home.",
      schedule: "Flexible — classes midday, gym evenings.",
      pets: false,
      smoking: false,
      guests: true,
      quietHours: false,
      ideal: "3BR in Downtown Brooklyn, budget flexible for the right spot.",
    },
    4: {
      name: "Zara H.",
      major: "Psychology · Sophomore",
      budget: "$850–1,050/mo",
      moveIn: "Immediately",
      location: "Crown Heights",
      tags: ["Quiet", "Studious", "Clean"],
      match: 94,
      bioShort: "Introverted but friendly. Need a calm environment for studying.",
      bioLong:
        "Psych major who spends a lot of time reading and writing papers. I value quiet during exam weeks and appreciate direct communication about noise and guests.",
      schedule: "Mixed — prefers quiet after 10pm.",
      pets: false,
      smoking: false,
      guests: false,
      quietHours: true,
      ideal: "Quiet 1–2BR, study-friendly, non-smoking household.",
    },
    5: {
      name: "Carlos M.",
      major: "Engineering · Junior",
      budget: "$950–1,200/mo",
      moveIn: "Next Month",
      location: "Near Campus",
      tags: ["Flexible", "Social", "Gym-goer"],
      match: 82,
      bioShort: "Open to most people. Just need someone reliable with rent.",
      bioLong:
        "Engineering student who hits the gym regularly and doesn't mind occasional friends over. Main priority is everyone pays on time and respects shared utilities.",
      schedule: "Moderate night owl on weekends only.",
      pets: false,
      smoking: false,
      guests: true,
      quietHours: true,
      ideal: "2BR near campus, no smoking inside.",
    },
    6: {
      name: "Aisha P.",
      major: "Art · Junior",
      budget: "$700–900/mo",
      moveIn: "This Summer",
      location: "Bushwick",
      tags: ["Creative", "Night Owl", "Social"],
      match: 76,
      bioShort: "Looking for artistic types in Bushwick. Would love a studio apartment to share.",
      bioLong:
        "Studio art major working on a thesis show. I keep creative mess contained to my room and love collaborating with roommates on small projects and neighborhood events.",
      schedule: "Night owl — often in studio late.",
      pets: false,
      smoking: false,
      guests: true,
      quietHours: false,
      ideal: "Bushwick 2BR or large 1BR split, natural light, art-friendly.",
    },
    7: {
      name: "Ben K.",
      major: "Finance · Senior",
      budget: "$1,100–1,400/mo",
      moveIn: "Immediately",
      location: "Downtown Brooklyn",
      tags: ["Professional", "Quiet", "Non-Smoker"],
      match: 88,
      bioShort: "Internship in Manhattan. Need a quiet place to decompress.",
      bioLong:
        "Senior commuting to a finance internship. I'm tidy, quiet after 9pm, and looking for professionals or serious students who value a calm home base.",
      schedule: "Early mornings, early bed on weeknights.",
      pets: false,
      smoking: false,
      guests: false,
      quietHours: true,
      ideal: "Luxury rental or renovated 2BR, close to multiple subway lines.",
    },
    8: {
      name: "Nina S.",
      major: "Biology · Sophomore",
      budget: "$800–1,000/mo",
      moveIn: "Next Month",
      location: "Flatbush",
      tags: ["Early Bird", "Clean", "Studious"],
      match: 90,
      bioShort: "Pre-med, very busy schedule. Need a clean and understanding roommate.",
      bioLong:
        "Pre-med sophomore juggling labs and volunteering. I meal-prep Sundays and keep the kitchen spotless. Hoping for a roommate with similar cleanliness standards.",
      schedule: "Early bird — library most evenings.",
      pets: false,
      smoking: false,
      guests: true,
      quietHours: true,
      ideal: "2BR in Flatbush, laundry in building, study-friendly.",
    },
  };

  function fillJobModal(id) {
    var d = JOBS_DATA[id];
    if (!d) return;
    var title = document.getElementById("job-detail-title");
    var employer = document.getElementById("job-detail-employer");
    var meta = document.getElementById("job-detail-meta");
    var desc = document.getElementById("job-detail-desc");
    var reqs = document.getElementById("job-detail-reqs");
    var deadline = document.getElementById("job-detail-deadline");
    if (title) title.textContent = d.title;
    if (employer) employer.textContent = d.employer;
    if (meta) {
      meta.textContent = d.pay + " · " + d.hours + " · Posted " + d.posted;
    }
    if (desc) desc.textContent = d.desc;
    if (deadline) deadline.textContent = d.deadline;
    if (reqs) {
      reqs.innerHTML = "";
      d.reqs.forEach(function (r) {
        var li = document.createElement("li");
        li.textContent = r;
        reqs.appendChild(li);
      });
    }
    var saveBtn = document.getElementById("job-modal-save");
    if (saveBtn) {
      saveBtn.setAttribute("data-saved", "false");
      saveBtn.textContent = "Save Job";
    }
  }

  function fillRoommateModal(id) {
    var d = ROOMMATE_DATA[id];
    if (!d) return;
    var set = function (tid, text) {
      var el = document.getElementById(tid);
      if (el) el.textContent = text;
    };
    set("rm-modal-name", d.name);
    set("rm-modal-major", d.major);
    set("rm-modal-budget", d.budget);
    set("rm-modal-move", d.moveIn);
    set("rm-modal-loc", d.location);
    set("rm-modal-bio", d.bioLong);
    set("rm-modal-schedule", d.schedule);
    set("rm-modal-ideal", d.ideal);
    var av = document.getElementById("rm-modal-avatar");
    if (av) {
      av.textContent = d.name
        .split(" ")
        .map(function (p) {
          return p[0];
        })
        .join("");
    }
    set("rm-check-pets", d.pets ? "✓" : "✗");
    set("rm-check-smoke", d.smoking ? "✓" : "✗");
    set("rm-check-guests", d.guests ? "✓" : "✗");
    set("rm-check-quiet", d.quietHours ? "✓" : "✗");
    var saveBtn = document.getElementById("rm-modal-save");
    if (saveBtn) {
      saveBtn.setAttribute("data-saved", "false");
      saveBtn.textContent = "Save Profile";
    }
  }

  function initModalSystem() {
    document.querySelectorAll("[data-open-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-open-modal");
        var modal = id ? document.getElementById(id) : null;
        if (modal) openModalOverlay(modal);
      });
    });

    document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModalOverlay(overlay);
      });
    });

    document.querySelectorAll("[data-modal-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var overlay = btn.closest(".modal-overlay");
        if (overlay) closeModalOverlay(overlay);
      });
    });
  }

  function initJobBoardPage() {
    var grid = document.getElementById("jobs-grid") || document.querySelector(".jobs-grid");
    var detailModal = document.getElementById("modal-job-detail");
    if (grid && detailModal) {
      grid.addEventListener("click", function (e) {
        var t = e.target;
        if (t.closest(".save-btn")) return;
        var card = t.closest(".job-card[data-job-id]");
        if (!card) return;
        var id = card.getAttribute("data-job-id");
        if (id) {
          fillJobModal(id);
          openModalOverlay(detailModal);
        }
      });
    }

    var saveJob = document.getElementById("job-modal-save");
    if (saveJob) {
      saveJob.addEventListener("click", function () {
        var saved = saveJob.getAttribute("data-saved") === "true";
        saveJob.setAttribute("data-saved", saved ? "false" : "true");
        saveJob.textContent = saved ? "Save Job" : "Saved ✓";
      });
    }

    var postForm = document.getElementById("form-post-job");
    if (postForm) {
      postForm.addEventListener("submit", function (e) {
        e.preventDefault();
        closeModalOverlay(document.getElementById("modal-post-job"));
        showToast("Posted successfully!");
        postForm.reset();
      });
    }
  }

  function initTutorsPage() {
    var bookModal = document.getElementById("modal-book-session");
    var totalEl = document.getElementById("book-total-preview");

    document.querySelectorAll(".btn-book-session").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var rate = btn.getAttribute("data-rate") || "25";
        var name = btn.getAttribute("data-tutor-name") || "Tutor";
        var nameEl = document.getElementById("book-tutor-name");
        if (nameEl) nameEl.textContent = name;
        if (totalEl) totalEl.textContent = "1 hr × $" + rate + " = $" + rate;
        if (bookModal) openModalOverlay(bookModal);
      });
    });

    var tutorForm = document.getElementById("form-become-tutor");
    if (tutorForm) {
      tutorForm.addEventListener("submit", function (e) {
        e.preventDefault();
        closeModalOverlay(document.getElementById("modal-become-tutor"));
        showToast("Posted successfully!");
        tutorForm.reset();
      });
    }

    if (bookModal) {
      bookModal.querySelectorAll(".booking-calendar__day").forEach(function (day) {
        day.addEventListener("click", function () {
          bookModal.querySelectorAll(".booking-calendar__day").forEach(function (d) {
            d.classList.remove("is-selected");
          });
          day.classList.add("is-selected");
        });
      });
      bookModal.querySelectorAll(".time-slot-row button").forEach(function (b) {
        b.addEventListener("click", function () {
          var row = b.closest(".time-slot-row");
          if (row) {
            row.querySelectorAll("button").forEach(function (x) {
              x.classList.remove("active");
            });
          }
          b.classList.add("active");
        });
      });
      bookModal.querySelectorAll(".format-toggle-row .btn-ghost").forEach(function (b) {
        b.addEventListener("click", function () {
          bookModal.querySelectorAll(".format-toggle-row .btn-ghost").forEach(function (x) {
            x.classList.remove("active");
          });
          b.classList.add("active");
        });
      });
    }

    var confirmBook = document.getElementById("btn-confirm-booking");
    if (confirmBook) {
      confirmBook.addEventListener("click", function () {
        closeModalOverlay(document.getElementById("modal-book-session"));
        showToast("Booking request sent!");
      });
    }
  }

  function initRoommatesPage() {
    document.querySelectorAll(".btn-view-roommate").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-roommate-id");
        if (id) fillRoommateModal(id);
        var modal = document.getElementById("modal-roommate-profile");
        if (modal) openModalOverlay(modal);
      });
    });

    var rmForm = document.getElementById("form-create-profile");
    if (rmForm) {
      rmForm.addEventListener("submit", function (e) {
        e.preventDefault();
        closeModalOverlay(document.getElementById("modal-create-profile"));
        showToast("Posted successfully!");
        rmForm.reset();
      });
    }

    var saveRm = document.getElementById("rm-modal-save");
    if (saveRm) {
      saveRm.addEventListener("click", function () {
        var saved = saveRm.getAttribute("data-saved") === "true";
        saveRm.setAttribute("data-saved", saved ? "false" : "true");
        saveRm.textContent = saved ? "Save Profile" : "Saved ✓";
      });
    }
  }

  /** Filter chips: one active per .filter-group */
  function initFilterGroups() {
    document.querySelectorAll(".filter-group").forEach(function (group) {
      var opts = group.querySelectorAll(".filter-option");
      opts.forEach(function (opt) {
        opt.addEventListener("click", function () {
          opts.forEach(function (o) {
            o.classList.remove("active");
          });
          opt.classList.add("active");
        });
      });
    });
  }

  function initMobileFilterDrawers() {
    function syncToggleExpanded(targetId, open) {
      document.querySelectorAll('[data-filters-toggle="' + targetId + '"]').forEach(function (t) {
        t.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-filters-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-filters-toggle");
        var el = targetId ? document.getElementById(targetId) : null;
        var backdropId = btn.getAttribute("data-filters-backdrop");
        var backdrop = backdropId ? document.getElementById(backdropId) : null;
        if (!el) return;
        el.classList.toggle("filters-drawer-open");
        var open = el.classList.contains("filters-drawer-open");
        if (backdrop) backdrop.classList.toggle("is-open", open);
        syncToggleExpanded(targetId, open);
      });
    });

    document.querySelectorAll("[data-filters-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-filters-close");
        var el = targetId ? document.getElementById(targetId) : null;
        var backdropId = btn.getAttribute("data-filters-backdrop");
        var backdrop = backdropId ? document.getElementById(backdropId) : null;
        if (el) el.classList.remove("filters-drawer-open");
        if (backdrop) backdrop.classList.remove("is-open");
        if (targetId) syncToggleExpanded(targetId, false);
      });
    });

    document.querySelectorAll(".filter-backdrop").forEach(function (bd) {
      bd.addEventListener("click", function () {
        bd.classList.remove("is-open");
        var forId = bd.getAttribute("data-for-drawer");
        if (forId) {
          var el = document.getElementById(forId);
          if (el) el.classList.remove("filters-drawer-open");
          syncToggleExpanded(forId, false);
        }
      });
    });
  }

  function initCompatibilityBars() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.querySelectorAll(".compatibility-fill[data-match]").forEach(function (el) {
          var v = el.getAttribute("data-match");
          if (v) el.style.width = v + "%";
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLiveDataFallbacks();

    if (document.getElementById("jobs-live-grid")) {
      loadUOttawaJobs();
    }
    if (document.getElementById("events-live-list")) {
      loadUOttawaEvents();
    }
    if (document.getElementById("home-upcoming-events")) {
      loadHomeEvents();
    }

    setActiveNav();
    initProfileTabs();
    initMessages();
    initHagglitToggle();
    initQuickActions();
    initMarketplaceHagglit();
    initMarketplaceFilters();
    initHagglitList();
    initModalSystem();
    initFilterGroups();
    initMobileFilterDrawers();
    initJobBoardPage();
    initTutorsPage();
    initRoommatesPage();
    initCompatibilityBars();
    initLucide();
  });
})();
