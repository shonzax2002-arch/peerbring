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

  /** Demo “today” for calendars and agendas (matches home hero) */
  var DEMO_TODAY = "2026-03-14";

  /** In-memory reminders from “Add Reminder” (session only) */
  var SESSION_REMINDERS = [];

  var EVENTS_DATA = [
    {
      id: 1,
      title: "CS301 Exam",
      date: "2026-03-14",
      time: "9:00 AM",
      category: "coursework",
      course: "CS301",
      location: "Room 402",
      urgent: true,
      description:
        "Midterm exam covering data structures, recursion, and algorithmic complexity. Bring pencils and your student ID. Calculators are not allowed.",
    },
    {
      id: 2,
      title: "Group Project Due",
      date: "2026-03-16",
      time: "11:59 PM",
      category: "coursework",
      course: "CS220",
      location: "Canvas — submit PDF and slides",
      urgent: false,
      description:
        "Final deliverable for the data structures group project. Upload your report, presentation slides, and link to your repository before the deadline.",
    },
    {
      id: 3,
      title: "Spring Career Fair",
      date: "2026-03-18",
      time: "1:00 PM",
      category: "campus",
      location: "Student Center",
      urgent: false,
      description:
        "Meet employers hiring for internships, part-time roles, and summer opportunities. Bring copies of your resume and dress business casual.",
    },
    {
      id: 4,
      title: "Professor Office Hours",
      date: "2026-03-20",
      time: "3:00 PM",
      category: "coursework",
      course: "CS301",
      location: "Library West",
      urgent: false,
      description: "Drop-in Q&A with Professor Lin before the midterm. No appointment needed — first come, first served.",
    },
    {
      id: 5,
      title: "Tuition Payment Reminder",
      date: "2026-03-22",
      time: "12:00 PM",
      category: "personal",
      location: "Student Financial Services portal",
      urgent: false,
      description: "Confirm your spring balance and submit payment or set up a payment plan before the deadline to avoid late fees.",
    },
    {
      id: 6,
      title: "Housing Mixer",
      date: "2026-03-24",
      time: "6:30 PM",
      category: "campus",
      location: "Residence Hall Lounge",
      urgent: false,
      description:
        "Meet students looking for roommates and off-campus housing options. RAs and off-campus ambassadors will be there to answer questions.",
    },
    {
      id: 7,
      title: "Coding Club Meetup",
      date: "2026-03-26",
      time: "7:00 PM",
      category: "campus",
      location: "Tech Building 302",
      urgent: false,
      description: "Weekly meetup: short talk on Git workflows, then open project time. Snacks provided. All skill levels welcome.",
    },
    {
      id: 8,
      title: "Midterm Review Session",
      date: "2026-03-28",
      time: "5:00 PM",
      category: "coursework",
      course: "MATH201",
      location: "Science Building 204",
      urgent: false,
      description:
        "TA-led review for the midterm: practice problems on limits, continuity, and derivatives. Bring your notes and past homework.",
    },
    {
      id: 9,
      title: "Student Government Town Hall",
      date: "2026-03-30",
      time: "4:00 PM",
      category: "campus",
      location: "Main Auditorium",
      urgent: false,
      description:
        "Open forum on dining plan changes, library hours, and campus sustainability proposals. Submit questions in advance or ask live.",
    },
    {
      id: 10,
      title: "Lab Report Submission",
      date: "2026-04-02",
      time: "10:00 PM",
      category: "coursework",
      course: "CHEM110",
      location: "Canvas",
      urgent: false,
      description:
        "Upload your formatted lab report including procedure, data tables, and conclusions. Late submissions lose 10% per day.",
    },
  ];

  function getAllEvents() {
    return EVENTS_DATA.concat(SESSION_REMINDERS);
  }

  function getEventById(id) {
    var sid = String(id);
    var all = getAllEvents();
    for (var i = 0; i < all.length; i++) {
      if (String(all[i].id) === sid) return all[i];
    }
    return null;
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function toISODate(y, monthIndex, day) {
    return y + "-" + pad2(monthIndex + 1) + "-" + pad2(day);
  }

  function formatLongDate(iso) {
    var p = iso.split("-");
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  function monthLabel(year, monthIndex) {
    return new Date(year, monthIndex, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  function eventsForDate(iso) {
    return getAllEvents().filter(function (e) {
      return e.date === iso;
    });
  }

  function categoryDotsForDay(iso) {
    var evs = eventsForDate(iso);
    var has = { coursework: false, campus: false, personal: false };
    evs.forEach(function (e) {
      if (e.category === "coursework") has.coursework = true;
      else if (e.category === "campus") has.campus = true;
      else if (e.category === "personal") has.personal = true;
    });
    return has;
  }

  function buildMonthCells(year, monthIndex) {
    var first = new Date(year, monthIndex, 1);
    var pad = first.getDay();
    var n = new Date(year, monthIndex + 1, 0).getDate();
    var cells = [];
    var i;
    for (i = 0; i < pad; i++) cells.push(null);
    for (i = 1; i <= n; i++) cells.push(i);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  var homeCalState = { year: 2026, month: 2, selected: DEMO_TODAY };
  var eventsCalState = { year: 2026, month: 2, selected: DEMO_TODAY };

  function renderMonthGrid(container, year, monthIndex, selectedIso, todayIso, onSelect) {
    if (!container) return;
    var cells = buildMonthCells(year, monthIndex);
    container.innerHTML = "";
    cells.forEach(function (day) {
      if (day === null) {
        var empty = document.createElement("div");
        empty.className = "cal-day cal-day--empty";
        empty.setAttribute("aria-hidden", "true");
        container.appendChild(empty);
        return;
      }
      var iso = toISODate(year, monthIndex, day);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.setAttribute("data-iso", iso);
      btn.setAttribute("aria-label", "Day " + day);

      var num = document.createElement("span");
      num.className = "cal-day__num";
      num.textContent = String(day);
      btn.appendChild(num);

      var dots = document.createElement("div");
      dots.className = "cal-day__dots";
      var dset = categoryDotsForDay(iso);
      if (dset.coursework) {
        var c1 = document.createElement("span");
        c1.className = "cal-dot cal-dot--coursework";
        c1.title = "Coursework";
        dots.appendChild(c1);
      }
      if (dset.campus) {
        var c2 = document.createElement("span");
        c2.className = "cal-dot cal-dot--campus";
        c2.title = "Campus event";
        dots.appendChild(c2);
      }
      if (dset.personal) {
        var c3 = document.createElement("span");
        c3.className = "cal-dot cal-dot--personal";
        c3.title = "Personal";
        dots.appendChild(c3);
      }
      btn.appendChild(dots);

      if (iso === todayIso) btn.classList.add("cal-day--today");
      if (iso === selectedIso) btn.classList.add("cal-day--selected");

      btn.addEventListener("click", function () {
        onSelect(iso);
      });

      container.appendChild(btn);
    });
  }

  function getUpcomingFrom(isoStart, limit) {
    var all = getAllEvents().slice();
    all.sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return 0;
    });
    var out = [];
    for (var i = 0; i < all.length && out.length < limit; i++) {
      if (all[i].date >= isoStart) out.push(all[i]);
    }
    return out;
  }

  function categoryBadgeClass(cat) {
    if (cat === "coursework") return "badge-cat-coursework";
    if (cat === "campus") return "badge-cat-campus";
    return "badge-cat-personal";
  }

  function categoryLabel(cat) {
    if (cat === "coursework") return "Coursework";
    if (cat === "campus") return "Campus Event";
    return "Personal Reminder";
  }

  function renderAgendaList(listEl, hintEl, selectedIso) {
    if (!listEl) return;
    listEl.innerHTML = "";
    var items = eventsForDate(selectedIso);
    var hintText = formatLongDate(selectedIso);
    var showFallback = items.length === 0;
    if (showFallback) {
      items = getUpcomingFrom(DEMO_TODAY, 6);
      hintText = "No events on " + formatLongDate(selectedIso) + " — coming up";
    }
    if (hintEl) hintEl.textContent = hintText;

    items.forEach(function (ev) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "agenda-row";
      row.setAttribute("data-event-id", String(ev.id));

      var mark = document.createElement("span");
      mark.className = "agenda-row__marker agenda-row__marker--" + (ev.category || "coursework");
      row.appendChild(mark);

      var main = document.createElement("div");
      main.className = "agenda-row__main";
      var t = document.createElement("p");
      t.className = "agenda-row__title";
      t.textContent = ev.title;
      main.appendChild(t);
      var meta = document.createElement("p");
      meta.className = "agenda-row__meta";
      meta.textContent = ev.time + (ev.location ? " · " + ev.location : "");
      main.appendChild(meta);
      var badges = document.createElement("div");
      badges.className = "agenda-row__badges";
      var b1 = document.createElement("span");
      b1.className = categoryBadgeClass(ev.category);
      b1.textContent = categoryLabel(ev.category);
      badges.appendChild(b1);
      if (ev.urgent) {
        var b2 = document.createElement("span");
        b2.className = "badge-urgent";
        b2.textContent = "Urgent";
        badges.appendChild(b2);
      }
      main.appendChild(badges);
      row.appendChild(main);
      listEl.appendChild(row);
    });
  }

  function refreshHomeCalendar() {
    var grid = document.getElementById("home-cal-grid");
    var label = document.getElementById("home-cal-month-label");
    if (!grid) return;
    if (label) label.textContent = monthLabel(homeCalState.year, homeCalState.month);
    renderMonthGrid(
      grid,
      homeCalState.year,
      homeCalState.month,
      homeCalState.selected,
      DEMO_TODAY,
      function (iso) {
        homeCalState.selected = iso;
        refreshHomeCalendar();
      }
    );
    renderAgendaList(document.getElementById("home-agenda-list"), document.getElementById("home-agenda-hint"), homeCalState.selected);
    initLucide();
  }

  function refreshEventsPageCalendar() {
    var grid = document.getElementById("events-full-cal-grid");
    var label = document.getElementById("events-cal-month-label");
    if (!grid) return;
    if (label) label.textContent = monthLabel(eventsCalState.year, eventsCalState.month);
    renderMonthGrid(
      grid,
      eventsCalState.year,
      eventsCalState.month,
      eventsCalState.selected,
      DEMO_TODAY,
      function (iso) {
        eventsCalState.selected = iso;
        refreshEventsPageCalendar();
      }
    );
    initLucide();
  }

  function openEventDetailModal(id) {
    var ev = getEventById(id);
    if (!ev) return;
    var modal = document.getElementById("event-detail-modal");
    if (!modal) return;

    var title = document.getElementById("event-detail-title");
    var dt = document.getElementById("event-detail-datetime");
    var badges = document.getElementById("event-detail-badges");
    var locRow = document.getElementById("event-detail-location-row");
    var loc = document.getElementById("event-detail-location");
    var desc = document.getElementById("event-detail-desc");
    var courseRow = document.getElementById("event-detail-course-row");
    var course = document.getElementById("event-detail-course");
    var btnCal = document.getElementById("event-detail-add-cal");
    var btnDone = document.getElementById("event-detail-complete");
    var btnRsvp = document.getElementById("event-detail-rsvp");

    if (title) title.textContent = ev.title;
    if (dt) dt.textContent = formatLongDate(ev.date) + " · " + ev.time;
    if (badges) {
      badges.innerHTML = "";
      var b = document.createElement("span");
      b.className = categoryBadgeClass(ev.category);
      b.textContent = categoryLabel(ev.category);
      badges.appendChild(b);
      if (ev.urgent) {
        var u = document.createElement("span");
        u.className = "badge-urgent";
        u.style.marginLeft = "8px";
        u.textContent = "Urgent";
        badges.appendChild(u);
      }
    }
    if (loc && locRow) {
      if (ev.location) {
        loc.textContent = ev.location;
        locRow.classList.remove("is-hidden");
      } else {
        locRow.classList.add("is-hidden");
      }
    }
    if (desc) desc.textContent = ev.description || "";
    if (courseRow && course) {
      if (ev.course) {
        course.textContent = ev.course;
        courseRow.classList.remove("is-hidden");
      } else {
        courseRow.classList.add("is-hidden");
      }
    }

    if (btnDone) {
      btnDone.classList.toggle("is-hidden", ev.category !== "coursework");
    }
    if (btnRsvp) {
      btnRsvp.classList.toggle("is-hidden", ev.category !== "campus");
    }

    if (btnCal) btnCal.setAttribute("data-current-event-id", String(ev.id));
    if (btnDone) btnDone.setAttribute("data-current-event-id", String(ev.id));
    if (btnRsvp) btnRsvp.setAttribute("data-current-event-id", String(ev.id));

    openModalOverlay(modal);
    initLucide();
  }

  function formatTimeFromInput(t24) {
    if (!t24) return "";
    var p = t24.split(":");
    var h = parseInt(p[0], 10);
    var m = p[1] || "00";
    var am = h < 12;
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + m + " " + (am ? "AM" : "PM");
  }

  function initHomeCalendarWidget() {
    var grid = document.getElementById("home-cal-grid");
    if (!grid) return;

    var prev = document.getElementById("home-cal-prev");
    var next = document.getElementById("home-cal-next");
    if (prev) {
      prev.addEventListener("click", function () {
        homeCalState.month--;
        if (homeCalState.month < 0) {
          homeCalState.month = 11;
          homeCalState.year--;
        }
        refreshHomeCalendar();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        homeCalState.month++;
        if (homeCalState.month > 11) {
          homeCalState.month = 0;
          homeCalState.year++;
        }
        refreshHomeCalendar();
      });
    }

    var list = document.getElementById("home-agenda-list");
    if (list) {
      list.addEventListener("click", function (e) {
        var row = e.target.closest(".agenda-row[data-event-id]");
        if (!row) return;
        var id = row.getAttribute("data-event-id");
        if (id) openEventDetailModal(id);
      });
    }

    refreshHomeCalendar();
  }

  function initEventsPage() {
    var grid = document.getElementById("events-full-cal-grid");
    if (!grid) return;

    var prev = document.getElementById("events-cal-prev");
    var next = document.getElementById("events-cal-next");
    if (prev) {
      prev.addEventListener("click", function () {
        eventsCalState.month--;
        if (eventsCalState.month < 0) {
          eventsCalState.month = 11;
          eventsCalState.year--;
        }
        refreshEventsPageCalendar();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        eventsCalState.month++;
        if (eventsCalState.month > 11) {
          eventsCalState.month = 0;
          eventsCalState.year++;
        }
        refreshEventsPageCalendar();
      });
    }

    document.querySelectorAll(".event-upcoming-card[data-event-id]").forEach(function (card) {
      card.addEventListener("click", function () {
        var id = card.getAttribute("data-event-id");
        if (id) openEventDetailModal(id);
      });
    });

    document.querySelectorAll(".events-table .row-action[data-event-id]").forEach(function (row) {
      function open() {
        var id = row.getAttribute("data-event-id");
        if (id) openEventDetailModal(id);
      }
      row.addEventListener("click", open);
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });

    document.querySelectorAll(".btn-campus-rsvp").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        showToast("RSVP confirmed");
      });
    });
    document.querySelectorAll(".btn-campus-save").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        showToast("Saved to your list");
      });
    });

    var exportBtn = document.getElementById("btn-export-calendar");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        showToast("Calendar exported");
      });
    }

    var addRem = document.getElementById("btn-add-reminder");
    var remModal = document.getElementById("reminder-form-modal");
    if (addRem && remModal) {
      addRem.addEventListener("click", function () {
        openModalOverlay(remModal);
      });
    }

    var remForm = document.getElementById("form-add-reminder");
    if (remForm) {
      remForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var titleInput = document.getElementById("reminder-title");
        var dateInput = document.getElementById("reminder-date");
        var timeInput = document.getElementById("reminder-time");
        var catInput = document.getElementById("reminder-category");
        var notesInput = document.getElementById("reminder-notes");
        var maxId = 100;
        getAllEvents().forEach(function (x) {
          if (typeof x.id === "number" && x.id > maxId) maxId = x.id;
        });
        var nid = maxId + 1;
        var cat = (catInput && catInput.value) || "personal";
        var newEv = {
          id: nid,
          title: (titleInput && titleInput.value) || "Reminder",
          date: (dateInput && dateInput.value) || DEMO_TODAY,
          time: formatTimeFromInput(timeInput && timeInput.value) || "12:00 PM",
          category: cat,
          location: "",
          urgent: false,
          description: (notesInput && notesInput.value) || "Personal reminder.",
        };
        if (cat === "coursework") newEv.course = "General";
        SESSION_REMINDERS.push(newEv);
        closeModalOverlay(remModal);
        remForm.reset();
        showToast("Reminder added");
        refreshEventsPageCalendar();
        refreshHomeCalendar();
      });
    }

    refreshEventsPageCalendar();
  }

  function initEventDetailActions() {
    var addCal = document.getElementById("event-detail-add-cal");
    if (addCal && !addCal._evBound) {
      addCal._evBound = true;
      addCal.addEventListener("click", function () {
        showToast("Added to your calendar");
      });
    }
    var done = document.getElementById("event-detail-complete");
    if (done && !done._evBound) {
      done._evBound = true;
      done.addEventListener("click", function () {
        showToast("Marked complete");
      });
    }
    var rsvp = document.getElementById("event-detail-rsvp");
    if (rsvp && !rsvp._evBound) {
      rsvp._evBound = true;
      rsvp.addEventListener("click", function () {
        showToast("RSVP confirmed");
      });
    }
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
    var grid = document.querySelector(".jobs-grid");
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
    initHomeCalendarWidget();
    initEventsPage();
    initEventDetailActions();
    initLucide();
  });
})();
