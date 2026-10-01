import { useTranslation } from "react-i18next";
import { ItemWrapper, SelItem } from "@/components/ui/settingItem.jsx";
import { Globe } from "lucide-react";
import SettingIcon from "@/components/ui/SettingIcon";

const languages = [
  { value: "zh-CN", label: "简体中文" },
  { value: "en-US", label: "English" },
  { value: "tr-TR", label: "Türkçe" },
  { value: "fr-FR", label: "Français" },
];

export default function Language() {
  const { i18n, t } = useTranslation();
  return (
    <ItemWrapper title={t("settings.general.language")}>
      <SelItem
        label={t("settings.general.interfaceLanguage")}
        icon={
          <SettingIcon variant="blue">
            <Globe />
          </SettingIcon>
        }
        settingName="interfaceLanguage"
        settingValue={
          languages.find((lang) => lang.value === i18n.language)?.value ||
          "en-US"
        }
        options={languages}
        onValueChange={(value) => i18n.changeLanguage(value)}
      />
    </ItemWrapper>
  );
}
