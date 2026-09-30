import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger
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

      <DropdownMenuContent>
        <DropdownMenuGroup aria-label="markAllAsRead">
          <DropdownMenuItem
            variant="danger"
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
            <CircleCheck className="size-4 text-danger" />
            <span className="text-danger">{t("articleList.markAllRead")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
