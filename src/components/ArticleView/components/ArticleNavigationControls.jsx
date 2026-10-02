import { CloseButton } from "@/components/ui/close-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function ArticleNavigationControls({
  canGoNext,
  canGoPrevious,
  onClose,
  onNext,
  onPrevious,
}) {
  const { t } = useTranslation();
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <CloseButton className="mx-2" onClick={onClose} />
          }
        />
        <TooltipContent>{t("common.close")}</TooltipContent>
      </Tooltip>
      <div className="gap-1 hidden md:flex">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                aria-label={t("common.previous")}
                onClick={onPrevious}
                disabled={!canGoPrevious}
                size="icon-sm"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
            delay={0}
          />
          <TooltipContent>{t("common.previous")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                aria-label={t("common.next")}
                onClick={onNext}
                disabled={!canGoNext}
                size="icon-sm"
              >
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
            delay={0}
          />
          <TooltipContent>{t("common.next")}</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}
