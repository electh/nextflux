// theme-color needs a concrete sRGB color; --sidebar can contain OKLCH,
// color-mix(), or references to other custom properties.
export function syncBrowserTheme() {
  const root = document.documentElement;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = getComputedStyle(root).backgroundColor;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  const color = `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = color;
}
