import { useStore } from "@nanostores/react";
import { settingsState, updateSettings } from "@/stores/settingsStore.js";
import {
  Button,
  Description,
  Input,
  Label,
  ScrollShadow,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "sonner";
import { aiModalOpen } from "@/stores/modalStore.js";
import CustomModal from "@/components/ui/CustomModal.jsx";
import { Sparkles } from "lucide-react";

export default function AI() {
  const { t } = useTranslation();
  const isOpen = useStore(aiModalOpen);
  const { aiApiKey, aiBaseUrl, aiModel, aiPrompt } = useStore(settingsState);
  const [localApiKey, setLocalApiKey] = useState(aiApiKey);
  const [localBaseUrl, setLocalBaseUrl] = useState(aiBaseUrl);
  const [localModel, setLocalModel] = useState(aiModel);
  const [localPrompt, setLocalPrompt] = useState(aiPrompt);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const baseUrl = localBaseUrl.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localApiKey}`,
        },
        body: JSON.stringify({
          model: localModel,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error: ${res.status}`);
      }
      updateSettings({
        aiApiKey: localApiKey,
        aiBaseUrl: localBaseUrl,
        aiModel: localModel,
        aiPrompt: localPrompt,
      });
      toast.success(t("common.success"));
      aiModalOpen.set(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomModal
      open={isOpen}
      onOpenChange={(value) => aiModalOpen.set(value)}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" />
          <span className="text-base font-medium">
            {t("settings.ai.title")}
          </span>
        </div>
      }
      footer={
        <Button fullWidth onPress={handleSave} isPending={saving}>
          {saving && <Spinner color="current" size="sm" />}
          {t("common.save")}
        </Button>
      }
    >
      <ScrollShadow size={10} className="w-full overflow-y-auto px-4">
        <div className="flex flex-col gap-4 pb-4">
          <TextField variant="secondary">
            <Label>{t("settings.ai.apiKey")}</Label>
            <Input
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder={t("settings.ai.apiKeyPlaceholder")}
            />
          </TextField>

          <TextField variant="secondary">
            <Label>{t("settings.ai.baseUrl")}</Label>
            <Input
              type="text"
              value={localBaseUrl}
              onChange={(e) => setLocalBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
            <Description>{t("settings.ai.description")}</Description>
          </TextField>

          <TextField variant="secondary">
            <Label>{t("settings.ai.model")}</Label>
            <Input
              type="text"
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              placeholder="gpt-4o-mini"
            />
          </TextField>

          <TextField variant="secondary">
            <Label>{t("settings.ai.prompt")}</Label>
            <TextArea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              rows={3}
            />
          </TextField>
        </div>
      </ScrollShadow>
    </CustomModal>
  );
}
