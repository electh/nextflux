const HLS_TYPES = new Set([
  "application/vnd.apple.mpegurl",
  "application/x-mpegurl",
  "audio/mpegurl",
  "audio/x-mpegurl",
]);
const hostMatches = (host, domain) =>
  host === domain || host.endsWith(`.${domain}`);

// Only recognize documented media URLs; ordinary article links and unknown embeds stay intact.
export function resolveMediaSource(src, { kind = "video", type } = {}) {
  const native = { adapter: "native", kind, src, type };
  if (!src) return native;
  let url;
  try {
    url = new URL(src, "https://media.invalid");
  } catch {
    return native;
  }
  if (!/^https?:$/.test(url.protocol)) return native;
  const host = url.hostname.toLowerCase();
  const path = url.pathname;
  const result = (adapter, mediaKind = "video", mediaSrc = src) => ({
    adapter,
    kind: mediaKind,
    src: mediaSrc,
  });

  if (
    (hostMatches(host, "youtube.com") ||
      hostMatches(host, "youtube-nocookie.com")) &&
    ((path === "/watch" && url.searchParams.has("v")) ||
      /^\/(embed|shorts|live)\/[^/]+/.test(path) ||
      ((path === "/playlist" || path === "/embed/videoseries") &&
        url.searchParams.has("list")))
  )
    return result("youtube");
  if (host === "youtu.be" && /^\/[^/]+/.test(path)) return result("youtube");
  const mime = type?.split(";")[0].trim().toLowerCase();
  if (HLS_TYPES.has(mime) || /\.m3u8$/i.test(path)) {
    return { adapter: "hls", kind, src, type: "application/vnd.apple.mpegurl" };
  }
  return native;
}

export function getMediaSelection({ src, sources = [], kind, type }) {
  const first = src ? { src, type } : sources[0] || {};
  return resolveMediaSource(first.src, { kind, type: first.type });
}

export function getMediaLink(selection) {
  if (selection.kind !== "video" || !selection.src) return undefined;
  let url;
  try {
    url = new URL(selection.src, "https://media.invalid");
  } catch {
    return undefined;
  }
  if (!/^https?:$/.test(url.protocol)) return undefined;
  if (selection.adapter !== "youtube") return selection.src;

  // Open the public video page instead of sending users to an iframe player.
  const pathParts = url.pathname.split("/").filter(Boolean);
  const videoId =
    url.searchParams.get("v") ||
    (url.hostname === "youtu.be" ? pathParts[0] : pathParts[1]);
  const link = new URL("https://www.youtube.com/watch");
  if (videoId && videoId !== "videoseries") link.searchParams.set("v", videoId);
  else link.pathname = "/playlist";
  const list = url.searchParams.get("list");
  if (list) link.searchParams.set("list", list);
  const time = url.searchParams.get("t") || url.searchParams.get("start");
  if (time) link.searchParams.set("t", time);
  return link.href;
}

export function getAdapterSource(selection) {
  if (selection.adapter === "youtube") {
    // The app defaults to no-referrer, but YouTube rejects unidentified embeds
    // with error 153. Send only the origin for cross-origin iframe requests.
    return {
      src: selection.src,
      engine: {
        youtube: { referrerPolicy: "strict-origin-when-cross-origin" },
      },
    };
  }
  if (selection.adapter !== "native" && selection.type) {
    return { src: selection.src, type: selection.type };
  }
  return undefined;
}
