# Shehnai – Wedding Invitation

A responsive digital wedding invitation with a cinematic opening and scroll animations.

**Experience flow:** wax-seal tap → seal breaks → curtain video plays once → couple's names animate in → scroll unlocks → scratch-to-reveal date → live countdown → location with Google Map → "Together with their families" card → pre-wedding event cards (Mayun, Mehndi, Baraat, Walima) that open an animated envelope modal → designer credits.

**Built with:** TanStack Start, React, GSAP, Tailwind CSS, Vite.

## Getting started

```bash
bun install        # or: npm install
bun run dev        # http://localhost:3000
bun run build      # production build
bun run test       # unit tests
```

## Editing the invitation

All names, dates, times, venues and credits live in one file:

`src/lib/wedding-invitation-data.ts`

| What | Where |
|---|---|
| Bride / groom names and parents | `couple` |
| Main wedding date, time and countdown target | `wedding` (`isoDateTime` uses Pakistan time, UTC+05:00) |
| Map location and the notes shown beneath it | `venue` |
| Mayun, Mehndi, Baraat, Walima details | `eventInvitation` |
| Instagram / WhatsApp credits | `designer` |

## Media

- Portrait (phone/tablet) video: `src/assets/gold-curtains-opening.mp4`, cover: `src/assets/elegant-sage-monogram-seal.png`
- Landscape (laptop/desktop) video and cover: `src/assets/landscape/video.mp4` and `cover.png`. If these files are missing, the portrait versions are used.
- Seal position and size for each version: `src/lib/stage-assets.ts`
- Background texture shown while scrolling: `src/assets/champagne-damask.jpg`

## Deploying to Vercel

This project uses `@lovable.dev/vite-tanstack-config` (TanStack Start + Nitro), which Vercel detects automatically.

**Option A – GitHub (recommended)**
1. Push the project to a GitHub repository.
2. Go to https://vercel.com/new, import the repository, keep the "TanStack Start" framework preset and click Deploy.

**Option B – CLI**
```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

If the framework is not detected: `vercel project update <project-name> --framework tanstack-start`

## WhatsApp / social link preview

- Preview image: `public/og-image.jpg` (1200×630)
- After you have a live domain, set `SITE_URL` in `src/lib/site.ts` (no trailing slash) and redeploy. Preview images need an absolute URL.
- WhatsApp caches previews. To refresh, paste the link into https://developers.facebook.com/tools/debug/ and click "Scrape Again".
