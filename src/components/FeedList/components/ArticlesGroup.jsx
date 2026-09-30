import { useStore } from "@nanostores/react";
import { filter } from "@/stores/articlesStore.js";
import { totalStarredCount, totalUnreadCount } from "@/stores/feedsStore.js";
import { CircleDot, Infinity as InfinityIcon, Star } from "lucide-react";
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
  // 根据筛选条件获取显示文本和计数
  const getDisplayInfo = () => {
    switch ($filter) {
      case "unread":
        return {
          icon: <CircleDot />,
          text: t("articleList.unread"),
          count: $totalUnreadCount,
        };
      case "starred":
        return {
          icon: <Star />,
          text: t("articleList.starred"),
          count: $totalStarredCount,
        };
      default:
        return {
          icon: <InfinityIcon />,
          text: t("articleList.all"),
          count: $totalUnreadCount,
        };
    }
  };
  const { text, count } = getDisplayInfo();
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t("common.article")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={!feedId && !categoryId}
            render={
              <Link to="/" onClick={() => isMobile && setOpenMobile(false)}>
                <span className="font-semibold">{text}</span>
              </Link>
            }
            nativeButton={false}
          />
          <SidebarMenuBadge className="text-muted-foreground! opacity-60!">
            {count !== 0 && count}
          </SidebarMenuBadge>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};
export default ArticlesGroup;
