import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveMediaSource,
  getMediaSelection,
  getMediaLink,
} from "../../src/domain/articles/mediaSource.js";
import { getMediaEnclosures } from "../../src/domain/articles/articleMedia.js";

test("links YouTube embeds to public pages while preserving playlist and start time", () => {
  assert.equal(
    getMediaLink(
      resolveMediaSource(
        "//www.youtube-nocookie.com/embed/abc?list=PL123&start=30&autoplay=1",
      ),
    ),
    "https://www.youtube.com/watch?v=abc&list=PL123&t=30",
  );
  assert.equal(
    getMediaLink(resolveMediaSource("https://youtu.be/abc?t=20")),
    "https://www.youtube.com/watch?v=abc&t=20",
  );
  assert.equal(
    getMediaLink(
      resolveMediaSource(
        "https://www.youtube.com/embed/videoseries?list=PL123",
      ),
    ),
    "https://www.youtube.com/playlist?list=PL123",
  );
});

test("keeps video source URLs intact and excludes audio and non-web sources", () => {
  for (const src of [
    "/clip.mp4",
    "https://cdn.example.com/stream.m3u8?token=signed",
  ]) {
    assert.equal(getMediaLink(resolveMediaSource(src)), src);
  }
  for (const src of [
    "javascript:alert(1)",
    "data:video/mp4;base64,123",
    undefined,
  ]) {
    assert.equal(getMediaLink(resolveMediaSource(src)), undefined);
  }
  assert.equal(
    getMediaLink(
      resolveMediaSource("https://example.com/audio.mp3", { kind: "audio" }),
    ),
    undefined,
  );
});

const cases = [
  ["https://www.youtube.com/embed/aqz-KE-bpKQ?start=30", "youtube"],
  ["//www.youtube-nocookie.com/embed/aqz-KE-bpKQ", "youtube"],
  ["https://youtu.be/aqz-KE-bpKQ?t=20", "youtube"],
  ["https://www.youtube.com/playlist?list=PL123", "youtube"],
  ["https://stream.mux.com/id.m3u8?token=secret", "hls"],
  ["https://cdn.example.com/stream.M3U8?token=secret", "hls"],
  ["/streams/stream.m3u8", "hls"],
];
for (const [src, adapter, kind = "video"] of cases) {
  test(`recognizes ${adapter}: ${src}`, () => {
    const result = resolveMediaSource(src);
    assert.equal(result.adapter, adapter);
    assert.equal(result.kind, kind);
    assert.equal(result.src, src);
  });
}

test("keeps unsupported platforms, collection pages and lookalike hosts intact", () => {
  for (const src of [
    "https://player.bilibili.com/player.html?bvid=BV123",
    "https://clips.twitch.tv/Clip",
    "https://player.twitch.tv/?video=v123&parent=example.com",
    "https://player.vimeo.com/video/76979871?h=private",
    "https://fast.wistia.net/embed/iframe/abcde12345",
    "https://customer-test.cloudflarestream.com/token/iframe",
    "https://open.spotify.com/embed/episode/123",
    "spotify:album:123",
    "https://www.tiktok.com/player/v1/7527476667770522893",
    "https://cdn.example.com/stream.mpd",
    "https://vimeo.com/channels/123",
    "https://youtube.com.attacker.test/embed/id",
    "https://example.com/?url=https://youtube.com/embed/id",
    "https://www.tiktok.com/@user",
    "https://youtube.com/",
    "javascript:alert(1)",
    "clip.mp4",
    undefined,
  ]) {
    assert.equal(resolveMediaSource(src).adapter, "native", src);
  }
});

test("detects signed extensionless stream sources using MIME type and keeps audio mode", () => {
  assert.deepEqual(
    resolveMediaSource("https://cdn.example.com/play?id=1", {
      kind: "audio",
      type: "application/x-mpegURL; charset=UTF-8",
    }),
    {
      adapter: "hls",
      kind: "audio",
      src: "https://cdn.example.com/play?id=1",
      type: "application/vnd.apple.mpegurl",
    },
  );
  assert.equal(
    resolveMediaSource("https://stream.mux.com/id/audio.m4a").adapter,
    "native",
  );
});

test("selects an adapter from child source tags but respects a direct src", () => {
  assert.equal(
    getMediaSelection({
      kind: "video",
      sources: [{ src: "stream", type: "application/vnd.apple.mpegurl" }],
    }).adapter,
    "hls",
  );
  assert.equal(
    getMediaSelection({
      kind: "video",
      src: "clip.mp4",
      sources: [{ src: "stream.m3u8" }],
    }).adapter,
    "native",
  );
});

test("includes streaming and platform enclosures even with non audio/video MIME types", () => {
  const items = [
    { url: "stream.m3u8", mime_type: "application/vnd.apple.mpegurl" },
    {
      url: "https://www.youtube.com/embed/aqz-KE-bpKQ",
      mime_type: "text/html",
    },
    { url: "https://open.spotify.com/episode/123", mime_type: "text/html" },
    { url: "https://example.com/article", mime_type: "text/html" },
  ];
  assert.deepEqual(getMediaEnclosures(items), items.slice(0, 2));
  assert.deepEqual(getMediaEnclosures(items, ["stream.m3u8"]), [items[1]]);
});
