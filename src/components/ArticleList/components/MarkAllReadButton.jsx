import {
  MorphDropdownMenu,
  MorphDropdownMenuTrigger,
  MorphDropdownMenuContent,
  MorphDropdownMenuGroup,
  MorphDropdownMenuItem,
} from "@/components/ui/morph-dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { handleMarkAllRead } from "@/handlers/articleHandlers";
import { CircleCheck } from "lucide-react";
import { isSyncing } from "@/stores/syncStore.js";
import { useStore } from "@nanostores/react";
import { filter, markingAllAsRead } from "@/stores/articlesStore.js";
import { useTranslation } from "react-i18next";
export default function MarkAllReadButton() {
  const { t } = useTranslation();
  const { feedId, categoryId } = useParams();
  const $isSyncing = useStore(isSyncing);
  const $markingAllAsRead = useStore(markingAllAsRead);
  const $filter = useStore(filter);
  const isPending = $isSyncing || $markingAllAsRead;
  return (
    <MorphDropdownMenu>
      <MorphDropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            disabled={$filter === "starred" || $markingAllAsRead || isPending}
            aria-busy={isPending}
            size="icon-sm"
          >
            {isPending ? (
              <Spinner />
            ) : (
              <CircleCheck className="size-4 text-muted-foreground" />
            )}
          </Button>
        }
      />

      <MorphDropdownMenuContent align="end">
        <MorphDropdownMenuGroup aria-label="markAllAsRead">
          <MorphDropdownMenuItem
            variant="destructive"
            onClick={() =>
              ((key) => {
                if (key !== "markAsRead") return;
                if (feedId) {
                  handleMarkAllRead("feed", feedId);
                } else if (categoryId) {
                  handleMarkAllRead("category", categoryId);
                } else {
                  handleMarkAllRead();
                }
              })("markAsRead")
            }
          >
            <CircleCheck />
            <span>{t("articleList.markAllRead")}</span>
          </MorphDropdownMenuItem>
        </MorphDropdownMenuGroup>
      </MorphDropdownMenuContent>
    </MorphDropdownMenu>
  );
}
