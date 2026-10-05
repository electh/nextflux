import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { htmlToDOM } from "html-react-parser";
import { YouTubeVideo } from "@videojs/react/media/youtube-video";
import {
  getAdapterSource,
  resolveMediaSource,
} from "../../src/domain/articles/mediaSource.js";

test("YouTube iframe overrides page no-referrer policy before the initial embed request", () => {
  for (const domain of ["www.youtube.com", "www.youtube-nocookie.com"]) {
    const selection = resolveMediaSource(
      `https://${domain}/embed/aqz-KE-bpKQ?t=30`,
    );
    const markup = renderToStaticMarkup(
      createElement(YouTubeVideo, { source: getAdapterSource(selection) }),
    );
    const [iframe] = htmlToDOM(markup);
    assert.equal(
      iframe.attribs.referrerpolicy,
      "strict-origin-when-cross-origin",
    );
    assert.equal(new URL(iframe.attribs.src).hostname, domain);
    assert.equal(new URL(iframe.attribs.src).searchParams.get("start"), "30");
  }
});

test("native media and other platform adapters keep their existing source behavior", () => {
  assert.equal(getAdapterSource(resolveMediaSource("clip.mp4")), undefined);
  assert.equal(
    getAdapterSource(resolveMediaSource("https://vimeo.com/76979871")),
    undefined,
  );
  assert.deepEqual(getAdapterSource(resolveMediaSource("stream.m3u8")), {
    src: "stream.m3u8",
    type: "application/vnd.apple.mpegurl",
  });
});
