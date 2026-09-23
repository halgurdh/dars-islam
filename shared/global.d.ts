// Build-time global injected by injectBasePath()'s `define` config in
// shared/game-vite-plugins.ts — the site root path (e.g. '/' locally,
// '/dars-islam/' on GitHub Pages), available to plain TS/JS source the
// same way __VITE_BASE_PATH__ is available inside HTML.
declare const __SITE_BASE_PATH__: string;
