import { Maximize2, Minimize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ArticleViewportControl({
  isExpanded,
  onToggleExpanded,
}) {
  const { t } = useTranslation();
  const label = t(
    isExpanded ? "articleView.restoreViewport" : "articleView.fillViewport",
  );

  return (
    <Tooltip>
      <TooltipTrigger
        closeOnClick={false}
        delay={0}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            aria-label={label}
            aria-pressed={isExpanded}
            onClick={onToggleExpanded}
          >
            {isExpanded ? <Minimize2 /> : <Maximize2 />}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
