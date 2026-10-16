import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

test("worker only handles explicit updates and removes its previous offline cache", async () => {
  const events = new Map();
  const removed = [];
  const scope = "https://nextflux.example/";
  let activations = 0;
  const oldCache = `workbox-precache-v2-${scope}`;
  runInNewContext(
    await readFile(new URL("../src/sw.js", import.meta.url), "utf8"),
    {
      self: {
        __WB_MANIFEST: [{ url: "index.html", revision: "release" }],
        registration: { scope },
        addEventListener: (type, handler) => events.set(type, handler),
        skipWaiting: () => {
          activations += 1;
        },
      },
      caches: {
        keys: async () => [oldCache, "other-app-cache", `${oldCache}other/`],
        delete: async (name) => {
          removed.push(name);
        },
      },
    },
  );
  assert.equal(events.has("fetch"), false);
  assert.equal(activations, 0);
  assert.deepEqual(removed, []);
  let cleanup;
  events.get("activate")({
    waitUntil: (promise) => {
      cleanup = promise;
    },
  });
  await cleanup;
  assert.deepEqual(removed, [oldCache]);
  events.get("message")({ data: { type: "UNRELATED" } });
  assert.equal(activations, 0);
  events.get("message")({ data: { type: "SKIP_WAITING" } });
  assert.equal(activations, 1);
});

test("only macOS Chromium selects the compensated manifest", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8",
  );
  const startup = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const [userAgent, expected] of [
    [
      "Macintosh Chrome/140.0 Safari/537.36",
      "/site-chromium-macos.webmanifest",
    ],
    ["Macintosh Version/26.0 Safari/605.1.15", "/site.webmanifest"],
    ["Windows NT 10.0 Chrome/140.0", "/site.webmanifest"],
    ["Linux; Android 16 Chrome/140.0", "/site.webmanifest"],
    ["iPhone CriOS/140.0 Mobile Safari/604.1", "/site.webmanifest"],
  ]) {
    const manifest = { href: "/site.webmanifest" };
    runInNewContext(startup, {
      navigator: { userAgent },
      localStorage: { getItem: () => null },
      matchMedia: () => ({ matches: false }),
      document: {
        documentElement: { classList: { add() {} }, dataset: {} },
        querySelector: (selector) =>
          selector.includes("manifest") ? manifest : {},
      },
    });
    assert.equal(manifest.href, expected, userAgent);
  }
});

test("platform manifests share app identity and keep Safari artwork independent", async () => {
  const load = async (name) =>
    JSON.parse(await readFile(new URL(`../public/${name}`, import.meta.url)));
  const standard = await load("site.webmanifest");
  const chrome = await load("site-chromium-macos.webmanifest");
  for (const key of ["id", "name", "start_url", "scope", "display"]) {
    assert.equal(chrome[key], standard[key]);
  }
  for (const icon of chrome.icons.filter(
    (icon) => icon.purpose === "maskable",
  )) {
    assert.ok(icon.src.includes("macos-chromium"));
    const png = await readFile(
      new URL(`../public${icon.src}`, import.meta.url),
    );
    assert.equal(icon.sizes, `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`);
  }
  assert.ok(
    standard.icons.every((icon) => !icon.src.includes("macos-chromium")),
  );
});

test("manifest supplies real PNG sizes for ordinary and maskable platform icons", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../public/site.webmanifest", import.meta.url)),
  );
  assert.equal(manifest.id, "/");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  assert.ok(
    manifest.icons.some(
      (icon) => icon.purpose === "maskable" && icon.sizes === "1024x1024",
    ),
    "Safari on macOS needs a high-resolution full-bleed icon",
  );
  for (const purpose of ["any", "maskable"]) {
    for (const size of [192, 512]) {
      assert.ok(
        manifest.icons.some(
          (icon) =>
            icon.purpose === purpose && icon.sizes === `${size}x${size}`,
        ),
      );
    }
  }
  for (const icon of manifest.icons) {
    const png = await readFile(
      new URL(`../public${icon.src}`, import.meta.url),
    );
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(icon.sizes, `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`);
  }
});
