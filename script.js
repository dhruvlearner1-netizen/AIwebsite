/* ==========================================================
   ARANYA PALACE — script.js
   ========================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Loader ---------------- */
  window.addEventListener("load", function () {
    var loader = document.getElementById("loader");
    if (!loader) return;
    setTimeout(function () {
      loader.classList.add("is-hidden");
    }, 500);
  });

  /* ---------------- Set current year ---------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Nav: scrolled state ---------------- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (window.scrollY > 40) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile nav toggle ---------------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Active nav link on scroll ---------------- */
  var sections = ["journey", "suites", "gardens", "gallery", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navAnchors = document.querySelectorAll("[data-nav]");

  if (sections.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            navAnchors.forEach(function (a) {
              a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------- Hero sound toggle ---------------- */
  var heroVideo = document.getElementById("heroVideo");
  var heroSoundBtn = document.getElementById("heroSoundBtn");
  if (heroVideo && heroSoundBtn) {
    heroSoundBtn.addEventListener("click", function () {
      heroVideo.muted = !heroVideo.muted;
      var isMuted = heroVideo.muted;
      heroSoundBtn.setAttribute("aria-pressed", isMuted ? "false" : "true");
      heroSoundBtn.querySelector(".sound-label").textContent = isMuted ? "Sound off" : "Sound on";
      if (!isMuted) {
        heroVideo.play().catch(function () {});
      }
    });
  }

  /* ---------------- Lazy-load & play journey stage videos on view ---------------- */
  var stageVideos = document.querySelectorAll(".stage-video, .gallery-thumb");

  function loadVideoSrc(video) {
    if (video.dataset.src && !video.src) {
      var source = document.createElement("source");
      source.src = video.dataset.src;
      source.type = "video/mp4";
      video.appendChild(source);
      video.load();
    }
  }

  if ("IntersectionObserver" in window) {
    var mediaObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            loadVideoSrc(video);
            if (!prefersReducedMotion) {
              var playPromise = video.play();
              if (playPromise && playPromise.catch) playPromise.catch(function () {});
            }
          } else {
            video.pause();
          }
        });
      },
      { rootMargin: "120px 0px", threshold: 0.2 }
    );
    stageVideos.forEach(function (v) { mediaObserver.observe(v); });
  } else {
    // Fallback: load everything immediately
    stageVideos.forEach(function (v) {
      loadVideoSrc(v);
      v.play().catch(function () {});
    });
  }

  /* ---------------- Scroll reveal for journey stages ---------------- */
  var stages = document.querySelectorAll(".stage");
  if ("IntersectionObserver" in window && stages.length) {
    var stageStyleAdded = false;
    if (!stageStyleAdded) {
      var styleTag = document.createElement("style");
      styleTag.textContent =
        ".stage{opacity:0;transform:translateY(28px);transition:opacity .9s cubic-bezier(.22,.61,.36,1),transform .9s cubic-bezier(.22,.61,.36,1);}" +
        ".stage.is-visible{opacity:1;transform:translateY(0);}";
      document.head.appendChild(styleTag);
      stageStyleAdded = true;
    }
    var stageObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    stages.forEach(function (s) { stageObserver.observe(s); });

    if (prefersReducedMotion) {
      stages.forEach(function (s) { s.classList.add("is-visible"); });
    }
  }

  /* ---------------- Gallery lightbox ---------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxBackdrop = document.getElementById("lightboxBackdrop");
  var lightboxVideo = document.getElementById("lightboxVideo");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");
  var galleryCards = document.querySelectorAll(".gallery-card");
  var lastFocused = null;

  function openLightbox(src, title) {
    lastFocused = document.activeElement;
    lightboxVideo.src = src;
    lightboxVideo.muted = false;
    lightboxCaption.textContent = title || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxVideo.play().catch(function () {});
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.load();
    if (lastFocused) lastFocused.focus();
  }

  galleryCards.forEach(function (card) {
    card.addEventListener("click", function () {
      var src = card.getAttribute("data-video");
      var title = card.getAttribute("data-title");
      openLightbox(src, title);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  /* ---------------- Contact form (demo submit) ---------------- */
  var contactForm = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      formNote.textContent = "Thank you — the house will reply within one day.";
      contactForm.reset();
    });
  }

  /* ---------------- Pause hero video if reduced motion ---------------- */
  if (prefersReducedMotion && heroVideo) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }
})();
