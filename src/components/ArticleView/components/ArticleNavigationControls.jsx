import { CloseButton } from "@/components/ui/close-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Kbd } from "@/components/ui/kbd";
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
      <LiquidGlass className="mr-2 p-0.5">
        <Tooltip>
          <TooltipTrigger
            closeOnClick={false}
            render={
              <CloseButton variant="ghost" size="icon-sm" onClick={onClose} />
            }
          />
          <TooltipContent>
            {t("common.close")} <Kbd>Esc</Kbd>
          </TooltipContent>
        </Tooltip>
      </LiquidGlass>
      <LiquidGlass
        role="group"
        aria-label={`${t("common.previous")} / ${t("common.next")}`}
        className="hidden gap-1 p-0.5 md:flex"
      >
        <Tooltip>
          <TooltipTrigger
            closeOnClick={false}
            render={
              <Button
                className="rounded-full"
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
          <TooltipContent>
            {t("common.previous")} <Kbd>K</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            closeOnClick={false}
            render={
              <Button
                className="rounded-full"
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
          <TooltipContent>
            {t("common.next")} <Kbd>J</Kbd>
          </TooltipContent>
        </Tooltip>
      </LiquidGlass>
    </>
  );
}
