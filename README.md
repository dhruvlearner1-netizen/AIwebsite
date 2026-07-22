# The Rajmahal Palace — cinematic scroll site

A one-page, scroll-driven site for a fictional lake-palace hotel. Vanilla
HTML/CSS/JS, GSAP + ScrollTrigger for pinning/scrubbing, Lenis for smooth
inertial scroll. No build step.

## Run it

Just open `index.html`, or serve the folder so relative video paths and
`fetch`-free assets behave the same as production:

```bash
# from this folder
python3 -m http.server 8080
# then visit http://localhost:8080
```

Any static server works (`npx serve`, VS Code Live Server, GitHub Pages, etc).

## Where the videos live

All six clips stay exactly where they already were, filenames unchanged:

```
assets/video/01-hero-aerial.mp4     — Chapter 1, scroll-scrubbed
assets/video/02-arrival-gate.mp4    — Chapter 2, scroll-scrubbed
assets/video/03-durbar-lobby.mp4    — Chapter 3, autoplay loop
assets/video/04-royal-suite.mp4     — Chapter 4, autoplay loop
assets/video/05-pool-gardens.mp4    — Chapter 5, autoplay loop
assets/video/06-night-finale.mp4    — Chapter 6, scroll-scrubbed
assets/video/poster.jpg             — first frame of clip 01 (hero poster)
assets/video/02-poster.jpg          — first frame of clip 02 (mobile fallback)
assets/video/06-poster.jpg          — first frame of clip 06 (mobile fallback)
```

The three poster frames were auto-extracted from the videos so the site has
an instant-load hero image and a graceful mobile/reduced-motion fallback out
of the box. Re-extract them any time with:

```bash
ffmpeg -y -i assets/video/01-hero-aerial.mp4 -vf "select=eq(n\,0)" -q:v 2 -frames:v 1 assets/video/poster.jpg
```

## Re-encode the scrub videos for smooth seeking

Chapters 1, 2 and 6 map scroll position directly to `video.currentTime`, so
seek performance matters. Re-encode each of those three clips with dense
keyframes before shipping:

```bash
ffmpeg -i in.mp4 -vf scale=1920:-2 -g 1 -crf 20 -movflags +faststart -an out.mp4
```

`-g 1` writes a keyframe on every frame, which is what makes scrubbing feel
weighted and cinematic instead of jittery/blocky when the browser seeks.

## Tuning scrub distance per chapter

Each scrubbed chapter is a `<section class="chapter chapter-scrub">` whose
own height sets how much scroll distance the video takes to play through.
In `style.css`:

```css
.chapter-scrub{ height: 380vh; } /* ~3.8 screens of scroll per chapter */
```

Raise or lower that number per-chapter by giving a chapter its own override
(e.g. `#finale.chapter-scrub{ height: 300vh; }`) if you want the night
finale to resolve faster or slower than the hero. The lerp weight that
smooths the scrub (0.1) lives in `script.js` inside `initScrubChapter()` —
raise it for snappier scrubbing, lower it for more cinematic drag.

The Maharaja Suite (`.chapter-suite`) and Pool & Gardens (`.chapter-pool`)
sections use the same "tall wrapper + pinned inner div" pattern for their
horizontal card scroll and cusped-arch reveal, respectively — their heights
(`260vh`, `300vh`) can be tuned the same way.

## What's built in

- **Lenis + ScrollTrigger** wired together (`lenis.on('scroll', ScrollTrigger.update)`)
  so inertial smooth-scroll and pinned/scrubbed sections stay in sync.
- **Scroll-scrubbed hero, arrival and night-finale** chapters: video takes
  over from the poster once loaded, `currentTime` is lerped toward scroll
  progress, and a thin gold hairline on the side shows chapter progress.
- **Autoplay loop chapters** (durbar hall, suite, pool) lazy-load and only
  play once ≥50% visible, pausing off-screen to save battery/bandwidth.
- **Word-masked headline reveals** everywhere (custom splitter, no paid
  SplitText plugin), a jali lattice dissolve transition, animated
  old-style-numeral counters, a horizontal suite-card strip, a cusped-arch
  clip-path reveal for the pool (via an SVG `clipPath` in fractional
  `objectBoundingBox` units — CSS `clip-path: path()` doesn't support
  percentages, so this is the robust cross-browser way to animate it),
  a magnetic-hover CTA with a gold sheen sweep, and a footer that flips
  from sapphire to ivory as you reach it.
- **Custom gold cursor** (dot → ring with "SCROLL" label on hover), disabled
  automatically on touch devices.
- **`prefers-reduced-motion` support**: disables all scrubbing/pinning and
  falls back to static posters with simple, instant reveals.
- **Mobile fallback** (`≤768px` or coarse pointer): scrubbed chapters swap
  to their poster frame with a slow Ken Burns zoom instead of scroll-driven
  video scrubbing (iOS Safari scrub-seeking is unreliable); loop chapters
  keep autoplaying muted/looping as normal.
- The gallery grid, lightbox, and enquiry form from the original site are
  preserved and re-skinned to the new palette/type system.

## Test checklist

- **Chrome** (desktop): scrubbing, pinning, Lenis inertia, cursor, jali/arch transitions.
- **Safari** (desktop): Lenis + `position: sticky`/pin quirks are the usual
  suspects — check the pool arch reveal and suite horizontal scroll render
  smoothly and don't jump on resize.
- **iOS Safari**: confirm the Ken-Burns poster fallback is what actually
  shows on chapters 1/2/6 (not a frozen/blank video), and that loop chapters
  still autoplay muted.
- Toggle **Reduce Motion** in OS accessibility settings and reload — every
  pin/scrub should be gone, replaced by static, immediately-visible content.

## Self-review against the brief

- ✅ All six local video paths used exactly as given, unmodified filenames.
- ✅ GSAP/ScrollTrigger (CDN) drives all pinning + scrubbing.
- ✅ Lenis (CDN) wired to `ScrollTrigger.update` on every scroll tick.
- ✅ Fraunces (display) + Inter (UI) from Google Fonts, `font-display: swap`.
- ✅ Palette matches spec exactly; gold used only for hairlines/numerals/hover.
- ✅ Custom splitter for masked word reveals (no paid SplitText).
- ✅ Chapter progress hairline on scrubbed sections.
- ✅ Autoplay loops lazy-load + pause off-screen via IntersectionObserver.
- ✅ Jali lattice dissolve transition after the arrival chapter.
- ✅ Durbar hall split layout with count-up stats.
- ✅ Suite parallax + horizontal card strip.
- ✅ Pool cusped-arch clip-path expansion (SVG-backed for real cross-browser support).
- ✅ Finale word-by-word line + magnetic CTA with gold sheen sweep.
- ✅ Footer ivory theme-flip on scroll.
- ✅ Custom gold cursor, disabled on touch.
- ✅ `prefers-reduced-motion` and mobile fallbacks genuinely disable the
  heavy scroll machinery rather than just hiding a class.
- ⚠️ Lighthouse 90+ desktop is achievable with this structure (only clip 01
  is preloaded, everything else is lazy), but hasn't been run in this
  environment — worth a spot-check once deployed, since real-world numbers
  depend on your video bitrates after the `ffmpeg` re-encode above.
