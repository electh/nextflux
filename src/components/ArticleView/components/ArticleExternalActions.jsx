import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { CloudUpload, Share } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { saveToThirdParty } from "@/api/resources/integrations.js";
import { hasIntegrations } from "@/stores/basicInfoStore.js";
import { reportError } from "@/lib/errors.js";
export default function ArticleExternalActions({ article }) {
  const { t } = useTranslation();
  const integrationsEnabled = useStore(hasIntegrations);
  const [savingArticleId, setSavingArticleId] = useState(null);
  const saving = savingArticleId === article?.id;
  const share = async () => {
    if (!article) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          url: article.url,
        });
      } else {
        await navigator.clipboard.writeText(article.url);
      }
    } catch (error) {
      reportError(error, "article.share");
    }
  };
  const save = async () => {
    if (!article) return;
    setSavingArticleId(article.id);
    try {
      await saveToThirdParty(article.id);
      toast.success(t("common.success"));
    } catch (error) {
      reportError(error, "article.saveToThirdParty");
    } finally {
      setSavingArticleId((current) => (current === article.id ? null : current));
    }
  };
  return (
    <>
      {integrationsEnabled && (
        <Tooltip>
          <TooltipTrigger
            closeOnClick={false}
            render={
              <Button
                variant="ghost"
                aria-label={t("articleView.saveToThirdParty")}
                onClick={save}
                disabled={!article || saving}
                focusableWhenDisabled={Boolean(article)}
                className="data-disabled:opacity-50"
                aria-busy={saving}
                size="icon-sm"
              >
                {saving ? (
                  <Spinner />
                ) : (
                  <CloudUpload className="size-4 text-muted-foreground" />
                )}
              </Button>
            }
            delay={0}
          />
          <TooltipContent>{t("articleView.saveToThirdParty")}</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger
          closeOnClick={false}
          render={
            <Button
              variant="ghost"
              aria-label={t("common.share")}
              onClick={share}
              disabled={!article}
              size="icon-sm"
            >
              <Share className="size-4 text-muted-foreground" />
            </Button>
          }
          delay={0}
        />
        <TooltipContent>{t("common.share")}</TooltipContent>
      </Tooltip>
    </>
  );
}
