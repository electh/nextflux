import {
  ChevronsUpDown,
  Monitor,
  MoonStar,
  Paintbrush,
  Sun,
} from "lucide-react";
import { useStore } from "@nanostores/react";
import { ItemWrapper } from "@/components/ui/settingItem";
import { Button, Dropdown, Label } from "@heroui/react";
import { setTheme, themeState, themes } from "@/stores/themeStore";
import { useTranslation } from "react-i18next";
import SettingIcon from "@/components/ui/SettingIcon";
import { Separator } from "@heroui/react";

export default function Theme() {
  const { t } = useTranslation();
  const { themeMode, lightTheme, darkTheme } = useStore(themeState);

  const mode = [
    {
      id: "system",
      name: t("settings.appearance.system"),
      icon: <Monitor className="shrink-0 size-4 text-muted" />,
    },
    {
      id: "light",
      name: t("settings.appearance.light"),
      icon: <Sun className="shrink-0 size-4 text-muted" />,
    },
    {
      id: "dark",
      name: t("settings.appearance.dark"),
      icon: <MoonStar className="shrink-0 size-4 text-muted" />,
    },
  ];

  const bgColor = "bg-default/60 dark:bg-default/30";

  return (
    <ItemWrapper title={t("settings.appearance.theme")}>
      <div
        className={`flex justify-between items-center gap-2 ${bgColor} p-2.5`}
      >
        <div className="flex items-center gap-2">
          <SettingIcon variant="blue">
            <Paintbrush />
          </SettingIcon>
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.appearance.mode")}
          </div>
        </div>
        <Dropdown>
          <Button size="sm" variant="tertiary">
            {mode.find((item) => item.id === themeMode)?.name}
            <ChevronsUpDown className="size-4 shrink-0 text-muted opacity-60" />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu
              aria-label="theme"
              selectedKeys={new Set([themeMode])}
              selectionMode="single"
              onSelectionChange={(values) => setTheme(values.currentKey)}
            >
              {mode.map((item) => (
                <Dropdown.Item id={item.id} key={item.id} textValue={item.name}>
                  {item.icon}
                  <Label>{item.name}</Label>
                  <Dropdown.ItemIndicator />
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
      <Separator />
      <div
        className={`flex justify-between items-center gap-2 ${bgColor} p-2.5`}
      >
        <div className="flex items-center gap-2">
          <SettingIcon variant="amber">
            <Sun />
          </SettingIcon>
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.appearance.lightTheme")}
          </div>
        </div>
        <Dropdown>
          <Button size="sm" variant="tertiary">
            {t(
              `settings.appearance.themes.${themes.light.find((item) => item.id === lightTheme)?.id}`,
            )}
            <ChevronsUpDown className="size-4 shrink-0 text-muted opacity-60" />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu
              aria-label="theme"
              selectedKeys={new Set([lightTheme])}
              selectionMode="single"
              onSelectionChange={(values) => {
                themeState.set({
                  ...themeState.get(),
                  lightTheme: values.currentKey,
                });
                themeMode !== "dark" && setTheme(themeMode, values.currentKey);
              }}
            >
              {themes.light.map((item) => (
                <Dropdown.Item
                  id={item.id}
                  key={item.id}
                  textValue={t(`settings.appearance.themes.${item.id}`)}
                >
                  <div
                    className="size-4 border rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Label>{t(`settings.appearance.themes.${item.id}`)}</Label>
                  <Dropdown.ItemIndicator />
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
      <Separator />
      <div
        className={`flex justify-between items-center gap-2 ${bgColor} p-2.5`}
      >
        <div className="flex items-center gap-2">
          <SettingIcon variant="purple">
            <MoonStar />
          </SettingIcon>
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.appearance.darkTheme")}
          </div>
        </div>
        <Dropdown>
          <Button size="sm" variant="tertiary">
            {t(
              `settings.appearance.themes.${themes.dark.find((item) => item.id === darkTheme)?.id}`,
            )}
            <ChevronsUpDown className="size-4 shrink-0 text-muted opacity-60" />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu
              disallowEmptySelection
              aria-label="theme"
              selectedKeys={new Set([darkTheme])}
              selectionMode="single"
              onSelectionChange={(values) => {
                themeState.set({
                  ...themeState.get(),
                  darkTheme: values.currentKey,
                });
                themeMode !== "light" && setTheme(themeMode, values.currentKey);
              }}
            >
              {themes.dark.map((item) => (
                <Dropdown.Item
                  id={item.id}
                  key={item.id}
                  textValue={t(`settings.appearance.themes.${item.id}`)}
                >
                  <div
                    className="size-4 border rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Label>{t(`settings.appearance.themes.${item.id}`)}</Label>
                  <Dropdown.ItemIndicator />
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </ItemWrapper>
  );
}
