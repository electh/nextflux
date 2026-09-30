import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  EllipsisVertical,
  FilePen,
  FolderPen,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  editFeedModalOpen,
  renameModalOpen,
  unsubscribeModalOpen,
  currentFeedId,
} from "@/stores/modalStore.js";
import { useTranslation } from "react-i18next";
import { handleRefresh } from "@/handlers/feedHandlers";
export default function MenuButton() {
  const { feedId, categoryId } = useParams();
  const { t } = useTranslation();
  const hasFeedMenu = !!feedId;
  const hasCategoryMenu = !!categoryId && !feedId;
  const isDisabled = !feedId && !categoryId;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" disabled={isDisabled} size="icon-sm">
            <EllipsisVertical className="size-4 text-muted-foreground" />
          </Button>
        }
      />

      {(hasFeedMenu || hasCategoryMenu) && (
        <DropdownMenuContent>
          <DropdownMenuGroup
            aria-label={hasFeedMenu ? "Feed Actions" : "Category Actions"}
          >
            {hasFeedMenu && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    ((key) => {
                      if (hasFeedMenu) {
                        if (key === "refresh") handleRefresh(feedId);
                        if (key === "edit") {
                          currentFeedId.set(feedId);
                          editFeedModalOpen.set(true);
                        }
                        if (key === "unsubscribe") {
                          currentFeedId.set(feedId);
                          unsubscribeModalOpen.set(true);
                        }
                      }
                      if (hasCategoryMenu) {
                        if (key === "rename") renameModalOpen.set(true);
                      }
                    })("refresh")
                  }
                >
                  <RefreshCw className="size-4 text-muted-foreground" />
                  <span>{t("articleList.refreshFeed")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    ((key) => {
                      if (hasFeedMenu) {
                        if (key === "refresh") handleRefresh(feedId);
                        if (key === "edit") {
                          currentFeedId.set(feedId);
                          editFeedModalOpen.set(true);
                        }
                        if (key === "unsubscribe") {
                          currentFeedId.set(feedId);
                          unsubscribeModalOpen.set(true);
                        }
                      }
                      if (hasCategoryMenu) {
                        if (key === "rename") renameModalOpen.set(true);
                      }
                    })("edit")
                  }
                >
                  <FilePen className="size-4 text-muted-foreground" />
                  <span>{t("articleList.editFeed")}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    ((key) => {
                      if (hasFeedMenu) {
                        if (key === "refresh") handleRefresh(feedId);
                        if (key === "edit") {
                          currentFeedId.set(feedId);
                          editFeedModalOpen.set(true);
                        }
                        if (key === "unsubscribe") {
                          currentFeedId.set(feedId);
                          unsubscribeModalOpen.set(true);
                        }
                      }
                      if (hasCategoryMenu) {
                        if (key === "rename") renameModalOpen.set(true);
                      }
                    })("unsubscribe")
                  }
                >
                  <Trash2 className="size-4 text-danger" />
                  <span className="text-danger">
                    {t("articleList.unsubscribe")}
                  </span>
                </DropdownMenuItem>
              </>
            )}

            {hasCategoryMenu && (
              <DropdownMenuItem
                onClick={() =>
                  ((key) => {
                    if (hasFeedMenu) {
                      if (key === "refresh") handleRefresh(feedId);
                      if (key === "edit") {
                        currentFeedId.set(feedId);
                        editFeedModalOpen.set(true);
                      }
                      if (key === "unsubscribe") {
                        currentFeedId.set(feedId);
                        unsubscribeModalOpen.set(true);
                      }
                    }
                    if (hasCategoryMenu) {
                      if (key === "rename") renameModalOpen.set(true);
                    }
                  })("rename")
                }
              >
                <FolderPen className="size-4 text-muted-foreground" />
                <span>{t("articleList.renameCategory.title")}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
