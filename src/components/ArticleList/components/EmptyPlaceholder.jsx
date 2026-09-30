import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStore } from "@nanostores/react";
import { settingsState } from "@/stores/settingsStore.js";
export default function EmptyPlaceholder() {
  const { t } = useTranslation();
  const { floatingSidebar } = useStore(settingsState);
  return (
    <div
      className={cn(
        "h-full w-full",
        floatingSidebar ? "" : "shadow-custom rounded-2xl bg-overlay",
      )}
    >
      <div className="flex flex-col items-center gap-2 w-full justify-center h-full text-muted-foreground opacity-60">
        <Inbox className="size-16" />
        {t("articleList.emptyPlaceholder")}
      </div>
    </div>
  );
}
