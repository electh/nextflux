import { useStore } from "@nanostores/react";
import {
  getCategoryCount,
  categoryExpandedState,
  updateCategoryExpandState,
} from "@/stores/feedsStore.js";
import { cn } from "@/lib/utils";
import { ChevronRight, FolderPen } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.jsx";
import { Link, useParams } from "react-router-dom";
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import { settingsState } from "@/stores/settingsStore";
import { useEffect, useState } from "react";
import FeedItem from "./FeedItem";
import { ContextMenu, ContextMenuItem } from "@/components/ui/ContextMenu";
import { renameModalOpen, currentCategoryId } from "@/stores/modalStore.js";
import { useTranslation } from "react-i18next";

const FeedsGroupContent = ({ category }) => {
  const { t } = useTranslation();
  const $getCategoryCount = useStore(getCategoryCount);
  const { isMobile, setOpenMobile } = useSidebar();
  const { categoryId, feedId } = useParams();
  const { defaultExpandCategory } = useStore(settingsState);
  const $categoryExpandedState = useStore(categoryExpandedState);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (feedId) {
      const shouldExpand = category.feeds.some(
        (feed) => parseInt(feedId) === feed.id,
      );
      // 只在需要展开时更新状态
      if (shouldExpand) {
        updateCategoryExpandState(category.id, true);
      }
      // 滚动到活动的 feed
      if (shouldExpand) {
        const feedItem = document.querySelector(".active-feed");
        feedItem?.scrollIntoView({ behavior: "instant", block: "nearest" });
      }
    }
  }, [feedId, category.id]);

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
    <Collapsible
      key={category.id}
      open={$categoryExpandedState[category.id] ?? defaultExpandCategory}
      onOpenChange={(open) => updateCategoryExpandState(category.id, open)}
    >
      <SidebarMenuItem key={`menu-${category.id}`}>
        <SidebarMenuButton
          className={cn(
            categoryId === category.id && "bg-default/60 rounded-xl",
          )}
          asChild
        >
          <Link
            to={`/category/${category.id}`}
            onClick={() => isMobile && setOpenMobile(false)}
            onContextMenu={handleContextMenu}
          >
            <span className={"pl-6 font-medium"}>{category.title}</span>
          </Link>
        </SidebarMenuButton>

        <CollapsibleTrigger asChild>
          <SidebarMenuAction className="left-2 hover:bg-default/60 text-muted data-[state=open]:rotate-90">
            <ChevronRight />
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <SidebarMenuBadge className="justify-end">
          {$getCategoryCount(category.id) !== 0 &&
            $getCategoryCount(category.id)}
        </SidebarMenuBadge>
        <CollapsibleContent>
          <SidebarMenuSub className="m-0 px-0 border-none">
            {category.feeds.map((feed) => (
              <FeedItem key={feed.id} feed={feed} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>

        <ContextMenu
          isOpen={contextMenu.isOpen}
          onClose={closeContextMenu}
          position={contextMenu.position}
        >
          <div className="px-2 py-1.5 text-xs font-medium text-muted opacity-60 line-clamp-1">
            {category.title}
          </div>
          <ContextMenuItem
            onClick={() => {
              currentCategoryId.set(category.id.toString());
              renameModalOpen.set(true);
              closeContextMenu();
            }}
            startContent={<FolderPen className="size-4 text-muted" />}
          >
            {t("articleList.renameCategory.title")}
          </ContextMenuItem>
        </ContextMenu>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default FeedsGroupContent;
