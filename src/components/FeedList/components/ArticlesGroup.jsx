import { useStore } from "@nanostores/react";
import { filter } from "@/stores/articlesStore.js";
import { totalStarredCount, totalUnreadCount } from "@/stores/feedsStore.js";
import { Infinity as InfinityIcon, Star } from "lucide-react";
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
  const isGlobalView = !feedId && !categoryId;

  const handleItemClick = (nextFilter) => {
    filter.set(nextFilter);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t("common.article")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isGlobalView && $filter === "all"}
          >
            <Link to="/" onClick={() => handleItemClick("all")}>
              <InfinityIcon />
              <span className="font-semibold">{t("articleList.all")}</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuBadge className="text-muted! opacity-60!">
            {$totalUnreadCount !== 0 && $totalUnreadCount}
          </SidebarMenuBadge>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isGlobalView && $filter === "starred"}
          >
            <Link to="/" onClick={() => handleItemClick("starred")}>
              <Star />
              <span className="font-semibold">{t("articleList.starred")}</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuBadge className="text-muted! opacity-60!">
            {$totalStarredCount !== 0 && $totalStarredCount}
          </SidebarMenuBadge>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default ArticlesGroup;
