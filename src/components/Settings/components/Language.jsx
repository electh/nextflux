import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ItemWrapper } from "@/components/ui/settingItem.jsx";
import { ChevronsUpDown, Globe } from "lucide-react";
import SettingIcon from "@/components/ui/SettingIcon";
const languages = [
  {
    id: "zh-CN",
    name: "简体中文",
  },
  {
    id: "en-US",
    name: "English",
  },
  {
    id: "tr-TR",
    name: "Türkçe",
  },
  {
    id: "fr-FR",
    name: "Français",
  },
];
export default function Language() {
  const { i18n, t } = useTranslation();
  return (
    <ItemWrapper title={t("settings.general.language")}>
      <div className="flex justify-between items-center gap-2 bg-default/60 dark:bg-default/30 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <SettingIcon variant="blue">
            <Globe />
          </SettingIcon>
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.general.interfaceLanguage")}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="secondary"
                size="sm"
                className="text-muted-foreground h-8"
              >
                {languages.find((lang) => lang.id === i18n.language)?.name ||
                  languages[1].name}
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground opacity-60" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              aria-label="language"
              value={
                Array.from(
                  new Set([
                    languages.find((lang) => lang.id === i18n.language)?.id ||
                      languages[1].id,
                  ]),
                )[0]
              }
              onValueChange={(keys) => {
                i18n.changeLanguage(keys);
              }}
            >
              {languages.map((lang) => (
                <DropdownMenuRadioItem key={lang.id} value={lang.id}>
                  <span>{lang.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ItemWrapper>
  );
}
