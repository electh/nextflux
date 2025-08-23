import { useTranslation } from "react-i18next";
import { ItemWrapper } from "@/components/ui/settingItem.jsx";
import { ChevronsUpDown, Globe } from "lucide-react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import SettingIcon from "@/components/ui/SettingIcon";

const languages = [
  { id: "zh-CN", name: "简体中文" },
  { id: "en-US", name: "English" },
  { id: "tr-TR", name: "Türkçe" },
  { id: "fr-FR", name: "Français" },
];

export default function Language() {
  const { i18n, t } = useTranslation();

  return (
    <ItemWrapper title={t("settings.general.language")}>
      <div className="flex justify-between items-center gap-2 bg-content1/80 dark:bg-content2/30 p-2.5">
        <div className="flex items-center gap-2">
          <SettingIcon variant="blue">
            <Globe />
          </SettingIcon>
          <div className="text-sm text-foreground line-clamp-1">
            {t("settings.general.interfaceLanguage")}
          </div>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              className="capitalize gap-1 pr-1.5 rounded-md h-7 bg-content1 dark:bg-content3 text-foreground shadow-custom-cursor!"
              variant="solid"
              size="sm"
              endContent={
                <ChevronsUpDown className="size-4 shrink-0 text-default-400" />
              }
            >
              {languages.find((lang) => lang.id === i18n.language)?.name}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="language"
            variant="flat"
            selectedKeys={new Set([i18n.language])}
            selectionMode="single"
            onSelectionChange={(keys) => {
              i18n.changeLanguage(keys.currentKey);
            }}
          >
            {languages.map((lang) => (
              <DropdownItem key={lang.id}>{lang.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </ItemWrapper>
  );
}
