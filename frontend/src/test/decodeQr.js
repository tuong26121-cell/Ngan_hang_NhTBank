import jsQR from "jsqr";

// Rasterize the generated SVG's integer cell path, then use an independent
// decoder. This checks the actual serialized code, including UTF-8 payloads.
export function decodeQr(url) {
  const svg = decodeURIComponent(url.slice(url.indexOf(",") + 1));
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const qr = document.querySelector("svg svg");
  const size = Number(qr.getAttribute("viewBox").split(" ")[2]);
  const scale = 3;
  const width = size * scale;
  const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
  for (const [, x, y] of qr
    .querySelector("path")
    .getAttribute("d")
    .matchAll(/M(\d+) (\d+)h1v1h-1z/g))
    for (let dy = 0; dy < scale; dy++)
      for (let dx = 0; dx < scale; dx++) {
        const offset =
          ((Number(y) * scale + dy) * width + Number(x) * scale + dx) * 4;
        pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 0;
      }
  return jsQR(pixels, width, width)?.data;
}
