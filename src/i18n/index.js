import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import zhCN from "./locales/zh-CN";
import enUS from "./locales/en-US";
import trTR from "./locales/tr-TR";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "zh-CN": {
        translation: zhCN,
      },
      "en-US": {
        translation: enUS,
      },
      "tr-TR": {
        translation: trTR,
      },
    },
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
