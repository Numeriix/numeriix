// Builds numeriix.com into dist/ from src/apps.json, src/logos and src/static. No dependencies:
// `node build.mjs`. Adding an app = one entry in src/apps.json plus its logo in src/logos.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const SRC = "src";
const OUT = "dist";
const YEAR = new Date().getFullYear();
const CONTACT = "support@bolilove.com";
const ORIGIN = "https://www.numeriix.com";
const SHARE = { path: "/og.jpg", alt: "Numeriix: apps built for everyday life in Congo." };

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function loadApps() {
  const apps = JSON.parse(readFileSync(join(SRC, "apps.json"), "utf8"));
  const seen = new Set();
  for (const app of apps) {
    for (const key of ["slug", "name", "tagline", "summary", "highlights", "website", "privacy", "gradient", "logo"]) {
      if (app[key] === undefined) throw new Error(`apps.json: ${app.slug ?? "?"} is missing "${key}"`);
    }
    if (!/^[a-z0-9-]+$/.test(app.slug)) throw new Error(`apps.json: bad slug "${app.slug}"`);
    if (seen.has(app.slug)) throw new Error(`apps.json: duplicate slug "${app.slug}"`);
    seen.add(app.slug);
    for (const key of ["website", "privacy", "googlePlay", "appStore"]) {
      if (app[key] !== undefined && !app[key].startsWith("https://")) throw new Error(`apps.json: ${app.slug}.${key} must be https`);
    }
    if (!app.gradient.every((c) => /^#[0-9a-fA-F]{6}$/.test(c))) throw new Error(`apps.json: ${app.slug}.gradient must be two #rrggbb colors`);
    if (!existsSync(join(SRC, app.logo))) throw new Error(`apps.json: ${app.slug} logo ${app.logo} not found`);
    if (app.shareImage && !existsSync(join(SRC, "static", app.shareImage)))
      throw new Error(`apps.json: ${app.slug} shareImage static/${app.shareImage} not found`);
  }
  return apps;
}

const gradient = (app) => `background:linear-gradient(160deg,${app.gradient[0]},${app.gradient[1]} 76%)`;

function logo(app) {
  const svg = readFileSync(join(SRC, app.logo), "utf8").trim();
  const tilt = app.logoTilt ? ` style="transform:rotate(${Number(app.logoTilt)}deg)"` : "";
  return svg.replace("<svg", `<svg aria-hidden="true"${tilt}`);
}

const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const ORGANIZATION = { "@type": "Organization", name: "Numeriix", url: `${ORIGIN}/`, logo: `${ORIGIN}/icon-512.png`, email: CONTACT };

/** Share images are 1200x630 JPEGs in src/static (the site default, or an app's shareImage). */
function page({ title, description, path, body, image = SHARE.path, imageAlt = SHARE.alt, noindex = false, ld }) {
  const url = `${ORIGIN}${path}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ""}<link rel="canonical" href="${url}">
<meta property="og:site_name" content="Numeriix">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ORIGIN}${image}">
<meta name="theme-color" content="#9400BD">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${ld ? `${jsonLd({ "@context": "https://schema.org", ...ld })}\n` : ""}<link rel="stylesheet" href="/styles.css">
</head>
<body>
<header class="wrap top"><a class="name" href="/">Numeriix</a><nav><a href="/#apps">Apps</a><a href="/#contact">Contact</a><a href="/policy/">Privacy</a></nav></header>
${body}
<footer class="wrap foot">© ${YEAR} Numeriix. Made for the Democratic Republic of Congo.</footer>
</body>
</html>
`;
}

function appTile(app) {
  return `<a class="tile" href="/apps/${app.slug}/">
<div class="art" style="${gradient(app)}">${logo(app)}</div>
<div class="about">
<h3>${esc(app.name)}</h3>
<p class="tag" style="color:${app.gradient[1]}">${esc(app.tagline)}</p>
<p>${esc(app.summary)}</p>
${app.status ? `<p class="status">${esc(app.status)}</p>` : ""}
<span class="more">About ${esc(app.name)}</span>
</div>
</a>`;
}

function home(apps) {
  const names = apps.map((a) => a.name).join(", ");
  return page({
    title: "Numeriix",
    description: `Numeriix builds apps for everyday life in the Democratic Republic of Congo: ${names}.`,
    path: "/",
    ld: ORGANIZATION,
    body: `<main>
<section class="wrap hero">
<h1>Apps built for everyday life in Congo.</h1>
<p>Numeriix makes software for people in the Democratic Republic of Congo: in their languages, on their phones, on the networks they really have.</p>
</section>
<section class="wrap" id="apps">
<h2 class="section">Our apps</h2>
<div class="apps${apps.length === 1 ? " one" : ""}">
${apps.map(appTile).join("\n")}
</div>
</section>
<section class="wrap contact" id="contact">
<div><h2>Contact</h2><p>Questions, partnerships or press: <a href="mailto:${CONTACT}">${CONTACT}</a></p></div>
<div><h2>Your data</h2><p>Each app's privacy policy is listed on our <a href="/policy/">privacy page</a>.</p></div>
</section>
</main>`,
  });
}

function appPage(app) {
  const links = [
    `<a class="btn" href="${esc(app.website)}">Visit ${esc(new URL(app.website).host)}</a>`,
    app.googlePlay ? `<a class="btn ghost" href="${esc(app.googlePlay)}">Get it on Google Play</a>` : "",
    app.appStore ? `<a class="btn ghost" href="${esc(app.appStore)}">Download on the App Store</a>` : "",
  ].filter(Boolean);
  return page({
    title: `${app.name}: ${app.tagline} | Numeriix`,
    description: app.summary,
    path: `/apps/${app.slug}/`,
    image: app.shareImage ? `/${app.shareImage}` : SHARE.path,
    imageAlt: `${app.name}: ${app.tagline}`,
    ld: {
      "@type": "MobileApplication",
      name: app.name,
      description: app.summary,
      url: app.website,
      operatingSystem: "ANDROID",
      publisher: ORGANIZATION,
    },
    body: `<main>
<section class="wrap"><div class="banner" style="${gradient(app)}">${logo(app)}<div><h1>${esc(app.name)}</h1><p>${esc(app.tagline)}</p></div></div></section>
<section class="wrap doc">
<p class="lead">${esc(app.summary)}</p>
${app.status ? `<p class="status">${esc(app.status)}</p>` : ""}
<ul>${app.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
<div class="actions">${links.join("")}</div>
<p>Privacy: <a href="${esc(app.privacy)}">${esc(app.name)} privacy policy</a></p>
</section>
</main>`,
  });
}

function policy(apps) {
  return page({
    title: "Privacy policy | Numeriix",
    description: "How numeriix.com and Numeriix apps handle your data.",
    path: "/policy/",
    body: `<main class="wrap doc">
<h1>Privacy policy</h1>
<h2>This website</h2>
<p>numeriix.com collects no personal data. It sets no cookies, runs no analytics or advertising, and has no forms. Our host keeps standard server logs (such as IP address and pages requested) for security, for a short period.</p>
<h2>Our apps</h2>
<p>Each app has its own privacy policy that explains what it collects, why, how long it is kept and how to delete your account:</p>
<ul>${apps.map((a) => `<li><strong>${esc(a.name)}</strong>: <a href="${esc(a.privacy)}">${esc(a.privacy.replace("https://", ""))}</a></li>`).join("")}</ul>
<h2>Contact</h2>
<p>For any privacy question or request, write to <a href="mailto:${CONTACT}">${CONTACT}</a>. We answer within 30 days.</p>
</main>`,
  });
}

function notFound() {
  return page({
    title: "Page not found | Numeriix",
    description: "Numeriix",
    path: "/404",
    noindex: true,
    body: `<main class="wrap doc"><h1>Page not found</h1><p>This page does not exist. <a href="/">Go to the home page</a> to see our apps.</p></main>`,
  });
}

function write(path, html) {
  const file = join(OUT, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const apps = loadApps();
rmSync(OUT, { recursive: true, force: true });
cpSync(join(SRC, "static"), OUT, { recursive: true });
write("index.html", home(apps));
write("policy/index.html", policy(apps));
write("404.html", notFound());
for (const app of apps) write(`apps/${app.slug}/index.html`, appPage(app));
const paths = ["/", "/policy/", ...apps.map((a) => `/apps/${a.slug}/`)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${ORIGIN}${p}</loc></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
console.log(`Built ${apps.length} app page(s) into ${OUT}/`);
