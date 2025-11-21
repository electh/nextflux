import { useStore } from "@nanostores/react";
import {
  getCategoryCount,
  categoryExpandedState,
  updateCategoryExpandState,
} from "@/stores/feedsStore.js";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
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
import { useEffect } from "react";
import FeedItem from "./FeedItem";

const FeedsGroupContent = ({ category }) => {
  const $getCategoryCount = useStore(getCategoryCount);
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
              <FeedItem key={feed.id} feed={feed} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default FeedsGroupContent;
