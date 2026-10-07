import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { settingsState } from "@/stores/settingsStore.js";
import { useStore } from "@nanostores/react";
import { cn } from "@/lib/utils.js";
import { themeState } from "@/stores/themeStore.js";
import { useTranslation } from "react-i18next";
import { reportError } from "@/lib/errors.js";
export default function CodeBlock({ code }) {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const { showLineNumbers, forceDarkCodeTheme } = useStore(settingsState);
  const { darkTheme } = useStore(themeState);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      reportError(err, "code.copy");
    }
  };
  return (
    <div
      className={cn(
        forceDarkCodeTheme && "dark",
        "code-block relative",
        showLineNumbers ? "line-numbers" : "",
      )}
      data-theme={forceDarkCodeTheme ? darkTheme : undefined}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              className="absolute right-2 top-2"
              variant="ghost"
              aria-label={t("common.copy")}
              onClick={handleCopy}
              disabled={isCopied}
              size="icon-sm"
            >
              {isCopied ? (
                <Check className="size-4 text-muted-foreground" />
              ) : (
                <Copy className="size-4 text-muted-foreground" />
              )}
            </Button>
          }
          delay={0}
        />
        <TooltipContent>{t("common.copy")}</TooltipContent>
      </Tooltip>
      <pre className="overflow-x-auto" tabIndex={0}>
        {showLineNumbers && (
          <span className="code-line-numbers" aria-hidden="true">
            {code
              .split("\n")
              .map((_, index) => index + 1)
              .join("\n")}
          </span>
        )}
        <code>{code}</code>
      </pre>
    </div>
  );
}
