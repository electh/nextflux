import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RefreshCw, CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import FeedIcon from "@/components/ui/FeedIcon";
import { ContextMenu, ContextMenuItem } from "@/components/ui/ContextMenu";
import { useTranslation } from "react-i18next";
import { handleRefresh } from "@/handlers/feedHandlers";
import { handleMarkAllRead } from "@/handlers/articleHandlers";
import { useStore } from "@nanostores/react";
import { getFeedCount } from "@/stores/feedsStore.js";

const FeedItem = ({ feed }) => {
  const { t } = useTranslation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { feedId } = useParams();
  const $getFeedCount = useStore(getFeedCount);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 } });
  };

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        className={cn(
          "pl-8 pr-2 h-8",
          parseInt(feedId) === feed.id &&
            "active-feed bg-default/60 rounded-md",
        )}
      >
        <Link
          to={`/feed/${feed.id}`}
          onClick={() => isMobile && setOpenMobile(false)}
          onContextMenu={handleContextMenu}
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
          <span className="text-default-400 text-xs">
            {$getFeedCount(feed.id) !== 0 && $getFeedCount(feed.id)}
          </span>
        </Link>
      </SidebarMenuSubButton>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        onClose={closeContextMenu}
        position={contextMenu.position}
      >
        <ContextMenuItem
          onClick={() => {
            handleRefresh(feed.id);
            closeContextMenu();
          }}
          startContent={<RefreshCw className="size-4 text-default-500" />}
        >
          {t("common.refresh")}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            handleMarkAllRead("feed", feed.id);
            closeContextMenu();
          }}
          startContent={<CircleCheck className="size-4 text-default-500" />}
        >
          {t("common.markAllRead")}
        </ContextMenuItem>
      </ContextMenu>
    </SidebarMenuSubItem>
  );
};

export default FeedItem;
