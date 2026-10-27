import test from "node:test";
import assert from "node:assert/strict";
import { getCommentsUrl } from "../../src/domain/articles/commentsUrl.js";

test("opens valid discussions but never executable or malformed feed URLs", () => {
  assert.equal(
    getCommentsUrl("https://news.ycombinator.com/item?id=42"),
    "https://news.ycombinator.com/item?id=42",
  );
  for (const value of [
    undefined,
    "",
    "broken",
    "javascript:alert(1)",
    "data:text/html,x",
  ]) {
    assert.equal(getCommentsUrl(value), null);
  }
});
