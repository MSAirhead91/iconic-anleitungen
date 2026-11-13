import fs from "node:fs/promises";
import path from "node:path";
import { uiFor } from "./i18n.mjs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const [input, output, moduleRoot, locale = "de", alternateHref = "", catalogHref = ""] = process.argv.slice(2);
const ui = uiFor(locale);
if (!input || !output || path.resolve(input) === path.resolve(output)) {
  throw new Error("Aufruf: node render.mjs quelle.md anleitung.html [node_modules]");
}
const require = moduleRoot
  ? createRequire(path.join(path.resolve(moduleRoot), "resolver.cjs"))
  : createRequire(import.meta.url);
const { marked } = await import(pathToFileURL(require.resolve("marked")).href);
const asset = (name) => fs.readFile(new URL(name, import.meta.url), "utf8");
const [source, styles, fonts, logo, viewer, viewerScript] = await Promise.all([
  fs.readFile(input, "utf8"), asset("layout.css"), asset("fonts.css"), asset("logo.svg"), asset("image-viewer.html"), asset("image-viewer.js"),
]);
async function readConfig(name, fallback = "") {
  for (const dir of [path.dirname(input), path.dirname(path.dirname(input))]) {
    try { return await fs.readFile(path.join(dir, name), "utf8"); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  return fallback;
}
const localStyles = await readConfig("layout.local.css");
const outlines = JSON.parse(await readConfig("screenshot-outlines.json", "{}"));
const revision = (await readConfig("stand.txt")).trim();
if (revision && !/^(0[1-9]|1[0-2])\/\d{4}$/.test(revision)) throw new Error("Stand muss MM/JJJJ entsprechen.");
const embed = (mime, value) => "data:" + mime + ";base64," + Buffer.from(value).toString("base64");
const escape = (value) => String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const viewerHtml = viewer.replace(/\{\{([a-zA-Z]+)\}\}/g, (_, key) => {
  if (!Object.hasOwn(ui, key)) throw new Error("Missing UI translation: " + key);
  return escape(ui[key]);
});
const logoUrl = embed("image/svg+xml", logo);
const tokens = marked.lexer(source);
const titleToken = tokens.shift();
if (titleToken?.type !== "heading" || titleToken.depth !== 1) {
  throw new Error("Die Markdown-Quelle muss mit einer H1 beginnen.");
}

const images = new Map();
marked.walkTokens(tokens, (token) => {
  if (token.type !== "image" || images.has(token.href)) return;
  if (!/^(?:\.\.\/)?screenshots\/[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp)$/i.test(token.href)) {
    throw new Error("Screenshot muss im lokalen Unterordner screenshots liegen: " + token.href);
  }
  const extension = path.extname(token.href).toLowerCase();
  const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[extension];
  images.set(token.href, fs.readFile(path.join(path.dirname(input), token.href)).then((data) => embed(mime, data)));
});
for (const [name, value] of await Promise.all([...images].map(async ([name, promise]) => [name, await promise]))) {
  images.set(name, value);
}

const renderer = new marked.Renderer();
renderer.html = (token) => escape(token.text);
renderer.image = (token) => {
  const key = token.title || token.text;
  const config = outlines[key];
  const outline = config ? '<svg class="screenshot-outline" aria-hidden="true" viewBox="' + escape(config.viewBox) + '">' + config.paths.map(d => '<path d="' + escape(d) + '" vector-effect="non-scaling-stroke"/>').join('') + '</svg>' : '';
  return '<a class="screenshot-link" href="' + images.get(token.href) + '" target="_blank" rel="noopener" aria-label="' + escape(token.text) + ' – ' + escape(ui.enlarge) + '" aria-haspopup="dialog" title="' + escape(ui.screenshotTitle) + '"><img src="' + images.get(token.href) + '" alt="' + escape(token.text) + '" data-shot="' + escape(token.title || '') + '">' + outline + '</a>';
};
renderer.link = function(token) {
  const label = this.parser.parseInline(token.tokens);
  return /^(https?:\/\/|mailto:|#)/i.test(token.href)
    ? '<a href="' + escape(token.href) + '">' + label + '</a>'
    : label;
};
const render = (group) => marked.parser(group, { renderer });
const intro = [];
const chapters = [];
let group = intro;
for (const token of tokens) {
  if (token.type === "heading" && token.depth === 2) {
    group = [];
    chapters.push({ label: token.text, tokens: group });
  } else {
    group.push(token);
  }
}
if (!chapters.length) throw new Error("Mindestens ein Abschnitt mit H2 wird benötigt.");
const title = escape(titleToken.text);
const nav = chapters.map(({ label }, index) => '<a href="#abschnitt-' + (index+1) + '">' + escape(label) + '</a>').join("");
const sections = chapters.map(({ label, tokens }, index) => '<section class="chapter" id="abschnitt-' + (index+1)
  + '"><img class="print-mark" src="' + logoUrl + '" alt=""><h2><a href="#titelseite" title="' + escape(ui.back) + '">' + escape(label) + '</a></h2>' + render(tokens) + '</section>').join("\n");
const guideLinks = (alternateHref || catalogHref) ? '<div class="guide-links" role="navigation" aria-label="' + escape(ui.languages) + '">' + (catalogHref ? '<a href="' + escape(catalogHref) + '">' + escape(ui.allGuides) + '</a>' : '') + (alternateHref ? '<a href="' + escape(alternateHref) + '" lang="' + ui.otherLocale + '" hreflang="' + ui.otherLocale + '">' + escape(ui.otherName) + '</a>' : '') + '</div>' : '';
const html = `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><style>${fonts}\n${styles}\n${localStyles}</style></head>
<body><header class="cover" id="titelseite"><img class="logo" src="${logoUrl}" alt="ICONIC SALES">
<div class="cover-frame"><div class="cover-mark" aria-hidden="true"> <span>ICONIC<br>INFO</span></div>
<h1><span>${title}</span></h1>
${render(intro)}<small class="cover-place"><span>STUTTGART | LONDON</span>${revision ? `<span class="cover-revision">${escape(ui.revision)}: ${escape(revision)}</span>` : ""}</small></div></header>
<main>${guideLinks}<nav aria-label="${escape(ui.contents)}">${nav}</nav>${sections}</main>${viewerHtml}<script>${viewerScript}</script></body></html>\n`;
await fs.writeFile(output, html, "utf8");

