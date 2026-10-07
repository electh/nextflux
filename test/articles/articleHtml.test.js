import test from "node:test";
import assert from "node:assert/strict";

import {
  getNodeText,
  hasImageContent,
  normalizeCode,
} from "../../src/domain/articles/articleHtml.js";

test("detects nested image content", () => {
  const node = {
    children: [
      { type: "tag", name: "a", children: [{ type: "tag", name: "img" }] },
    ],
  };
  assert.equal(hasImageContent(node), true);
});

test("extracts code text and preserves structural line breaks", () => {
  const node = {
    type: "tag",
    name: "div",
    children: [
      { type: "text", data: "first" },
      { type: "tag", name: "br", children: [] },
      { type: "text", data: "second" },
    ],
  };
  assert.equal(getNodeText(node), "first\nsecond\n");
  assert.equal(normalizeCode(node), "first\nsecond");
});
