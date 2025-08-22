import { useStore } from "@nanostores/react";
import { settingsState, updateSettings } from "@/stores/settingsStore";
import { ItemWrapper } from "@/components/ui/settingItem.jsx";
import { Button, Divider, Input, Textarea } from "@heroui/react";
import { useTranslation } from "react-i18next";
import SettingIcon from "@/components/ui/SettingIcon";
import { Globe, KeySquare, MessageSquare, ServerCog } from "lucide-react";

export default function AISettings() {
  const settings = useStore(settingsState);
  const { t } = useTranslation();

  return (
    <>
      <ItemWrapper title={t("settings.ai.title")}>
        <div className="flex flex-col gap-2 bg-content1/80 dark:bg-content2/30 p-2.5">
          <Input
            label={t("settings.ai.baseUrl")}
            labelPlacement="outside"
            placeholder="http://localhost:11434"
            startContent={<SettingIcon variant="blue"><Globe/></SettingIcon>}
            value={settings.aiApiBaseUrl}
            onValueChange={(v) => updateSettings({ aiApiBaseUrl: v })}
          />
          <Divider />
          <Input
            label={t("settings.ai.apiKey")}
            labelPlacement="outside"
            placeholder={t("settings.ai.apiKeyPlaceholder")}
            startContent={<SettingIcon variant="purple"><KeySquare/></SettingIcon>}
            type="password"
            value={settings.aiApiKey}
            onValueChange={(v) => updateSettings({ aiApiKey: v })}
          />
          <Divider />
          <Input
            label={t("settings.ai.model")}
            labelPlacement="outside"
            placeholder="gpt-4o-mini"
            startContent={<SettingIcon variant="amber"><ServerCog/></SettingIcon>}
            value={settings.aiModel}
            onValueChange={(v) => updateSettings({ aiModel: v })}
          />
          <Divider />
          <Textarea
            label={t("settings.ai.defaultPrompt")}
            labelPlacement="outside"
            placeholder={t("settings.ai.defaultPromptPlaceholder")}
            startContent={<SettingIcon variant="green"><MessageSquare/></SettingIcon>}
            minRows={3}
            value={settings.aiDefaultPrompt}
            onValueChange={(v) => updateSettings({ aiDefaultPrompt: v })}
          />
          <div className="flex justify-end">
            <Button size="sm" variant="flat" onPress={() => updateSettings({ aiApiBaseUrl: "", aiApiKey: "", aiModel: "gpt-4o-mini", aiDefaultPrompt: "Please summarize the following text in 2 paragraphs" })}>{t("common.reset")}</Button>
          </div>
        </div>
      </ItemWrapper>
    </>
  );
}
