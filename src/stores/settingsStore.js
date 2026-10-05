import { persistentAtom } from "@nanostores/persistent";

import { settingsDefaults as defaultValue } from "../domain/preferences/settingsDefaults.js";

export const settingsState = persistentAtom("settings", defaultValue, {
  encode: (value) => {
    const filteredValue = Object.keys(value).reduce((acc, key) => {
      if (key in defaultValue) {
        acc[key] = value[key];
      }
      return acc;
    }, {});
    return JSON.stringify(filteredValue);
  },
  decode: (str) => {
    const storedValue = JSON.parse(str);
    return Object.fromEntries(
      Object.entries(defaultValue).map(([key, value]) => [
        key,
        key in storedValue ? storedValue[key] : value,
      ]),
    );
  },
});

export const updateSettings = (settingsChanges) =>
  settingsState.set({ ...settingsState.get(), ...settingsChanges });

export const resetSettings = () => {
  // 定义阅读相关的设置项
  const readingSettings = [
    "lineHeight",
    "fontSize",
    "maxWidth",
    "alignJustify",
    "fontFamily",
    "titleFontSize",
    "titleAlignType",
    "autoHideToolbar",
    "showReadingRail",
    "useThirdPartyMediaPlayer",
    "showLineNumbers",
    "forceDarkCodeTheme",
  ];
  const currentSettings = settingsState.get();
  const newSettings = { ...currentSettings };

  // 只重置阅读相关的设置
  readingSettings.forEach((key) => {
    newSettings[key] = defaultValue[key];
  });

  settingsState.set(newSettings);
};
