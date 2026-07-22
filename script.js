/* ==========================================================
   THE RAJMAHAL PALACE — script.js
   GSAP + ScrollTrigger + Lenis cinematic scroll choreography
   ========================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth <= 768;
  var lightMode = prefersReducedMotion || isTouch; // skip heavy pin/scrub choreography
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* =========================================================
     LENIS SMOOTH SCROLL
     ========================================================= */
  var lenis = null;
  if (!lightMode && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.1
    });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
  }

  /* =========================================================
     PRELOADER
     ========================================================= */
  (function preloader() {
    var loader = document.getElementById("loader");
    var wordEl = document.getElementById("loaderWord");
    var ruleFill = document.getElementById("loaderRuleFill");
    var countEl = document.getElementById("loaderCount");
    if (!loader) return;

    var word = "RAJMAHAL";
    if (wordEl) {
      wordEl.innerHTML = word.split("").map(function (ch, i) {
        return '<span style="animation-delay:' + (i * 0.05).toFixed(2) + 's">' + ch + '</span>';
      }).join("");
    }

    var startTime = Date.now();
    var minDuration = 1800;
    var progress = 0;
    var raf;

    function tick() {
      var elapsed = Date.now() - startTime;
      var timeProgress = Math.min(1, elapsed / minDuration);
      progress = Math.max(progress, timeProgress * 92);
      if (ruleFill) ruleFill.style.width = progress + "%";
      if (countEl) countEl.textContent = String(Math.round(progress)).padStart(2, "0");
      if (progress < 100) {
        raf = requestAnimationFrame(tick);
      }
    }
    tick();

    function finish() {
      progress = 100;
      if (ruleFill) ruleFill.style.width = "100%";
      if (countEl) countEl.textContent = "100";
      cancelAnimationFrame(raf);
      setTimeout(function () {
        loader.classList.add("is-hidden");
        document.body.style.overflow = "";
        if (hasGSAP) ScrollTrigger.refresh();
      }, 350);
    }

    var elapsedAlready = Date.now() - startTime;
    var remaining = Math.max(0, minDuration - elapsedAlready);

    if (document.readyState === "complete") {
      setTimeout(finish, remaining);
    } else {
      window.addEventListener("load", function () {
        setTimeout(finish, Math.max(0, minDuration - (Date.now() - startTime)));
      });
      // hard fallback so a slow asset never blocks the page forever
      setTimeout(finish, 6000);
    }
  })();

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */
  (function customCursor() {
    var cursor = document.getElementById("cursor");
    if (!cursor || isTouch) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var cx = mx, cy = my;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    function render() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(render);
    }
    render();

    var interactiveSelector = "a, button, .suite-card, .gallery-card, input, textarea";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(interactiveSelector)) {
        cursor.classList.add("is-active");
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(interactiveSelector)) {
        cursor.classList.remove("is-active");
      }
    });
  })();

  /* =========================================================
     SET CURRENT YEAR
     ========================================================= */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     NAV: scrolled state + hide on scroll down / show on scroll up
     ========================================================= */
  (function nav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var lastY = window.scrollY;

    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 40);
      if (y > lastY && y > 200) {
        nav.classList.add("is-hidden");
      } else {
        nav.classList.remove("is-hidden");
      }
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* =========================================================
     MOBILE NAV TOGGLE
     ========================================================= */
  (function mobileNav() {
    var navToggle = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");
    if (!navToggle || !navLinks) return;
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
  })();

  /* =========================================================
     ACTIVE NAV LINK ON SCROLL
     ========================================================= */
  (function activeNav() {
    var ids = ["arrival", "suite", "gardens", "gallery", "contact"];
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var navAnchors = document.querySelectorAll("[data-nav]");
    if (!sections.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navAnchors.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  })();

  /* =========================================================
     WORD-MASKED TEXT REVEALS  (data-split)
     ========================================================= */
  (function splitReveals() {
    var targets = document.querySelectorAll("[data-split]");
    targets.forEach(function (el) {
      var text = el.textContent;
      var words = text.split(" ");
      el.innerHTML = "";
      // Neutralize the original single-line .mask-inner CSS (translateY/opacity)
      // now that this element is a generic wrapper for per-word spans.
      el.classList.remove("mask-inner");
      el.style.display = "inline";
      el.style.transform = "none";
      el.style.opacity = "1";
      words.forEach(function (word, i) {
        var line = document.createElement("span");
        line.className = "mask-line";
        line.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;";
        var inner = document.createElement("span");
        inner.className = "mask-inner word-inner";
        inner.style.cssText = "display:inline-block;";
        inner.textContent = word + (i < words.length - 1 ? "\u00A0" : "");
        line.appendChild(inner);
        el.appendChild(line);
      });
    });

    if (!hasGSAP || prefersReducedMotion) {
      document.querySelectorAll(".word-inner").forEach(function (w) {
        w.style.transform = "none"; w.style.opacity = "1";
      });
      return;
    }

    document.querySelectorAll("h1, h2").forEach(function (heading) {
      var words = heading.querySelectorAll(".word-inner");
      if (!words.length) return;
      gsap.set(words, { yPercent: 105, opacity: 0 });

      var isHero = !!heading.closest(".hero-content");

      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.045,
        delay: isHero ? 0.5 : 0,
        scrollTrigger: isHero ? undefined : {
          trigger: heading,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });
  })();

  /* =========================================================
     SCRUB-VIDEO CHAPTERS  (01 hero, 02 arrival, 06 finale)
     ========================================================= */
  function initScrubChapter(section) {
    var video = section.querySelector('[data-role="scrub-video"]');
    var poster = section.querySelector('[data-role="poster"]');
    var progressFill = section.querySelector("[data-progress-fill]");
    if (!video) return;

    if (lightMode) {
      // Mobile / reduced-motion fallback: static poster + Ken Burns handled in CSS.
      return;
    }

    var ready = false;
    video.addEventListener("loadeddata", function () {
      ready = true;
      video.classList.add("is-ready");
      if (poster) poster.classList.add("is-hidden");
    });

    var target = 0;
    var current = 0;
    var raf = null;

    function loop() {
      current += (target - current) * 0.1;
      if (ready && video.duration) {
        try { video.currentTime = current * video.duration; } catch (e) {}
      }
      raf = requestAnimationFrame(loop);
    }
    loop();

    if (!hasGSAP) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      pin: section.querySelector(".chapter-pin"),
      pinSpacing: false,
      onUpdate: function (self) {
        target = self.progress;
        if (progressFill) progressFill.style.height = (self.progress * 100) + "%";
      }
    });

    // Begin loading as soon as the section nears the viewport.
    ScrollTrigger.create({
      trigger: section,
      start: "top 150%",
      once: true,
      onEnter: function () { if (video.load) video.load(); }
    });
  }

  document.querySelectorAll(".chapter-scrub").forEach(initScrubChapter);

  /* =========================================================
     LOOP VIDEOS (03 durbar, 04 suite, 05 pool + gallery thumbs)
     lazy-load + play on ≥50% visibility, pause off-screen
     ========================================================= */
  (function loopVideos() {
    var videos = document.querySelectorAll(".loop-video, .gallery-thumb");

    function loadSrc(video) {
      if (video.dataset.src && !video.src) {
        var source = document.createElement("source");
        source.src = video.dataset.src;
        source.type = "video/mp4";
        video.appendChild(source);
        video.load();
        video.addEventListener("loadeddata", function () {
          video.classList.add("is-loaded");
        }, { once: true });
      }
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            loadSrc(video);
            if (!prefersReducedMotion) {
              var p = video.play();
              if (p && p.catch) p.catch(function () {});
            }
          } else {
            video.pause();
          }
        });
      }, { rootMargin: "120px 0px", threshold: 0.5 });

      videos.forEach(function (v) { observer.observe(v); });
    } else {
      videos.forEach(function (v) { loadSrc(v); v.play().catch(function () {}); });
    }
  })();

  /* =========================================================
     CHAPTER MARKER (fixed 01–06, crossfades)
     ========================================================= */
  (function chapterMarker() {
    var marker = document.getElementById("chapterMarker");
    var numEl = document.getElementById("chapterNum");
    if (!marker || !numEl) return;

    var chapters = document.querySelectorAll("[data-chapter]");
    if (!chapters.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          marker.classList.add("is-visible");
          numEl.textContent = entry.target.getAttribute("data-chapter");
        }
      });
    }, { threshold: 0.5 });

    chapters.forEach(function (c) { observer.observe(c); });

    var top = document.getElementById("top");
    if (top) {
      var topObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.intersectionRatio > 0.85) marker.classList.remove("is-visible");
        });
      }, { threshold: [0, 0.85, 1] });
      topObs.observe(top);
    }
  })();

  /* =========================================================
     JALI OVERLAY TRANSITION (end of chapter 2 — arrival)
     ========================================================= */
  (function jaliOverlay() {
    if (lightMode || !hasGSAP) return;
    var overlay = document.getElementById("jaliOverlay");
    var arrival = document.getElementById("arrival");
    if (!overlay || !arrival) return;

    gsap.timeline({
      scrollTrigger: {
        trigger: arrival,
        start: "80% bottom",
        end: "bottom bottom",
        scrub: 0.5
      }
    })
      .to(overlay, { opacity: 1, duration: 0.4, ease: "power2.out" })
      .to(overlay, { opacity: 0, duration: 0.6, ease: "power2.out" });
  })();

  /* =========================================================
     DURBAR HALL — line reveal copy + counters count-up
     ========================================================= */
  (function durbar() {
    var section = document.getElementById("durbar");
    if (!section) return;
    var copy = section.querySelector(".split-copy");
    var counters = section.querySelectorAll(".counter-num");

    function reveal() {
      if (copy) copy.classList.add("is-visible");
      counters.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-counter"), 10) || 0;
        if (prefersReducedMotion || !hasGSAP) {
          el.textContent = target.toLocaleString("en-IN");
          return;
        }
        var obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(obj.val).toLocaleString("en-IN"); }
        });
      });
    }

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { reveal(); o.unobserve(entry.target); }
        });
      }, { threshold: 0.35 });
      obs.observe(section);
    } else {
      reveal();
    }
  })();

  /* =========================================================
     MAHARAJA SUITE — parallax video + horizontal card scroll
     ========================================================= */
  (function suiteChapter() {
    var section = document.getElementById("suite");
    if (!section || lightMode || !hasGSAP) return;

    var video = section.querySelector(".suite-video");
    var track = document.getElementById("suiteTrack");
    if (!track) return;

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      pin: section.querySelector(".suite-pin"),
      pinSpacing: false,
      onUpdate: function (self) {
        if (video) gsap.set(video, { yPercent: self.progress * -8 });
        var maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        gsap.set(track, { x: -maxScroll * self.progress });
      }
    });
  })();

  /* =========================================================
     POOL & GARDENS — scalloped-arch clip-path expansion
     ========================================================= */
  (function poolChapter() {
    var section = document.getElementById("gardens");
    if (!section) return;
    var clipPathEl = document.getElementById("archClipPath");
    var keywords = section.querySelectorAll(".pool-keyword");

    // Build the SVG clip-path "d" string in fractional (0-1) objectBoundingBox
    // units for a given progress p: a cusped arch that widens and rises
    // until it fills the whole box.
    function archPathD(p) {
      if (p >= 0.98) return "M 0 0 L 1 0 L 1 1 L 0 1 Z"; // full bleed rectangle
      var archWidth = 0.1 + p * 0.9; // 10% -> 100% of width
      var archTop = 0.4 - p * 0.4; // arch crown rises from 40% down to 0%
      var half = archWidth / 2;
      var left = 0.5 - half;
      var right = 0.5 + half;
      var curveTop = Math.max(0, archTop - 0.15);
      return "M " + left + " 1 L " + left + " " + archTop + " C " + left + " " + curveTop + ", " + right + " " + curveTop + ", " + right + " " + archTop + " L " + right + " 1 Z";
    }

    if (lightMode || !hasGSAP) {
      if (clipPathEl) clipPathEl.setAttribute("d", "M 0 0 L 1 0 L 1 1 L 0 1 Z");
      keywords.forEach(function (k) { k.style.opacity = "0.9"; });
      return;
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      pin: section.querySelector(".pool-pin"),
      pinSpacing: false,
      scrub: 0.4,
      onUpdate: function (self) {
        var p = self.progress;
        if (clipPathEl) clipPathEl.setAttribute("d", archPathD(p));
        keywords.forEach(function (k, i) {
          var depth = parseFloat(k.getAttribute("data-depth")) || 0.3;
          var appear = Math.min(1, Math.max(0, (p - 0.15 - i * 0.1) / 0.3));
          k.style.opacity = appear * 0.92;
          k.style.transform = "translateY(" + ((1 - appear) * 24 + p * -30 * depth) + "px)";
        });
      }
    });
  })();

  /* =========================================================
     FINALE — word-by-word closing line + CTA + magnetic hover
     ========================================================= */
  (function finale() {
    var line = document.getElementById("finaleLine");
    var cta = document.getElementById("ctaBtn");
    if (!line) return;
    var words = line.querySelectorAll(".finale-word");

    function reveal() {
      words.forEach(function (w, i) {
        if (prefersReducedMotion || !hasGSAP) {
          w.style.opacity = "1"; w.style.transform = "none";
          return;
        }
        gsap.to(w, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: i * 0.08 });
      });
      if (cta) cta.classList.add("is-visible");
    }

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { reveal(); o.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      obs.observe(line);
    } else {
      reveal();
    }

    if (cta && !isTouch) {
      cta.addEventListener("mousemove", function (e) {
        var rect = cta.getBoundingClientRect();
        var mx = e.clientX - rect.left - rect.width / 2;
        var my = e.clientY - rect.top - rect.height / 2;
        var strength = 0.28;
        cta.style.transform = "translate(" + (mx * strength) + "px," + (my * strength) + "px)";
      });
      cta.addEventListener("mouseleave", function () {
        cta.style.transform = "translate(0,0)";
      });
    }
  })();

  /* =========================================================
     FOOTER THEME FLIP
     ========================================================= */
  (function footerFlip() {
    var footer = document.getElementById("footer");
    if (!footer) return;
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          footer.classList.toggle("is-flipped", entry.intersectionRatio > 0.4);
        });
      }, { threshold: [0, 0.4, 1] });
      obs.observe(footer);
    }
  })();

  /* =========================================================
     GALLERY LIGHTBOX
     ========================================================= */
  (function lightboxModule() {
    var lightbox = document.getElementById("lightbox");
    var backdrop = document.getElementById("lightboxBackdrop");
    var lightboxVideo = document.getElementById("lightboxVideo");
    var caption = document.getElementById("lightboxCaption");
    var closeBtn = document.getElementById("lightboxClose");
    var cards = document.querySelectorAll(".gallery-card");
    var lastFocused = null;
    if (!lightbox) return;

    function open(src, title) {
      lastFocused = document.activeElement;
      lightboxVideo.src = src;
      lightboxVideo.muted = false;
      caption.textContent = title || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lightboxVideo.play().catch(function () {});
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lightboxVideo.pause();
      lightboxVideo.removeAttribute("src");
      lightboxVideo.load();
      if (lastFocused) lastFocused.focus();
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        open(card.getAttribute("data-video"), card.getAttribute("data-title"));
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });
  })();

  /* =========================================================
     CONTACT FORM (demo submit)
     ========================================================= */
  (function contactForm() {
    var form = document.getElementById("contactForm");
    var note = document.getElementById("formNote");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      note.textContent = "Thank you — the house will reply within one day.";
      form.reset();
    });
  })();

  /* =========================================================
     REFRESH SCROLLTRIGGER AFTER EVERYTHING SETTLES
     ========================================================= */
  if (hasGSAP) {
    window.addEventListener("load", function () {
      setTimeout(function () { ScrollTrigger.refresh(); }, 400);
    });
  }
})();
