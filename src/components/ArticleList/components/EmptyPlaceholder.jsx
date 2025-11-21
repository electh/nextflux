import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EmptyPlaceholder() {
  const { t } = useTranslation();
  return (
    <div className="h-full w-full">
      <div className="flex flex-col items-center gap-2 w-full justify-center h-full text-default-400">
        <Inbox className="size-16" />
        {t("articleList.emptyPlaceholder")}
      </div>
    </div>
  );
}
