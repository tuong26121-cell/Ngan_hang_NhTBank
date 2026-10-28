// Run `npm run build` first. Uses the actual production bundle, with no second app.
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.resolve(
  process.argv[2] || path.join(root, "dist/standalone"),
);
const assets = path.join(root, "dist/assets");
const files = await readdir(assets);
const cssFile = files.find((file) => /^index-.*\.css$/.test(file));
const jsFile = files.find((file) => /^index-.*\.js$/.test(file));
if (!cssFile || !jsFile)
  throw new Error("Chạy npm run build trước khi xuất HTML.");
let css = await readFile(path.join(assets, cssFile), "utf8");
for (const file of await readdir(path.join(root, "dist/fonts"))) {
  if (!file.endsWith(".ttf")) continue;
  const encoded = (
    await readFile(path.join(root, "dist/fonts", file))
  ).toString("base64");
  css = css.replaceAll(`/fonts/${file}`, `data:font/ttf;base64,${encoded}`);
}
const js = (await readFile(path.join(assets, jsFile), "utf8")).replace(
  /<\/script/gi,
  "<\\/script",
);
await mkdir(output, { recursive: true });
for (const platform of ["Android", "Windows"]) {
  const html = `<!doctype html>
<html lang="vi"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#1686ed">
<title>NhTBank 1.1 — ${platform}</title>
<style>${css}</style></head><body><div id="root"></div>
<script type="module">${js}</script></body></html>`;
  const filename = `NhTBank-${platform}.html`;
  await writeFile(path.join(output, filename), html);
  console.log(`Đã xuất ${filename}`);
}
