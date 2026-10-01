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
function ThemeSwatch({ theme }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <circle cx="8" cy="8" r="7.5" fill={theme.color} />
      <path d="M 2.697 13.303 A 7.5 7.5 0 0 0 13.303 2.697 Z" fill={theme.accent} />
      <circle cx="8" cy="8" r="7.5" fill="none" stroke="var(--border)" />
    </svg>
  );
}

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
  const bgColor = "bg-secondary/60 dark:bg-secondary/30";
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
          <DropdownMenuContent side="bottom" align="end">
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
                {t(`settings.appearance.themes.${lightTheme}`, {
                  defaultValue: themes.light.find(
                    (item) => item.id === lightTheme,
                  )?.name,
                })}
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground opacity-60" />
              </Button>
            }
          />
          <DropdownMenuContent side="bottom" align="end">
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
                  <ThemeSwatch theme={item} />
                  <span>
                    {t(`settings.appearance.themes.${item.id}`, {
                      defaultValue: item.name,
                    })}
                  </span>
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
                {t(`settings.appearance.themes.${darkTheme}`, {
                  defaultValue: themes.dark.find(
                    (item) => item.id === darkTheme,
                  )?.name,
                })}
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground opacity-60" />
              </Button>
            }
          />
          <DropdownMenuContent side="bottom" align="end">
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
                  <ThemeSwatch theme={item} />
                  <span>
                    {t(`settings.appearance.themes.${item.id}`, {
                      defaultValue: item.name,
                    })}
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ItemWrapper>
  );
}
