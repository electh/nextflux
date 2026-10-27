import test from "node:test";
import assert from "node:assert/strict";

import { mapEntryToArticle } from "../../src/domain/articles/mapEntryToArticle.js";

test("maps a Miniflux entry to the stored article shape", () => {
  const article = mapEntryToArticle({
    id: 42,
    feed: { id: 7 },
    title: "Example",
    author: "Author",
    url: "https://example.com/article",
    comments_url: "https://news.ycombinator.com/item?id=42",
    content: "<p>Body</p>",
    status: "unread",
    starred: true,
    published_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:01:00Z",
    reading_time: 3,
    enclosures: null,
  });

  assert.deepEqual(article, {
    id: 42,
    feedId: 7,
    title: "Example",
    author: "Author",
    url: "https://example.com/article",
    commentsUrl: "https://news.ycombinator.com/item?id=42",
    content: "<p>Body</p>",
    status: "unread",
    starred: 1,
    published_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:01:00Z",
    reading_time: 3,
    enclosures: [],
  });
});

test("supports entry responses that expose feed_id directly", () => {
  const article = mapEntryToArticle({ id: 1, feed_id: 9, starred: false });

  assert.equal(article.feedId, 9);
  assert.equal(article.starred, 0);
});
