import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Link, useParams } from "react-router-dom";
import {
  RefreshCw,
  CircleCheck,
  TriangleAlert,
  FilePen,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import FeedIcon from "@/components/ui/FeedIcon";
import { useTranslation } from "react-i18next";
import { handleRefresh } from "@/handlers/feedHandlers";
import { handleMarkAllRead } from "@/handlers/articleHandlers";
import { useStore } from "@nanostores/react";
import { createFeedCountStore } from "@/stores/feedsStore.js";
import {
  editFeedModalOpen,
  unsubscribeModalOpen,
  currentFeedId,
} from "@/stores/modalStore.js";
import { memo, useMemo } from "react";
const FeedItem = ({ feed }) => {
  const { t } = useTranslation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { feedId } = useParams();
  const countStore = useMemo(() => createFeedCountStore(feed.id), [feed.id]);
  const count = useStore(countStore);
  return (
    <ContextMenu>
      <SidebarMenuSubItem>
        <ContextMenuTrigger
          render={
            <SidebarMenuSubButton
              isActive={Number(feedId) === feed.id}
              className={cn(
                "pl-8 pr-2 h-8",
                parseInt(feedId) === feed.id && "active-feed",
              )}
              render={
                <Link
                  to={`/feed/${feed.id}`}
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <FeedIcon feedId={feed.id} />
                  <span className="flex-1 flex items-center gap-1">
                    {feed.parsing_error_count > 0 && (
                      <span className="text-warning">
                        <TriangleAlert className="size-4" />
                      </span>
                    )}
                    <span className="line-clamp-1">{feed.title}</span>
                  </span>
                  <span className="text-muted-foreground opacity-60 text-xs">
                    {count !== 0 && count}
                  </span>
                </Link>
              }
              nativeButton={false}
            />
          }
        />

        <ContextMenuContent>
          <ContextMenuGroup>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground opacity-60 line-clamp-1">
              {feed.title}
            </div>
            <ContextMenuItem
              onClick={() => {
                handleRefresh(feed.id);
              }}
            >
              {<RefreshCw className="size-4 text-muted-foreground" />}
              {t("common.refresh")}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                handleMarkAllRead("feed", feed.id);
              }}
            >
              {<CircleCheck className="size-4 text-muted-foreground" />}
              {t("common.markAllRead")}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                currentFeedId.set(feed.id.toString());
                editFeedModalOpen.set(true);
              }}
            >
              {<FilePen className="size-4 text-muted-foreground" />}
              {t("articleList.editFeed")}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              variant="destructive"
              onClick={() => {
                currentFeedId.set(feed.id.toString());
                unsubscribeModalOpen.set(true);
              }}
            >
              <Trash2 />
              {t("articleList.unsubscribe")}
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </SidebarMenuSubItem>
    </ContextMenu>
  );
};
export default memo(FeedItem);
