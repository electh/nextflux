import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ChevronsUpDown,
  Monitor,
  MoonStar,
  Paintbrush,
  Sun,
} from "lucide-react";
import { useStore } from "@nanostores/react";
import { ItemWrapper } from "@/components/ui/settingItem";
import { setTheme, themeState, themes } from "@/stores/themeStore";
import { useTranslation } from "react-i18next";
import SettingIcon from "@/components/ui/SettingIcon";
export default function Theme() {
  const { t } = useTranslation();
  const { themeMode, lightTheme, darkTheme } = useStore(themeState);
  const mode = [
    {
      id: "system",
      name: t("settings.appearance.system"),
      icon: <Monitor className="shrink-0 size-4 text-muted-foreground" />,
    },
    {
      id: "light",
      name: t("settings.appearance.light"),
      icon: <Sun className="shrink-0 size-4 text-muted-foreground" />,
    },
    {
      id: "dark",
      name: t("settings.appearance.dark"),
      icon: <MoonStar className="shrink-0 size-4 text-muted-foreground" />,
    },
  ];
  const bgColor = "bg-default/60 dark:bg-default/30";
  return (
    <ItemWrapper title={t("settings.appearance.theme")}>
      <div
        className={`flex justify-between items-center gap-2 ${bgColor} px-2.5 py-2`}
      >
        <div className="flex items-center gap-2">
          <SettingIcon variant="blue">
            <Paintbrush />
          </SettingIcon>
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.appearance.mode")}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                variant="secondary"
                className="text-muted-foreground h-8"
              >
                {mode.find((item) => item.id === themeMode)?.name}
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground opacity-60" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              aria-label="theme"
              value={Array.from(new Set([themeMode]))[0]}
              onValueChange={(values) => setTheme(values)}
            >
              {mode.map((item) => (
                <DropdownMenuRadioItem key={item.id} value={item.id}>
                  {item.icon}
                  <span>{item.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      <div
        className={`flex justify-between items-center gap-2 ${bgColor} px-2.5 py-2`}
      >
        <div className="flex items-center gap-2">
          <SettingIcon variant="amber">
            <Sun />
          </SettingIcon>
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.appearance.lightTheme")}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                variant="secondary"
                className="text-muted-foreground h-8"
              >
                {t(
                  `settings.appearance.themes.${themes.light.find((item) => item.id === lightTheme)?.id}`,
                )}
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground opacity-60" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              aria-label="theme"
              value={Array.from(new Set([lightTheme]))[0]}
              onValueChange={(values) => {
                themeState.set({
                  ...themeState.get(),
                  lightTheme: values,
                });
                themeMode !== "dark" && setTheme(themeMode, values);
              }}
            >
              {themes.light.map((item) => (
                <DropdownMenuRadioItem key={item.id} value={item.id}>
                  <div
                    className="size-4 border rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                  <span>{t(`settings.appearance.themes.${item.id}`)}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      <div
        className={`flex justify-between items-center gap-2 ${bgColor} px-2.5 py-2`}
      >
        <div className="flex items-center gap-2">
          <SettingIcon variant="purple">
            <MoonStar />
          </SettingIcon>
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.appearance.darkTheme")}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                variant="secondary"
                className="text-muted-foreground h-8"
              >
                {t(
                  `settings.appearance.themes.${themes.dark.find((item) => item.id === darkTheme)?.id}`,
                )}
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground opacity-60" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              aria-label="theme"
              value={Array.from(new Set([darkTheme]))[0]}
              onValueChange={(values) => {
                themeState.set({
                  ...themeState.get(),
                  darkTheme: values,
                });
                themeMode !== "light" && setTheme(themeMode, values);
              }}
            >
              {themes.dark.map((item) => (
                <DropdownMenuRadioItem key={item.id} value={item.id}>
                  <div
                    className="size-4 border rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                  <span>{t(`settings.appearance.themes.${item.id}`)}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ItemWrapper>
  );
}
