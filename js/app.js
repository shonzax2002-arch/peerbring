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

  document.addEventListener("DOMContentLoaded", function () {
    setActiveNav();
    initProfileTabs();
    initMessages();
    initHagglitToggle();
    initQuickActions();
    initMarketplaceHagglit();
    initMarketplaceFilters();
    initHagglitList();
    initLucide();
  });
})();
