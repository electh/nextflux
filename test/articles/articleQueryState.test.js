import test from "node:test";
import assert from "node:assert/strict";
import { getArticleQueryState } from "../../src/domain/articles/articleQueryState.js";

test("home route is safe before the live query returns", () => {
  assert.deepEqual(getArticleQueryState(undefined, undefined), {
    error: null,
    loading: false,
  });
  assert.deepEqual(
    getArticleQueryState(undefined, { articleId: undefined, article: null }),
    {
      error: null,
      loading: false,
    },
  );
});

test("article routes wait for their own result and ignore stale errors", () => {
  assert.deepEqual(getArticleQueryState("810", undefined), {
    error: null,
    loading: true,
  });
  assert.deepEqual(
    getArticleQueryState("810", { articleId: "811", error: "old failure" }),
    { error: null, loading: true },
  );
  assert.deepEqual(
    getArticleQueryState("810", { articleId: "810", article: null }),
    { error: null, loading: false },
  );
  assert.deepEqual(
    getArticleQueryState("810", { articleId: "810", error: "failed" }),
    { error: "failed", loading: false },
  );
});
