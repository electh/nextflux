import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

const defaultValue = {
  themeMode: "system",
  lightTheme: "light",
  darkTheme: "dark",
};

// 主题配置
export const themes = {
  light: [
    { id: "light", name: "白色", color: "#ffffff" },
    { id: "stone", name: "石灰", color: "#F3F1ED" },
    { id: "leaf", name: "leaf", color: "#c8e6c9" },
  ],
  dark: [
    { id: "dark", name: "黑色", color: "#1E1E1E" },
    { id: "nord-dark", name: "深蓝", color: "#4c566a" },
  ],
};

export const themeState = persistentAtom("theme", defaultValue, {
  encode: JSON.stringify,
  decode: (str) => {
    const storedValue = JSON.parse(str);
    return { ...defaultValue, ...storedValue };
  },
});

// 更新主题的函数
export function setTheme(mode, themeId = null) {
  const root = window.document.documentElement;
  const allThemes = [...themes.light, ...themes.dark].map((t) => t.id);

  // 移除所有主题相关的 class 和 data-theme
  root.classList.remove(...allThemes);
  root.removeAttribute("data-theme");

  if (mode === "system") {
    const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const themeToUse =
      systemMode === "dark"
        ? themeState.get().darkTheme
        : themeState.get().lightTheme;
    // 设置 color-scheme class
    root.classList.add(systemMode);
    // 设置 data-theme
    root.setAttribute("data-theme", themeToUse);
  } else {
    const newTheme =
      themeId ||
      (mode === "dark"
        ? themeState.get().darkTheme
        : themeState.get().lightTheme);
    // 设置 color-scheme class (light 或 dark)
    root.classList.add(mode);
    // 设置 data-theme
    root.setAttribute("data-theme", newTheme);
    if (mode === "dark") {
      themeState.set({ ...themeState.get(), darkTheme: newTheme });
    } else {
      themeState.set({ ...themeState.get(), lightTheme: newTheme });
    }
  }

  themeState.set({ ...themeState.get(), themeMode: mode });
}

// 初始化主题
export function initTheme() {
  const mode = themeState.get().themeMode;
  setTheme(mode);

  // 监听系统主题变化
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (e) => {
    if (themeState.get().themeMode === "system") {
      const systemMode = e.matches ? "dark" : "light";
      const themeToUse =
        systemMode === "dark"
          ? themeState.get().darkTheme
          : themeState.get().lightTheme;
      const root = window.document.documentElement;
      const allThemes = [...themes.light, ...themes.dark].map((t) => t.id);
      root.classList.remove(...allThemes);
      root.removeAttribute("data-theme");
      root.classList.add(systemMode);
      root.setAttribute("data-theme", themeToUse);
    }
  });
}

// 当前实际运用的主题模式 light ｜ dark
export const currentThemeMode = computed([themeState], ($themeState) => {
  const { themeMode } = $themeState;
  if (themeMode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return themeMode;
});
