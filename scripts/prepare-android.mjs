import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const web = new URL("../www/", import.meta.url);
await mkdir(web, { recursive: true });

for (const file of ["index.html", "style.css", "script.js", "icon.svg"]) {
  await copyFile(new URL(file, root), new URL(file, web));
}

let html = await readFile(new URL("index.html", web), "utf8");
html = html
  .replace(/\s*<link rel="manifest"[^>]*>/i, "")
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/i, "")
  .replace(/\s*<meta name="mobile-web-app-capable"[^>]*>/i, "")
  .replace(/\s*<meta name="apple-mobile-web-app-[^"]*"[^>]*>/gi, "")
  .replace(/<button class="pwa-action install-action"[^>]*>[\s\S]*?<\/button>/i, "")
  .replace(/<button class="pwa-action share-action"[^>]*>[\s\S]*?<\/button>/i, "")
  .replace(/\s*<script src="\.\/pwa\.js[^"]*"><\/script>/i, "")
  .replace("SYSTEM ONLINE", "OFFLINE READY")
  .replace("ORBIT / BUILD 4.3 · PILOT BACKUP", "ORBIT / ANDROID EDITION");
await writeFile(new URL("index.html", web), html, "utf8");
console.log("Prepared bundled offline web assets in www/");
