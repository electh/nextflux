import {
  ChevronsUpDown,
  Monitor,
  MoonStar,
  Paintbrush,
  Sun,
} from "lucide-react";
import { useStore } from "@nanostores/react";
import { ItemWrapper } from "@/components/ui/settingItem";
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { setTheme, themes, themeState } from "@/stores/themeStore";
import { useTranslation } from "react-i18next";

export default function Theme() {
  const { t } = useTranslation();
  const { themeMode, lightTheme, darkTheme } = useStore(themeState);

  const mode = [
    {
      id: "system",
      name: t("settings.appearance.system"),
      icon: <Monitor className="shrink-0 size-4 text-default-500" />,
    },
    {
      id: "light",
      name: t("settings.appearance.light"),
      icon: <Sun className="shrink-0 size-4 text-default-500" />,
    },
    {
      id: "dark",
      name: t("settings.appearance.dark"),
      icon: <MoonStar className="shrink-0 size-4 text-default-500" />,
    },
  ];

  const bgColor = "bg-content1 dark:bg-content2/30";

  return (
    <ItemWrapper title={t("settings.appearance.theme")}>
      <div className={`flex justify-between items-center gap-2 ${bgColor} p-2`}>
        <div className="flex items-center gap-2">
          <Paintbrush className="shrink-0 size-4 text-default-500" />
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.appearance.mode")}
          </div>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              className="capitalize"
              variant="flat"
              size="sm"
              endContent={<ChevronsUpDown className="size-4 shrink-0" />}
            >
              {mode.find((item) => item.id === themeMode)?.name}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="theme"
            selectedKeys={new Set([themeMode])}
            selectionMode="single"
            variant="flat"
            onSelectionChange={(values) => setTheme(values.currentKey)}
          >
            {mode.map((item) => (
              <DropdownItem key={item.id} startContent={item.icon}>
                {item.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
      <Divider />
      <div className={`flex justify-between items-center gap-2 ${bgColor} p-2`}>
        <div className="flex items-center gap-2">
          <Sun className="shrink-0 size-4 text-default-500" />
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.appearance.lightTheme")}
          </div>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              className="capitalize"
              variant="flat"
              size="sm"
              endContent={<ChevronsUpDown className="size-4 shrink-0" />}
            >
              {t(
                `settings.appearance.themes.${themes.light.find((item) => item.id === lightTheme)?.id}`,
              )}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="theme"
            selectedKeys={new Set([lightTheme])}
            selectionMode="single"
            variant="flat"
            onSelectionChange={(values) => {
              themeState.set({
                ...themeState.get(),
                lightTheme: values.currentKey,
              });
              themeMode !== "dark" && setTheme(themeMode, values.currentKey);
            }}
          >
            {themes.light.map((item) => (
              <DropdownItem
                key={item.id}
                startContent={
                  <div
                    className="size-4 border rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                }
              >
                {t(`settings.appearance.themes.${item.id}`)}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
      <Divider />
      <div className={`flex justify-between items-center gap-2 ${bgColor} p-2`}>
        <div className="flex items-center gap-2">
          <MoonStar className="shrink-0 size-4 text-default-500" />
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.appearance.darkTheme")}
          </div>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              className="capitalize"
              variant="flat"
              size="sm"
              endContent={<ChevronsUpDown className="size-4 shrink-0" />}
            >
              {t(
                `settings.appearance.themes.${themes.dark.find((item) => item.id === darkTheme)?.id}`,
              )}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="theme"
            selectedKeys={new Set([darkTheme])}
            selectionMode="single"
            variant="flat"
            onSelectionChange={(values) => {
              themeState.set({
                ...themeState.get(),
                darkTheme: values.currentKey,
              });
              themeMode !== "light" && setTheme(themeMode, values.currentKey);
            }}
          >
            {themes.dark.map((item) => (
              <DropdownItem
                key={item.id}
                startContent={
                  <div
                    className="size-4 border rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                }
              >
                {t(`settings.appearance.themes.${item.id}`)}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </ItemWrapper>
  );
}
