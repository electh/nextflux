import { useStore } from "@nanostores/react";
import { filter } from "@/stores/articlesStore.js";
import { totalStarredCount, totalUnreadCount } from "@/stores/feedsStore.js";
import { CircleDot, Star, Text } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar.jsx";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ArticlesGroup = () => {
  const { t } = useTranslation();
  const $filter = useStore(filter);
  const $totalUnreadCount = useStore(totalUnreadCount);
  const $totalStarredCount = useStore(totalStarredCount);
  const { isMobile, setOpenMobile } = useSidebar();
  const { feedId, categoryId } = useParams();
  // No-op: sidebar shows All with sub-options (Unread / Starred) when at root

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t("common.article")}</SidebarGroupLabel>
      <SidebarMenu>
        {/* All (root) with icon */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={!feedId && !categoryId && $filter === "all"}>
            <Link
              to="/"
              onClick={() => {
                filter.set("all");
                if (isMobile) setOpenMobile(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Text className="size-4" />
                <span className="font-semibold truncate">{t("articleList.all")}</span>
              </div>
            </Link>
          </SidebarMenuButton>
          {/* No badge for 'All' */}
        </SidebarMenuItem>

        {/* Unread (top level, always shown) */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={$filter === "unread"}>
            <Link
              to="/"
              onClick={() => {
                filter.set("unread");
                if (isMobile) setOpenMobile(false);
              }}
            >
              <div className="flex items-center gap-2">
                <CircleDot className="size-4" />
                <span className="truncate">{t("articleList.unread")}</span>
              </div>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuBadge className="text-default-400!">{$totalUnreadCount !== 0 && $totalUnreadCount}</SidebarMenuBadge>
        </SidebarMenuItem>

        {/* Starred (top level, always shown) */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={$filter === "starred"}>
            <Link
              to="/"
              onClick={() => {
                filter.set("starred");
                if (isMobile) setOpenMobile(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Star className="size-4" />
                <span className="truncate">{t("articleList.starred")}</span>
              </div>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuBadge className="text-default-400!">{$totalStarredCount !== 0 && $totalStarredCount}</SidebarMenuBadge>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default ArticlesGroup;
