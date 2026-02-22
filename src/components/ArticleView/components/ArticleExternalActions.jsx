import { useState } from "react";
import { useStore } from "@nanostores/react";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { Archive, CloudUpload, Share } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { saveToThirdParty } from "@/api/resources/integrations.js";
import { hasIntegrations } from "@/stores/basicInfoStore.js";
import { reportError } from "@/lib/errors.js";

export default function ArticleExternalActions({ article }) {
  const { t } = useTranslation();
  const integrationsEnabled = useStore(hasIntegrations);
  const [saving, setSaving] = useState(false);

  const share = async () => {
    if (!article) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url: article.url });
      } else {
        await navigator.clipboard.writeText(article.url);
      }
    } catch (error) {
      reportError(error, "article.share");
    }
  };

  const save = async () => {
    if (!article) return;
    setSaving(true);
    try {
      await saveToThirdParty(article.id);
      toast.success(t("common.success"));
    } catch (error) {
      reportError(error, "article.saveToThirdParty");
    } finally {
      setSaving(false);
    }
  };

  const archive = () => {
    if (!article?.url) return;
    window.open(
      `https://archive.ph/submit/?url=${encodeURIComponent(article.url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <>
      {integrationsEnabled && (
        <Tooltip delay={0}>
          <Button
            variant="ghost"
            isIconOnly
            size="sm"
            onPress={save}
            isPending={saving}
          >
            {saving ? (
              <Spinner color="current" size="sm" />
            ) : (
              <CloudUpload className="size-4 text-muted" />
            )}
          </Button>
          <Tooltip.Content showArrow>
            <Tooltip.Arrow />
            {t("articleView.saveToThirdParty")}
          </Tooltip.Content>
        </Tooltip>
      )}
      <Tooltip delay={0}>
        <Button
          variant="ghost"
          isIconOnly
          size="sm"
          isDisabled={!article?.url}
          onPress={archive}
        >
          <Archive className="size-4 text-muted" />
        </Button>
        <Tooltip.Content showArrow>
          <Tooltip.Arrow />
          {t("articleView.archive")}
        </Tooltip.Content>
      </Tooltip>
      <Tooltip delay={0}>
        <Button variant="ghost" isIconOnly size="sm" onPress={share}>
          <Share className="size-4 text-muted" />
        </Button>
        <Tooltip.Content showArrow>
          <Tooltip.Arrow />
          {t("common.share")}
        </Tooltip.Content>
      </Tooltip>
    </>
  );
}
