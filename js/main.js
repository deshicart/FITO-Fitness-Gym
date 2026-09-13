/* =====================================================================
   FITO Fitness & Gym — Site interactions
   ===================================================================== */

/* ---------------------------------------------------------------
   EDIT THIS ONCE — centralized business data used across the site.
   Update here and the whole site stays consistent.
   --------------------------------------------------------------- */
const GYM = {
  name: "FITO Fitness & Gym",
  phone: "01720-505050",
  phoneHref: "tel:+8801720505050",
  address: "406/B Malibagh Chowdhury Para Road, Khilgaon Chowdhury Para (3rd Floor), Dhaka, Bangladesh",
  rating: "4.3",
  reviewCount: 240,
  years: 11,
  hours: {
    satThu: { open: 7, close: 23 },
    fri: { open: 16, close: 21 }
  },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=FITO+Fitness+%26+Gym+Malibagh+Chowdhury+Para+Dhaka"
};

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initNav();
  initReveal();
  initCounters();
  initActiveNav();
  initCarousel();
  initHours();
  setYear();
});

/* ---------- Theme toggle (persisted; init applied in <head> to prevent flash) ---------- */
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("fito-theme", next); } catch (e) {}
    updateToggleLabel(toggle, next);
  });

  updateToggleLabel(toggle, document.documentElement.getAttribute("data-theme") || "dark");
}

function updateToggleLabel(toggle, theme) {
  toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

/* ---------- Navbar: scroll state + mobile menu ---------- */
function initNav() {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("mobileMenu");
  const body = document.body;
  let menuOpen = false;

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!burger || !menu) return;
  menu.hidden = false;

  const setMenu = (open) => {
    menuOpen = open;
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
    body.style.overflow = open ? "hidden" : "";
    if (open) {
      const first = menu.querySelector(".mobile-link");
      if (first) first.focus();
    } else {
      burger.focus();
    }
  };

  burger.addEventListener("click", () => setMenu(!menuOpen));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuOpen) setMenu(false);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && menuOpen) setMenu(false);
  });
}

/* ---------- Scroll reveals ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
  );

  items.forEach((el) => io.observe(el));
}

/* ---------- Animated counters ---------- */
function initCounters() {
  const targets = document.querySelectorAll(".count, .score");
  if (!targets.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animate = (el) => {
    const final = parseFloat(el.dataset.count || el.textContent.replace(/[^0-9.]/g, "") || "0");
    const isDecimal = Number.isInteger(final) === false || el.textContent.includes(".");
    const decimals = isDecimal ? 1 : 0;
    const duration = 1500;
    const start = performance.now();

    if (reduced) {
      el.textContent = final.toFixed(decimals);
      return;
    }

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (final * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    targets.forEach(animate);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  targets.forEach((el) => io.observe(el));
}

/* ---------- Active nav link on scroll ---------- */
function initActiveNav() {
  const links = document.querySelectorAll(".nav-link");
  if (!links.length) return;

  const map = {};
  links.forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) map[id] = { link, sec };
  });

  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  Object.values(map).forEach(({ sec }) => io.observe(sec));
}

/* ---------- Testimonial carousel ---------- */
function initCarousel() {
  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("carouselDots");
  const prev = document.getElementById("carouselPrev");
  const next = document.getElementById("carouselNext");
  if (!track) return;

  const slides = track.children;
  if (slides.length < 2) return;

  let index = 0;
  let timer = null;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Show review " + (i + 1));
    dot.addEventListener("click", () => go(i));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.children;

  const go = (i) => {
    index = (i + slides.length) % slides.length;
    const amount = -index * 100;
    track.style.transition = reduced ? "none" : "transform 0.6s cubic-bezier(0.2,0.65,0.2,1)";
    track.style.transform = "translateX(" + amount + "%)";
    Array.from(dots).forEach((d, di) => {
      d.classList.toggle("active", di === index);
      d.setAttribute("aria-selected", String(di === index));
    });
  };

  const start = () => {
    if (reduced) return;
    stop();
    timer = setInterval(() => go(index + 1), 6500);
  };
  const stop = () => { if (timer) clearInterval(timer); timer = null; };

  prev.addEventListener("click", () => { go(index - 1); start(); });
  next.addEventListener("click", () => { go(index + 1); start(); });

  const holder = track.closest(".carousel");
  holder.addEventListener("mouseenter", stop);
  holder.addEventListener("mouseleave", start);
  holder.addEventListener("focusin", stop);
  holder.addEventListener("focusout", start);

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  go(0);
  start();
}

/* ---------- Opening hours: today highlight + live open/closed status ---------- */
function initHours() {
  const status = document.getElementById("hoursStatus");
  const rows = document.querySelectorAll(".hours-row");
  if (!status) return;

  try {
    const now = new Date();
    const dayLong = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Dhaka"
    }).format(now);

    const parts = dayLong.split(", ");
    const day = parts[0].toLowerCase();
    const hour = parseFloat(parts[1]) || now.getHours();

    rows.forEach((row) => {
      const days = row.dataset.days.split(",").map((d) => d.trim());
      if (days.includes(day)) row.classList.add("today");
    });

    const isFriday = day === "friday";
    const o = isFriday ? GYM.hours.fri : GYM.hours.satThu;
    const open = hour >= o.open && hour < o.close;

    status.textContent = open ? "Open now" : "Closed now";
    status.classList.add(open ? "open" : "closed");
    status.hidden = false;
  } catch (e) {
    status.hidden = true;
  }
}

/* ---------- Footer year ---------- */
function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}