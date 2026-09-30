import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { settingsState } from "@/stores/settingsStore.js";
import { useStore } from "@nanostores/react";
import { cn } from "@/lib/utils.js";
import { themeState } from "@/stores/themeStore.js";
import { useTranslation } from "react-i18next";
import { useInView } from "framer-motion";
import { highlightCode } from "@/lib/codeHighlighter.js";
import { reportError } from "@/lib/errors.js";
export default function CodeBlock({ code, language }) {
  const { t } = useTranslation();
  const [html, setHtml] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { showLineNumbers, forceDarkCodeTheme } = useStore(settingsState);
  const { darkTheme } = useStore(themeState);
  const codeRef = useRef(null);
  const isInView = useInView(codeRef, {
    once: true,
  });
  useEffect(() => {
    let cancelled = false;
    async function highlight() {
      try {
        const highlighted = await highlightCode(code, language);
        if (!cancelled) setHtml(highlighted);
      } catch (error) {
        reportError(error, "code.highlight");
        if (!cancelled) setHtml("");
      }
    }
    if (isInView) {
      highlight();
    }
    return () => {
      cancelled = true;
    };
  }, [code, language, isInView]);
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
        forceDarkCodeTheme ? `${darkTheme} force-dark-code-theme` : "",
        "code-block relative group",
        showLineNumbers ? "line-numbers" : "",
      )}
      ref={codeRef}
    >
      <span
        className={cn(
          "text-xs absolute right-2 top-1 text-muted-foreground opacity-100 group-hover:opacity-0 transition-opacity",
          language === "text" ? "hidden" : "",
        )}
      >
        {language}
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
      {isInView && html && (
        <div
          className="animate-in fade-in duration-300"
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      )}
      {isInView && !html && (
        <pre className="overflow-x-auto">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
