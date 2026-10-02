import test from "node:test";
import assert from "node:assert/strict";
import {
  createSettingsBackup,
  parseSettingsBackup,
  MAX_BACKUP_BYTES,
} from "../../src/domain/preferences/settingsBackup.js";
import { settingsDefaults } from "../../src/domain/preferences/settingsDefaults.js";

const input = () => ({
  settings: {
    ...settingsDefaults,
    fontSize: 20,
    aiApiKey: "secret",
    token: "login-secret",
  },
  theme: { themeMode: "dark", lightTheme: "stone", darkTheme: "nord-dark" },
  language: "zh-CN",
});

test("preferences round-trip including theme, language and multiline AI prompts without credentials", () => {
  const source = input();
  source.settings.aiPrompt = "总结文章。\n保留重点。";
  const backup = createSettingsBackup(source, new Date("2026-10-02T00:00:00Z"));
  const text = JSON.stringify(backup);
  assert.equal(backup.exportedAt, "2026-10-02T00:00:00.000Z");
  assert.equal(text.includes("secret"), false);
  const restored = parseSettingsBackup(text);
  const expected = { ...source.settings };
  delete expected.aiApiKey;
  delete expected.token;
  assert.deepEqual(restored, { ...source, settings: expected });
});

test("restore ignores credentials and unknown keys and supports partial older settings", () => {
  const backup = createSettingsBackup(input());
  backup.settings = JSON.parse(
    '{"fontSize":18,"aiApiKey":"bad","password":"bad","__proto__":{"polluted":true},"futureSetting":true}',
  );
  backup.auth = { token: "bad" };
  const restored = parseSettingsBackup(JSON.stringify(backup));
  assert.deepEqual(restored.settings, { fontSize: 18 });
  const merged = {
    ...settingsDefaults,
    aiApiKey: "current",
    ...restored.settings,
  };
  assert.equal(merged.aiApiKey, "current");
  assert.equal(merged.polluted, undefined);
});

test("invalid files, schemas, versions, themes and languages are rejected", () => {
  for (const text of ["", "<opml/>", "null", "[]", "{}", "{broken"]) {
    assert.throws(() => parseSettingsBackup(text), /invalidBackup/);
  }
  for (const patch of [
    { format: "other" },
    { theme: null },
    { theme: { themeMode: "invalid" } },
    { language: "unknown" },
    { settings: [] },
    { settings: {} },
  ]) {
    assert.throws(
      () =>
        parseSettingsBackup(
          JSON.stringify({ ...createSettingsBackup(input()), ...patch }),
        ),
      /invalidBackup/,
    );
  }
  assert.throws(
    () =>
      parseSettingsBackup(
        JSON.stringify({ ...createSettingsBackup(input()), version: 2 }),
      ),
    /unsupportedVersion/,
  );
});

test("invalid settings reject the entire file instead of applying a valid subset", () => {
  for (const settings of [
    { fontSize: "20" },
    { fontSize: 500 },
    { lineHeight: -1 },
    { maxWidth: 65.5 },
    { titleLines: 1.5 },
    { showFavicon: "true" },
    { sortField: "unknown" },
    { syncInterval: "-1" },
    { aiBaseUrl: "javascript:alert(1)" },
    { aiBaseUrl: "https://user:secret@example.com" },
    { aiModel: " " },
  ]) {
    const backup = createSettingsBackup(input());
    Object.assign(backup.settings, settings);
    assert.throws(
      () => parseSettingsBackup(JSON.stringify(backup)),
      /invalidBackup/,
    );
  }
});

test("oversized and multibyte files are bounded by bytes", () => {
  assert.throws(
    () => parseSettingsBackup(" ".repeat(MAX_BACKUP_BYTES + 1)),
    /invalidBackup/,
  );
  assert.throws(
    () => parseSettingsBackup("文".repeat(MAX_BACKUP_BYTES / 2)),
    /invalidBackup/,
  );
});
