import { useStore } from "@nanostores/react";
import {
  getCategoryCount,
  getFeedCount,
  categoryExpandedState,
  updateCategoryExpandState,
} from "@/stores/feedsStore.js";
import { cn } from "@/lib/utils";
import { ChevronRight, TriangleAlert } from "lucide-react";
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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import FeedIcon from "@/components/ui/FeedIcon";
import { settingsState } from "@/stores/settingsStore";
import { useEffect } from "react";

const FeedsGroupContent = ({ category }) => {
  const $getCategoryCount = useStore(getCategoryCount);
  const $getFeedCount = useStore(getFeedCount);
  const { isNarrow, setOpenMobile } = useSidebar();
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
        feedItem?.scrollIntoView({ behavior: "instant", block: "nearest" });
      }
    }
  }, [feedId, category.id, category.feeds]);

  return (
    <Collapsible
      key={category.id}
      open={$categoryExpandedState[category.id] ?? defaultExpandCategory}
      onOpenChange={(open) => updateCategoryExpandState(category.id, open)}
    >
      <SidebarMenuItem key={`menu-${category.id}`}>
        <SidebarMenuButton
          className={cn(
            categoryId === category.id && "bg-default/60 rounded-md",
          )}
          asChild
        >
          <Link
            to={`/category/${category.id}`}
            onClick={() => isNarrow && setOpenMobile(false)}
          >
            <span className={"pl-6 font-medium"}>{category.title}</span>
          </Link>
        </SidebarMenuButton>

        <CollapsibleTrigger asChild>
          <SidebarMenuAction className="left-2 hover:bg-default/60 text-default-500 data-[state=open]:rotate-90">
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
              <SidebarMenuSubItem key={feed.id}>
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
                    onClick={() => isNarrow && setOpenMobile(false)}
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
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default FeedsGroupContent;
