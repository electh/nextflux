import { settingsDefaults } from "./settingsDefaults.js";

export const MAX_BACKUP_BYTES = 1024 * 1024;
const languages = ["zh-CN", "en-US", "tr-TR", "fr-FR"];
const choices = {
  titleAlignType: ["left", "center"],
  feedIconShape: ["circle", "square"],
  sortDirection: ["asc", "desc"],
  sortField: ["published_at", "created_at"],
  cardImageSize: ["none", "small", "large"],
  syncInterval: ["0", "5", "15", "30", "60"],
  interfaceFontSize: ["14", "16", "18"],
};
const ranges = {
  lineHeight: [1.2, 2.5],
  fontSize: [14, 24],
  maxWidth: [50, 80],
  titleFontSize: [1, 3],
  titleLines: [0, 5],
  textPreviewLines: [0, 5],
};
const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const invalid = () => {
  throw new Error("invalidBackup");
};

function pickSettings(settings) {
  if (!isRecord(settings)) invalid();
  const result = {};
  for (const [key, fallback] of Object.entries(settingsDefaults)) {
    // Never export or restore credentials, even if a file includes them.
    if (key === "aiApiKey" || !Object.hasOwn(settings, key)) continue;
    const value = settings[key];
    if (typeof value !== typeof fallback) invalid();
    if (choices[key] && !choices[key].includes(value)) invalid();
    if (
      ranges[key] &&
      (!Number.isFinite(value) ||
        value < ranges[key][0] ||
        value > ranges[key][1])
    )
      invalid();
    if (
      ["titleLines", "textPreviewLines", "fontSize", "maxWidth"].includes(
        key,
      ) &&
      !Number.isInteger(value)
    )
      invalid();
    if (typeof value === "string" && value.length > 100_000) invalid();
    if (["fontFamily", "aiModel"].includes(key) && !value.trim()) invalid();
    if (key === "aiBaseUrl") {
      let url;
      try {
        url = new URL(value);
      } catch {
        invalid();
      }
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        /\s/.test(value)
      )
        invalid();
    }
    result[key] = value;
  }
  if (!Object.keys(result).length) invalid();
  return result;
}

function pickTheme(theme) {
  if (
    !isRecord(theme) ||
    !["system", "light", "dark"].includes(theme.themeMode) ||
    !["light", "stone"].includes(theme.lightTheme) ||
    !["dark", "nord-dark"].includes(theme.darkTheme)
  )
    invalid();
  return {
    themeMode: theme.themeMode,
    lightTheme: theme.lightTheme,
    darkTheme: theme.darkTheme,
  };
}

export function createSettingsBackup(
  { settings, theme, language },
  now = new Date(),
) {
  return {
    format: "nextflux-settings",
    version: 1,
    exportedAt: now.toISOString(),
    settings: pickSettings(settings),
    theme: pickTheme(theme),
    language: languages.includes(language) ? language : "en-US",
  };
}

export function parseSettingsBackup(text) {
  if (
    typeof text !== "string" ||
    new TextEncoder().encode(text).length > MAX_BACKUP_BYTES
  )
    invalid();
  let backup;
  try {
    backup = JSON.parse(text);
  } catch {
    invalid();
  }
  if (!isRecord(backup) || backup.format !== "nextflux-settings") invalid();
  if (backup.version !== 1) throw new Error("unsupportedVersion");
  if (!languages.includes(backup.language)) invalid();
  return {
    settings: pickSettings(backup.settings),
    theme: pickTheme(backup.theme),
    language: backup.language,
  };
}
