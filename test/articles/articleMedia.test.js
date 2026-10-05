import test from "node:test";
import assert from "node:assert/strict";
import { htmlToDOM } from "html-react-parser";
import {
  getArticleMedia,
  getMediaEnclosures,
  hasMediaContent,
} from "../../src/domain/articles/articleMedia.js";

test("detects players nested in paragraphs so their block UI gets a valid container", () => {
  const [node] = htmlToDOM(
    '<p><a href="clip.mp4"><video src="clip.mp4"></video></a></p>',
  );
  assert.equal(hasMediaContent(node), true);
  assert.equal(hasMediaContent(htmlToDOM("<p>Text</p>")[0]), false);
});

test("preserves alternate media sources, captions and native playback flags", () => {
  const [node] = htmlToDOM(
    '<video poster="cover.jpg" loop muted crossorigin="anonymous"><source src="clip.webm" type="video/webm"><source src="clip.mp4" type="video/mp4"><track src="captions.vtt" kind="captions" srclang="zh" label="中文" default></video>',
  );
  const media = getArticleMedia(node);
  assert.equal(media.kind, "video");
  assert.equal(media.poster, "cover.jpg");
  assert.equal(media.loop, true);
  assert.equal(media.muted, true);
  assert.equal(media.crossOrigin, "anonymous");
  assert.deepEqual(
    media.sources.map((source) => source.src),
    ["clip.webm", "clip.mp4"],
  );
  assert.deepEqual(media.tracks, [
    {
      src: "captions.vtt",
      kind: "captions",
      srcLang: "zh",
      label: "中文",
      default: true,
    },
  ]);
});

test("reads direct audio sources without enabling absent boolean attributes", () => {
  const [node] = htmlToDOM('<audio src="music.mp3"></audio>');
  assert.equal(getArticleMedia(node).src, "music.mp3");
  assert.equal(getArticleMedia(node).loop, false);
  assert.equal(getArticleMedia(node).muted, false);
});

test("renders every unique media enclosure and excludes inline media and image attachments", () => {
  const enclosures = [
    { url: "inline.mp3", mime_type: "audio/mpeg" },
    { url: "music.mp3", mime_type: "audio/mpeg" },
    { url: "music.mp3", mime_type: "audio/mpeg" },
    { url: "clip.mp4", mime_type: "video/mp4" },
    { url: "cover.jpg", mime_type: "image/jpeg" },
    { mime_type: "audio/mpeg" },
  ];
  assert.deepEqual(
    getMediaEnclosures(enclosures, ["inline.mp3"]).map((item) => item.url),
    ["music.mp3", "clip.mp4"],
  );
  assert.deepEqual(getMediaEnclosures(), []);
});
