import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useStore } from "@nanostores/react";
import { settingsState, updateSettings } from "@/stores/settingsStore.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "sonner";
import { ItemWrapper } from "@/components/ui/settingItem.jsx";
export default function AI() {
  const { t } = useTranslation();
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
          messages: [
            {
              role: "user",
              content: "hi",
            },
          ],
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
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <ItemWrapper title="OpenAI">
        <div className="bg-secondary/60 dark:bg-secondary/30 p-2.5">
          <Field>
            <FieldLabel htmlFor="field-1961">
              {t("settings.ai.apiKey")}
            </FieldLabel>
            <Input
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder={t("settings.ai.apiKeyPlaceholder")}
              id="field-1961"
            />
          </Field>
        </div>
        <Separator />
        <div className="bg-secondary/60 dark:bg-secondary/30 p-2.5">
          <Field>
            <FieldLabel htmlFor="field-2405">
              {t("settings.ai.baseUrl")}
            </FieldLabel>
            <Input
              type="text"
              value={localBaseUrl}
              onChange={(e) => setLocalBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              id="field-2405"
            />
            <FieldDescription>{t("settings.ai.description")}</FieldDescription>
          </Field>
        </div>
        <Separator />
        <div className="bg-secondary/60 dark:bg-secondary/30 p-2.5">
          <Field>
            <FieldLabel htmlFor="field-2909">
              {t("settings.ai.model")}
            </FieldLabel>
            <Input
              type="text"
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              placeholder="gpt-4o-mini"
              id="field-2909"
            />
          </Field>
        </div>
        <Separator />
        <div className="bg-secondary/60 dark:bg-secondary/30 p-2.5">
          <Field>
            <FieldLabel htmlFor="field-3323">
              {t("settings.ai.prompt")}
            </FieldLabel>
            <Textarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              rows={3}
              id="field-3323"
            />
          </Field>
        </div>
      </ItemWrapper>
      <Button
        onClick={handleSave}
        disabled={saving}
        aria-busy={saving}
        className="w-full"
      >
        {saving && <Spinner />}
        {t("common.save")}
      </Button>
    </div>
  );
}
