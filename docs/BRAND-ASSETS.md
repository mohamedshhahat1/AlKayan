# Brand assets

How the logo, the wordmark and the hero video are wired up, and what still has
to be resolved.

---

## Status

| Asset | Path | Committed | Size | OK for production |
| --- | --- | --- | --- | --- |
| Logo mark | `public/brand/logo.svg` | Yes | **839 KB** | **No — see below** |
| Wordmark | `public/brand/company_name.svg` | Yes | **889 KB** | **No — see below** |
| Hero video | external Pexels URL | By reference | — | Works; self-host first |
| Hero poster | external Pexels URL | By reference | — | Works |

The wiring is complete: both files are in place, both render, and no code change
is needed to use them.

### The size problem

**1.7 MB of brand assets load in the header of every page, above the fold.**

For scale: a vector logo mark is normally 2-20 KB. Even an intricate emblem
rarely passes 60 KB. At 839 KB and 889 KB these are two to three orders of
magnitude larger than they should be, which almost always means one of:

1. **A raster image embedded as base64 inside an `<svg>` wrapper.** This is by
   far the most common cause. It happens when a PNG or JPEG is run through an
   online "convert to SVG" tool, or when a design export includes a placed
   bitmap rather than outlines. The file is an SVG by extension only — it will
   not scale crisply, and it gains none of the benefits of vector.
2. **Auto-traced vector art** with tens of thousands of path nodes, from an
   Image Trace or similar. It scales crisply but is very expensive to parse and
   rasterise, and it is usually visibly lumpy against the original.

I could not verify which from the environment these changes were made in, and
the files were deliberately not opened or altered. Someone should check — open
`logo.svg` in a text editor and look at the first few lines:

- `<image ... xlink:href="data:image/png;base64,...` → case 1, an embedded raster.
- Thousands of `<path d="..."` entries → case 2, a trace.
- A handful of tidy `<path>` elements → something else is going on; report it.

### Why it matters here specifically

These are not decorative images further down the page. They are in the header,
so they are requested on first paint, on every route, for every visitor. On a
mid-range phone on Egyptian mobile data, 1.7 MB is measured in seconds, and it
competes directly with the font and the JavaScript bundle for bandwidth.

It also undercuts the rest of the work: the hero video is deliberately deferred
to idle precisely so nothing large blocks first paint, and this is larger than
the first few seconds of the video.

### What the code does about it

The assets are used exactly as supplied — not modified, not recoloured, not
redrawn. `components/brand.tsx` does two things to avoid compounding the issue:

- **`decoding="async"`** so decoding a large image cannot block the main thread
  while the page is painting.
- **`max-w-full` with `object-contain`** so an unexpected intrinsic aspect ratio
  letterboxes inside its box instead of pushing the header wider than a 320px
  viewport. The real dimensions could not be measured, so they are not assumed.

Neither is a fix. They stop a bad asset from becoming a broken layout.

### What should happen before launch

In order of preference:

1. **Re-export from the original vector source** — Illustrator, Figma, CorelDRAW
   — with real outlines, no embedded bitmaps, and text converted to paths.
   Expect 5-30 KB per file. This is the correct fix and the only one that gives
   you genuine vector branding.
2. **If the original is only ever a raster**, then stop calling it an SVG. Export
   a PNG at roughly 3× the largest rendered size (the header mark renders at
   44px, so ~132px tall), or better a WebP, and change the two paths in
   `lib/site-config.ts`. A 132px-tall PNG of a logo is typically 3-8 KB. The
   `branding` config takes any URL, so nothing else changes.
3. **As a stopgap only**, run the existing files through SVGO:
   ```bash
   npx svgo --multipass public/brand/logo.svg public/brand/company_name.svg
   ```
   This is lossless and will strip editor metadata, but it cannot shrink
   embedded base64 raster data meaningfully. If the files barely change size,
   that itself confirms case 1 above.

Until one of these is done, treat the branding as functionally integrated but
**not production-ready**.

---

## How they are rendered

One file owns this: `components/brand.tsx`, exporting `BrandLogo`,
`BrandWordmark` and `BrandLockup`. Nothing else in the codebase references an
asset path.

Paths are declared once, in `lib/site-config.ts`:

```ts
branding: {
  logo: "/brand/logo.svg",
  companyName: "/brand/company_name.svg",
  logoAlt: "شعار الكيان",
  companyNameAlt: "الكيان",
}
```

Change them there and nowhere else — including if you switch to PNG or WebP.

Three rules are deliberately enforced by the component:

**The SVGs are never modified.** They are referenced by URL, not inlined, so no
CSS rule, `currentColor` inheritance or SVGO pass in this repo can alter the
artwork. What is committed is what renders.

**Sizing is height-only.** Every call site sets a height class and the component
adds `width: auto`, `max-width: 100%` and `object-contain`. The intrinsic aspect
ratio is preserved at every breakpoint. This matters because the code cannot
know the dimensions of files it has never opened.

**Alt text is decided by context, not by default.** Where the surrounding
element already names the company — the header link has
`aria-label="الكيان — العودة إلى أعلى الصفحة"` — both assets are passed `alt=""`
and marked decorative. Announcing "الكيان" three times in a row is worse for a
screen-reader user than announcing it once. In the footer, where nothing else
names the company, the wordmark carries the accessible name and the mark beside
it is decorative.

### Where they appear

| Surface | File | Composition |
| --- | --- | --- |
| Header / navbar (all breakpoints) | `components/site-header.tsx` | mark + wordmark; wordmark hides below 380px |
| Footer | `components/site-footer.tsx` | mark + wordmark, on-dark tone |
| Loading state | `app/loading.tsx` | `BrandLockup` |
| Error boundary | `app/error.tsx` | `BrandLockup` |
| Root error boundary | `app/global-error.tsx` | mark only, inline-styled |
| 404 | `app/not-found.tsx` | `BrandLockup` |

The mobile menu, the contact section, the chat widget, the WhatsApp button and
the back-to-top control intentionally carry no logo. They sit inside a page that
already shows it twice; repeating it there is noise, not branding.

### The fallback

Each component falls back to the monogram tile and text lockup the site used
before, if its asset fails to load. This is a degradation path, not a second
logo: it is unreachable whenever the asset resolves.

It exists so that a missing or broken asset costs the brand mark rather than the
whole header, and so the site never shows a browser's broken-image glyph.
`siteConfig.monogram` is retained solely to feed it.

If you see the gold monogram tile in the header, the asset did not load.

---

## Not yet converted

Two surfaces still draw approximated branding, and both need a decision rather
than a patch:

**`app/icon.tsx`** renders the letters `AK` on a gold tile as the favicon, via
`ImageResponse`. The clean fix is to delete this file and drop a small square
SVG in as `app/icon.svg`, which Next.js picks up automatically. **Do not use the
current 839 KB `logo.svg` for this** — a favicon renders at 32px and the file
would be downloaded on every page. Resolve the size problem first.

**`app/opengraph-image.tsx`** renders the string `AL-KAYAN` as the social
preview card. Satori, which powers `ImageResponse`, cannot fetch an external SVG
by URL; embedding the logo means reading the file at build time and passing it as
a data URI. At the current file size that would bloat every social card, so this
also waits on the re-export.

Both are worth doing. Neither is worth doing with these files as they stand.

---

## The hero video

Source: `https://www.pexels.com/download/video/31617692/`

### Decision: kept as an external URL, for now

The Pexels licence permits free use, including commercially, without
attribution, so serving this file from your own domain is legally fine. The
reason it is still an external reference is practical, and it should be
revisited:

- The file could not be fetched and committed from the environment this change
  was made in, which had no network access. Committing a video is also a
  question for the repository owner rather than an automatic yes — a
  multi-megabyte binary in git history is permanent.
- Keeping it configurable costs nothing. The URL lives in `siteConfig.hero.video`
  and is overridable with `NEXT_PUBLIC_HERO_VIDEO_URL`, so switching to a local
  file is a one-line environment change, not a code change.

### Why you should self-host it before launch

- `pexels.com/download/...` is a download endpoint, not a CDN origin. It
  redirects, it is not tuned for streaming, and it carries no availability
  guarantee for your traffic.
- Range requests and caching behaviour are outside your control, so seeking and
  re-buffering behaviour on mobile is unpredictable.
- A third party can change or remove it at any time.

The hero is built to survive that — the poster stays and the video simply never
appears — but degrading silently is not the same as being fine.

### Self-hosting it

```bash
curl -L -o public/brand/hero.mp4 "https://www.pexels.com/download/video/31617692/"

# Strongly recommended: strip the audio track (the hero is muted anyway) and
# cap the resolution. A 1080p background at 2-3 Mbps is plenty.
ffmpeg -i public/brand/hero.mp4 -an -vf "scale=1920:-2" -c:v libx264 \
       -preset slow -crf 26 -movflags +faststart public/brand/hero-opt.mp4
mv public/brand/hero-opt.mp4 public/brand/hero.mp4
```

`-movflags +faststart` matters: it moves the metadata to the front of the file so
playback can begin before the whole thing has downloaded.

Then set, in every environment:

```
NEXT_PUBLIC_HERO_VIDEO_URL=/brand/hero.mp4
```

And consider a matching self-hosted poster via `NEXT_PUBLIC_HERO_POSTER_URL`.

### How playback is handled

In `components/sections/hero-section.tsx`:

- The still is the poster layer, is always mounted, and is what paints first. It
  is the LCP element. The video never blocks it.
- The `<video>` is not rendered at all until the browser reports idle
  (`requestIdleCallback`, 2.5s timeout, `setTimeout` fallback). One element, one
  `src`, mounted once — the file is never requested twice.
- `autoPlay muted loop playsInline preload="auto"`, `object-fit: cover`.
  `muted` is also set imperatively as a DOM property, because iOS honours the
  property and not the attribute React writes, and an unmuted video is never
  permitted to autoplay.
- It cross-fades in only on the `playing` event, so a video that stalls mid-load
  never blanks the hero.
- It is skipped entirely under `prefers-reduced-motion: reduce` or when the
  browser reports `navigator.connection.saveData`.
- `onError` and a rejected `play()` promise both fall back permanently to the
  still. **A dead video URL cannot break the hero.**
- `src` is set directly on `<video>` rather than on a `<source>` child, because
  error events from a `<source>` do not reach the parent's `onError` and this
  fallback has to be reliable.
- Readability: the existing shaped black scrim is unchanged, plus one extra flat
  25% layer that exists *only* while footage is playing. A still can be judged
  once; video walks through frames nobody approved, some far brighter than the
  photograph the gradient was tuned against. Gating it means the photographic
  fallback keeps exactly the treatment it shipped with.
- The video is `aria-hidden` with `tabIndex={-1}`. It is decorative and silent,
  so there is no audio to caption and nothing for a screen reader to gain.
