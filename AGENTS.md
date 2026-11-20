# AGENTS.md

## Rules

- The Eduminity brand mark lives in `src/assets/*.asset.json` as CDN asset pointers (`eduminity-logo.png` for light surfaces, `eduminity-logo-inverse.png` for dark surfaces, `eduminity-emblem.png` for narrow/collapsed rails). Import the pointer and render `pointer.url`; never copy the binary back into the repo and never hardcode a brand color in place of the artwork. Why: the CDN keeps the repo light while the URLs stay stable across deploys.
- Every brand mark must swap with the theme: render the light-surface image with `dark:hidden` and the dark-surface image with `hidden dark:block`, because the wordmark's "Edu" is near-black and disappears on the default dark theme. Why: dark mode is the default surface, so a single-variant logo reads as a missing brand name.
- The browser-tab icon is `public/favicon.png` (square emblem), declared in `index.html`; the default `public/favicon.ico` stays deleted so it cannot override the brand mark. Why: browsers request `/favicon.ico` first and would silently win.
- Brand marks that act as navigation keep the route each surface already uses (`/` on public pages, `/auth` in the app rails) and only the artwork changes. Why: logo-click destinations were deliberately re-pointed by the owner and swapping visuals must not move routing again.
- Page-head tags go through `src/components/Seo.tsx` (`<Seo>`), never `Helmet` imported directly, and `react-helmet-async` stays listed in `optimizeDeps.include`. Why: a bare `Helmet` whose provider context is lost throws while rendering and blanks the entire screen.
