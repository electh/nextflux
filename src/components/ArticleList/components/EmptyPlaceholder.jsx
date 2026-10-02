import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export default function EmptyPlaceholder({
  title,
  description,
  children,
  className,
}) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "h-full w-full bg-popover shadow-custom rounded-2xl",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 w-full justify-center h-full text-muted-foreground">
        <Inbox className="size-16 opacity-60" aria-hidden="true" />
        {title ? (
          <h2 className="text-base font-medium text-foreground">{title}</h2>
        ) : (
          <span className="opacity-60">
            {t("articleList.emptyPlaceholder")}
          </span>
        )}
        {description && (
          <p className="max-w-sm text-center text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        )}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
