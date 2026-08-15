/* Nana Koranteng — Media Editor Portfolio */
(() => {
  "use strict";

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* Sticky nav state */
  const nav = document.querySelector(".nav");
  const onScrollNav = () => {
    nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* Mobile menu */
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* Reveal on scroll */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal, .tool-row").forEach((el) => io.observe(el));

  /* Animated stat counters */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.firstChild.textContent = target;
    };
    el.firstChild.textContent = "0";
    requestAnimationFrame(tick);
    el.dataset.suffix = suffix;
  };
  const ioCount = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          ioCount.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => ioCount.observe(el));

  /* Project filters — each work group filters independently,
     showing the reference-style empty state when nothing matches */
  document.querySelectorAll(".work-group").forEach((group) => {
    const buttons = group.querySelectorAll(".filter-btn");
    const cards = group.querySelectorAll(".project-card");
    const empty = group.querySelector(".empty-state");

    const apply = (filter) => {
      let visible = 0;
      cards.forEach((card) => {
        const cats = (card.dataset.category || "").split(/\s+/);
        const show = filter === "all" || cats.includes(filter);
        card.classList.toggle("hidden-card", !show);
        if (show) visible += 1;
      });
      if (empty) empty.classList.toggle("show", visible === 0);
    };

    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        apply(btn.dataset.filter);
      })
    );
  });

  /* Scrollspy for nav links */
  const sections = [...document.querySelectorAll("section[id]")];
  const navAnchors = [...document.querySelectorAll(".nav-links a")];
  const spy = () => {
    const pos = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    sections.forEach((s) => {
      if (s.offsetTop <= pos) current = s.id;
    });
    navAnchors.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`)
    );
  };
  spy();
  window.addEventListener("scroll", spy, { passive: true });

  /* Contact form — static hosting friendly: validates, then shows
     the success state (wire to Formspree / a mailto later if desired) */
  const form = document.querySelector(".brief-form form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const success = document.querySelector(".form-success");
      const btn = form.querySelector(".form-submit");
      btn.disabled = true;
      btn.style.opacity = "0.65";
      btn.textContent = "Brief Sent ✓";
      if (success) success.classList.add("show");
      form.reset();
    });
  }
})();
