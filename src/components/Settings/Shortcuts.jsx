import { Separator } from "@/components/ui/separator";
import { ItemWrapper, KeyboardItem } from "@/components/ui/settingItem.jsx";
import { useTranslation } from "react-i18next";
export default function Shortcuts() {
  const { t } = useTranslation();
  const shortcuts = {
    article: [
      {
        key: "J",
        desc: t("sidebar.shortcuts.next"),
      },
      {
        key: "K",
        desc: t("sidebar.shortcuts.previous"),
      },
      {
        key: "M",
        desc: t("sidebar.shortcuts.toggleRead"),
      },
      {
        key: "S",
        desc: t("sidebar.shortcuts.toggleStar"),
      },
      {
        key: "G",
        desc: t("sidebar.shortcuts.toggleReaderView"),
      },
      {
        key: "ESC",
        desc: t("sidebar.shortcuts.close"),
      },
      {
        key: "V",
        desc: t("sidebar.shortcuts.viewInBrowser"),
      },
    ],
    global: [
      {
        key: "R",
        desc: t("sidebar.shortcuts.refresh"),
      },
      {
        key: "F",
        desc: t("sidebar.shortcuts.search"),
      },
    ],
    sidebar: [
      {
        key: "B",
        desc: t("sidebar.shortcuts.toggleSidebar"),
        kbdKey: ["ctrl"],
      },
      {
        key: "N",
        desc: t("sidebar.shortcuts.addFeed"),
        kbdKey: ["shift"],
      },
      {
        key: "P",
        desc: t("sidebar.shortcuts.prevItem"),
      },
      {
        key: "N",
        desc: t("sidebar.shortcuts.nextItem"),
      },
      {
        key: "X",
        desc: t("sidebar.shortcuts.toggleCategory"),
      },
    ],
  };
  return (
    <div className="flex flex-col gap-4">
      <ItemWrapper title={t("sidebar.shortcuts.global")}>
        {shortcuts.global.map((shortcut, index) => (
          <div key={shortcut.desc}>
            <KeyboardItem
              keyStr={shortcut.key}
              kbdKey={shortcut.kbdKey}
              desc={shortcut.desc}
            />
            {index !== shortcuts.global.length - 1 && <Separator />}
          </div>
        ))}
      </ItemWrapper>

      <ItemWrapper title={t("sidebar.shortcuts.sidebar")}>
        {shortcuts.sidebar.map((shortcut, index) => (
          <div key={shortcut.desc}>
            <KeyboardItem
              keyStr={shortcut.key}
              kbdKey={shortcut.kbdKey}
              desc={shortcut.desc}
            />
            {index !== shortcuts.sidebar.length - 1 && <Separator />}
          </div>
        ))}
      </ItemWrapper>

      <ItemWrapper title={t("sidebar.shortcuts.article")}>
        {shortcuts.article.map((shortcut, index) => (
          <div key={shortcut.desc}>
            <KeyboardItem keyStr={shortcut.key} desc={shortcut.desc} />
            {index !== shortcuts.article.length - 1 && <Separator />}
          </div>
        ))}
      </ItemWrapper>
    </div>
  );
}
