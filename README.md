# numeriix.com

Company site for Numeriix, built by `node build.mjs` (no dependencies) into `dist/` and deployed by
Netlify on every push to `release` (see `netlify.toml`).

## Add an app

1. Put its logo in `src/logos/<slug>.svg` with `fill="currentColor"` (it is drawn in white).
2. Add an entry to `src/apps.json`:
   - required: `slug`, `name`, `tagline`, `summary`, `highlights` (list), `website`, `privacy`,
     `gradient` (two `#rrggbb` colors), `logo`
   - optional: `status` (for example "Launching soon on Android"), `googlePlay`, `appStore`,
     `shareImage` (a 1200x630 JPEG in `src/static`, shown when the app page is shared),
     `logoTilt` (degrees)
3. `node build.mjs`, then preview with `python3 -m http.server -d dist 8000`.

The home page grid, the app's page at `/apps/<slug>/` and the list on `/policy/` update from that
entry. The build stops with a clear message when a field is missing or invalid.
