import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";

export const settingsModalOpen = atom(false);
const defaultValue = {
  lineHeight: 1.8,
  fontSize: 16,
  maxWidth: 65, // 单位为ch
  alignJustify: false,
  fontFamily: "system-ui",
  titleFontSize: 1.6, // 标题相对于正文大小的倍数
  titleAlignType: "left",
  feedIconShape: "square", // circle, square
  useGrayIcon: false,
  sortDirection: "desc", // asc, desc
  showHiddenFeeds: false,
  markAsReadOnScroll: false,
  cardImageSize: "large", // none, small, large
  showFavicon: true,
  showTextPreview: true,
  showReadingTime: true,
  truncateTitles: true,
  autoHideToolbar: false,
  syncInterval: "15", // 添加同步间隔设置，默认15分钟
  showLineNumbers: false,
  forceDarkCodeTheme: false,
  defaultExpandCategory: false, // 默认展开分类
  showUnreadByDefault: false,
  reduceMotion: false,
  useNativeVideoPlayer: false,
  interfaceFontSize: "16",
};

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
    return { ...defaultValue, ...storedValue };
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
    "showLineNumbers",
    "forceDarkCodeTheme",
    "useNativeVideoPlayer",
  ];
  const currentSettings = settingsState.get();
  const newSettings = { ...currentSettings };

  // 只重置阅读相关的设置
  readingSettings.forEach((key) => {
    newSettings[key] = defaultValue[key];
  });

  settingsState.set(newSettings);
};
