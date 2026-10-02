import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function EmptyPlaceholder() {
  const { t } = useTranslation();
  return (
    <div className="h-full w-full bg-popover shadow-custom rounded-2xl">
      <div className="flex flex-col items-center gap-2 w-full justify-center h-full text-muted-foreground opacity-60">
        <Inbox className="size-16" />
        {t("articleList.emptyPlaceholder")}
      </div>
    </div>
  );
}
