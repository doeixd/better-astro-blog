# Better Astro Blog

`better-astro-blog` is an Astro blog template that upgrades the default starter with snappier navigation, stronger SEO metadata, and polished post sharing.

## Use This Template

- Click "Use this template" on GitHub to create your own repo from `doeixd/better-astro-blog`
- Or clone it locally and start customizing right away

## Highlights

- Faster navigation with Astro's client router, prefetching, and a lightweight loading indicator
- Rich metadata with canonical tags, Open Graph, Twitter cards, article metadata, and JSON-LD
- Generated per-post Open Graph images for better link previews
- Service worker caching for quicker repeat visits and offline-friendly shell pages
- Extended blog frontmatter for subtitles, tags, categories, authors, and updated dates

## What Changed

- Faster page navigation with Astro's client router and aggressive prefetching
- A lightweight loading indicator during client-side page swaps
- Image preloading for featured post cards and post hero images
- Service worker caching for shell pages, navigation, and static assets
- Expanded metadata in the shared head component
- Per-post Open Graph image generation at `src/pages/og/[slug].png.ts`
- Article JSON-LD and breadcrumb JSON-LD for blog posts
- Extra content fields for tags, category, subtitle, author, and updated date

## Metadata Included

This fork goes beyond the default template's basic SEO setup.

- Canonical URLs
- Open Graph tags
- Twitter card tags
- Article-specific Open Graph fields
- `keywords` and `news_keywords`
- Structured data for `BlogPosting` and breadcrumbs
- RSS, sitemap, manifest, robots, and theme-color support

## Project Structure

```text
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── fonts/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   ├── pages/
│   │   └── og/
│   └── styles/
├── astro.config.mjs
├── package.json
└── README.md
```

## Key Files

- `src/components/BaseHead.astro` manages shared metadata, the client router, manifest links, and service worker registration
- `src/layouts/BlogPost.astro` adds article metadata, JSON-LD, hero image preloading, and post-level OG image wiring
- `src/pages/blog/index.astro` adds card image placeholders and hover-triggered image preloading
- `src/content.config.ts` defines the extended blog frontmatter schema
- `public/sw.js` handles offline-friendly caching strategies

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro -- --help` | Show Astro CLI help |

## Customize Before Deploying

Update these placeholders first:

- `src/consts.ts` for site title, description, author, and social metadata
- `astro.config.mjs` for the production `site` URL
- `public/manifest.json` for your app name and description

## Credit

Based on Astro's default blog starter, which is itself inspired by [Bear Blog](https://github.com/HermanMartinus/bearblog/).
