import { Form } from "@base-ui/react/form";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { validateAiSetting } from "@/lib/aiSettings.js";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
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
  const [draft, setDraft] = useState({
    aiApiKey,
    aiBaseUrl,
    aiModel,
    aiPrompt,
  });
  const fields = [
    {
      name: "aiApiKey",
      label: "apiKey",
      type: "password",
      placeholder: t("settings.ai.apiKeyPlaceholder"),
    },
    {
      name: "aiBaseUrl",
      label: "baseUrl",
      placeholder: "https://api.openai.com/v1",
      inputMode: "url",
    },
    { name: "aiModel", label: "model", placeholder: "gpt-4o-mini" },
    { name: "aiPrompt", label: "prompt", multiline: true },
  ];
  const fieldError = (name, label, value) => {
    const error = validateAiSetting(name, value);
    return error
      ? t(`settings.ai.${error}`, { field: t(`settings.ai.${label}`) })
      : null;
  };
  const [saving, setSaving] = useState(false);
  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;
    const values = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, value.trim()]),
    );
    setSaving(true);
    try {
      const baseUrl = values.aiBaseUrl.replace(/\/+$/, "");
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${values.aiApiKey}`,
        },
        body: JSON.stringify({
          model: values.aiModel,
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
      updateSettings({ ...values, aiBaseUrl: baseUrl });
      toast.success(t("common.success"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Form className="flex flex-col gap-4" onSubmit={handleSave}>
      <ItemWrapper title="OpenAI">
        <FieldGroup className="gap-0">
          {fields.map(({ name, label, multiline, ...controlProps }, index) => (
            <div key={name}>
              {index > 0 && <Separator />}
              <Field
                name={name}
                disabled={saving}
                validate={(value) => fieldError(name, label, value)}
                className="bg-secondary/60 dark:bg-secondary/30 p-2.5"
              >
                <FieldLabel htmlFor={name}>
                  {t(`settings.ai.${label}`)}
                </FieldLabel>
                {multiline ? (
                  <FieldPrimitive.Control
                    render={<Textarea rows={3} />}
                    id={name}
                    required
                    value={draft[name]}
                    onValueChange={(value) =>
                      setDraft((current) => ({ ...current, [name]: value }))
                    }
                  />
                ) : (
                  <Input
                    {...controlProps}
                    id={name}
                    required
                    value={draft[name]}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [name]: event.target.value,
                      }))
                    }
                  />
                )}
                <FieldError>{fieldError(name, label, draft[name])}</FieldError>
                {name === "aiBaseUrl" && (
                  <FieldDescription>
                    {t("settings.ai.description")}
                  </FieldDescription>
                )}
              </Field>
            </div>
          ))}
        </FieldGroup>
      </ItemWrapper>
      <Button
        type="submit"
        disabled={saving}
        aria-busy={saving}
        className="w-full"
      >
        {saving && <Spinner />}
        {t("common.save")}
      </Button>
    </Form>
  );
}
