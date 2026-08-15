# Brand assets

How the logo, the wordmark and the hero video are wired up, and what still has
to be added by hand.

---

## Status

| Asset | Expected path | Present in this repo |
| --- | --- | --- |
| Logo mark | `public/brand/logo.svg` | **No — must be added** |
| Wordmark | `public/brand/company_name.svg` | **No — must be added** |
| Hero video | external Pexels URL | Yes, by reference |
| Hero poster | external Pexels URL | Yes, by reference |

The code for the two SVGs is complete and in place. The files themselves are
not in the repository — there is no `public/` directory in the history of
`new-main`, `main` or `agent/seo-foundation`, and no `.svg` file anywhere in
the tree. Adding the two files is the only remaining step; no code has to
change when you do.

### Adding them

```bash
git checkout new-main
mkdir -p public/brand
cp /path/to/logo.svg          public/brand/logo.svg
cp /path/to/company_name.svg  public/brand/company_name.svg
git rm public/brand/.gitkeep
git add public/brand
git commit -m "chore(brand): add official logo and wordmark"
git push
```

The filenames matter. They are declared once, in `lib/site-config.ts`:

```ts
branding: {
  logo: "/brand/logo.svg",
  companyName: "/brand/company_name.svg",
  logoAlt: "شعار الكيان",
  companyNameAlt: "الكيان",
}
```

If you would rather use different names, change them there and nowhere else.

---

## How they are rendered

One file owns this: `components/brand.tsx`, exporting `BrandLogo`,
`BrandWordmark` and `BrandLockup`. Nothing else in the codebase references an
asset path.

Three rules are deliberately enforced by that component:

**The SVGs are never modified.** They are referenced by URL, not inlined, so no
CSS rule, `currentColor` inheritance or SVGO pass in this repo can alter the
artwork. What you commit is what renders.

**Sizing is height-only.** Every call site sets a height class and the
component adds `width: auto` and `object-contain`. The intrinsic aspect ratio
of whatever you supply is preserved at every breakpoint. This matters because
the code cannot know the dimensions of files it has never seen.

**Alt text is decided by context, not by default.** Where the surrounding
element already names the company — the header link has
`aria-label="الكيان — العودة إلى أعلى الصفحة"` — both assets are passed `alt=""`
and marked decorative. Announcing "الكيان" three times in a row is worse for a
screen-reader user than announcing it once. In the footer, where nothing else
names the company, the wordmark carries the accessible name and the mark next
to it is decorative.

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
the back-to-top control intentionally carry no logo. They sit inside a page
that already shows it twice; repeating it there is noise, not branding.

### The fallback

Each component falls back to the monogram tile and text lockup the site used
before, if its SVG fails to load. This is a degradation path, not a second
logo: it is unreachable the moment the asset resolves.

It exists because the alternative, while the files are missing, is a broken
image icon in the header of a production site. `siteConfig.monogram` is
retained solely to feed it.

---

## Not yet converted

Two surfaces still draw approximated branding, and both need a decision rather
than a patch:

**`app/icon.tsx`** renders the letters `AK` on a gold tile as the favicon,
via `ImageResponse` at the edge. Once `logo.svg` exists, the clean fix is to
delete this file and drop the SVG in as `app/icon.svg` — Next.js picks that up
automatically as the favicon. It is left alone for now because deleting it
today would leave the site with no favicon at all.

**`app/opengraph-image.tsx`** renders the string `AL-KAYAN` as the social
preview card. Satori, which powers `ImageResponse`, cannot render an external
SVG by URL; embedding the logo means reading the file at build time and
passing it as a data URI. Worth doing, but it is a change that only shows up
when someone shares a link, so it should be verified against a real preview
debugger rather than assumed.

---

## The hero video

Source: `https://www.pexels.com/download/video/31617692/`

### Decision: kept as an external URL, for now

The Pexels licence permits free use, including commercially, without
attribution, so serving this file from your own domain is legally fine. The
reason it is still an external reference is practical, and it should be
revisited:

- The file could not be fetched and committed in the environment this change
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
- Range requests and caching behaviour are outside your control, so seeking
  and re-buffering behaviour on mobile is unpredictable.
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

`-movflags +faststart` matters: it moves the metadata to the front of the file
so playback can begin before the whole thing has downloaded.

Then set, in every environment:

```
NEXT_PUBLIC_HERO_VIDEO_URL=/brand/hero.mp4
```

And consider a matching self-hosted poster via `NEXT_PUBLIC_HERO_POSTER_URL`.

### How playback is handled

In `components/sections/hero-section.tsx`:

- The still is the poster layer, is always mounted, and is what paints first.
  It is the LCP element. The video never blocks it.
- The `<video>` is not rendered at all until the browser reports idle
  (`requestIdleCallback`, 2.5s timeout, `setTimeout` fallback). One element,
  one `src`, mounted once — the file is never requested twice.
- `autoPlay muted loop playsInline preload="auto"`, `object-fit: cover`.
  `muted` is also set imperatively as a DOM property, because iOS honours the
  property and not the attribute React writes, and an unmuted video is never
  permitted to autoplay.
- It cross-fades in only on the `playing` event, so a video that stalls
  mid-load never blanks the hero.
- It is skipped entirely under `prefers-reduced-motion: reduce` or when the
  browser reports `navigator.connection.saveData`.
- `onError` and a rejected `play()` promise both fall back permanently to the
  still. **A dead video URL cannot break the hero.**
- `src` is set directly on `<video>` rather than on a `<source>` child, because
  error events from a `<source>` do not reach the parent's `onError` and this
  fallback has to be reliable.
- Readability: the existing shaped navy scrim is unchanged, plus one extra flat
  25% layer that exists *only* while footage is playing. A still can be judged
  once; video walks through frames nobody approved, some far brighter than the
  photograph the gradient was tuned against. Gating it means the photographic
  fallback keeps exactly the treatment it shipped with.
- The video is `aria-hidden` with `tabIndex={-1}`. It is decorative and silent,
  so there is no audio to caption and nothing for a screen reader to gain.
