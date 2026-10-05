export function hasMediaContent(node) {
  return (node.children || []).some(
    (child) =>
      child.name === "audio" ||
      child.name === "video" ||
      (child.name === "iframe" &&
        resolveMediaSource(child.attribs?.src).adapter !== "native") ||
      hasMediaContent(child),
  );
}

export function getArticleMedia(node) {
  const attrs = node.attribs || {};
  const children = node.children || [];
  return {
    kind: node.name,
    src: attrs.src,
    type: attrs.type,
    poster: attrs.poster,
    loop: "loop" in attrs,
    muted: "muted" in attrs,
    crossOrigin: attrs.crossorigin,
    sources: children
      .filter((child) => child.name === "source" && child.attribs?.src)
      .map((child) => ({
        src: child.attribs.src,
        type: child.attribs.type,
        media: child.attribs.media,
      })),
    tracks: children
      .filter((child) => child.name === "track" && child.attribs?.src)
      .map((child) => ({
        src: child.attribs.src,
        kind: child.attribs.kind,
        srcLang: child.attribs.srclang,
        label: child.attribs.label,
        default: "default" in child.attribs,
      })),
  };
}

export function getMediaEnclosures(enclosures = [], inlineUrls = []) {
  const seen = new Set(inlineUrls);
  return enclosures.filter((enclosure) => {
    if (
      !enclosure.url ||
      (!/^(audio|video)\//i.test(enclosure.mime_type || "") &&
        resolveMediaSource(enclosure.url, { type: enclosure.mime_type })
          .adapter === "native")
    ) {
      return false;
    }
    if (seen.has(enclosure.url)) return false;
    seen.add(enclosure.url);
    return true;
  });
}
import { resolveMediaSource } from "./mediaSource.js";
