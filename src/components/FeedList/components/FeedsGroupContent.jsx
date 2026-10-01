import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuTrigger,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useStore } from "@nanostores/react";
import {
  createCategoryCountStore,
  categoryExpandedState,
  updateCategoryExpandState,
} from "@/stores/feedsStore.js";
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
import { memo, useEffect, useMemo } from "react";
import FeedItem from "./FeedItem";
import { renameModalOpen, currentCategoryId } from "@/stores/modalStore.js";
import { useTranslation } from "react-i18next";
const FeedsGroupContent = ({ category }) => {
  const { t } = useTranslation();
  const countStore = useMemo(
    () => createCategoryCountStore(category.id),
    [category.id],
  );
  const count = useStore(countStore);
  const { isMobile, setOpenMobile } = useSidebar();
  const { categoryId, feedId } = useParams();
  const { defaultExpandCategory } = useStore(settingsState);
  const $categoryExpandedState = useStore(categoryExpandedState);
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
        feedItem?.scrollIntoView({
          behavior: "instant",
          block: "nearest",
        });
      }
    }
  }, [feedId, category.id, category.feeds]);
  return (
    <Collapsible
      key={category.id}
      open={$categoryExpandedState[category.id] ?? defaultExpandCategory}
      onOpenChange={(open) => updateCategoryExpandState(category.id, open)}
    >
      <ContextMenu>
        <SidebarMenuItem key={`menu-${category.id}`}>
          <ContextMenuTrigger
            render={
              <SidebarMenuButton
                isActive={Number(categoryId) === Number(category.id)}
                render={
                  <Link
                    to={`/category/${category.id}`}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <span className={"pl-6 font-medium"}>{category.title}</span>
                  </Link>
                }
                nativeButton={false}
              />
            }
          />

          <CollapsibleTrigger
            render={
              <SidebarMenuAction className="left-2 hover:bg-secondary/60 text-muted-foreground data-panel-open:rotate-90">
                <ChevronRight />
              </SidebarMenuAction>
            }
          />
          <SidebarMenuBadge className="justify-end">
            {count !== 0 && count}
          </SidebarMenuBadge>
          <CollapsibleContent>
            <SidebarMenuSub className="m-0 px-0 border-none">
              {category.feeds.map((feed) => (
                <FeedItem key={feed.id} feed={feed} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>

          <ContextMenuContent>
            <ContextMenuGroup>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground opacity-60 line-clamp-1">
                {category.title}
              </div>
              <ContextMenuItem
                onClick={() => {
                  currentCategoryId.set(category.id.toString());
                  renameModalOpen.set(true);
                }}
              >
                {<FolderPen className="size-4 text-muted-foreground" />}
                {t("articleList.renameCategory.title")}
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </SidebarMenuItem>
      </ContextMenu>
    </Collapsible>
  );
};
export default memo(FeedsGroupContent);
