import test from "node:test";
import assert from "node:assert/strict";
import { validateAiSetting } from "../../src/lib/aiSettings.js";

test("all AI settings reject empty and whitespace-only values", () => {
  for (const name of ["aiApiKey", "aiBaseUrl", "aiModel", "aiPrompt"]) {
    for (const value of ["", "  \t\n", undefined]) {
      assert.equal(validateAiSetting(name, value), "required");
    }
  }
});

test("base URLs require an absolute HTTP or HTTPS address", () => {
  for (const value of [
    "api.example.com/v1",
    "/v1",
    "ftp://example.com",
    "https://",
    "https://example.com/a b",
  ]) {
    assert.equal(validateAiSetting("aiBaseUrl", value), "invalidBaseUrl");
  }
  for (const value of [
    "https://api.example.com/v1",
    "http://localhost:1234/v1",
    " https://example.com/v1/ ",
  ]) {
    assert.equal(validateAiSetting("aiBaseUrl", value), null);
  }
});

test("compatible API keys, model IDs and multiline prompts stay unrestricted", () => {
  assert.equal(validateAiSetting("aiApiKey", "custom-provider-key"), null);
  assert.equal(validateAiSetting("aiModel", "provider/model-v2"), null);
  assert.equal(validateAiSetting("aiPrompt", "Summarize.\nUse Chinese."), null);
});
