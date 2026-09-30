import { useParams } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { SidebarTrigger } from "@/components/ui/sidebar.jsx";
import { filter } from "@/stores/articlesStore.js";
import { feeds, categories } from "@/stores/feedsStore.js";
import MarkAllReadButton from "./MarkAllReadButton";
import { isSyncing } from "@/stores/syncStore.js";
import { useTranslation } from "react-i18next";
import {
  totalStarredCount,
  totalUnreadCount,
  getCategoryCount,
  getFeedCount,
} from "@/stores/feedsStore.js";
import MenuButton from "./MenuButton";

export default function ArticleListHeader() {
  const { feedId, categoryId } = useParams();
  const $filter = useStore(filter);
  const $feeds = useStore(feeds);
  const $categories = useStore(categories);
  const $isSyncing = useStore(isSyncing);
  const $totalStarredCount = useStore(totalStarredCount);
  const $totalUnreadCount = useStore(totalUnreadCount);
  const $getCategoryCount = useStore(getCategoryCount);
  const $getFeedCount = useStore(getFeedCount);
  const { t } = useTranslation();
  // 获取标题文本
  const getTitleText = () => {
    if (feedId) {
      const feed = $feeds.find((f) => f.id === parseInt(feedId));
      return feed?.title || "";
    }

    if (categoryId) {
      const category = $categories.find((c) => c.id === parseInt(categoryId));
      return category?.title || "";
    }

    switch ($filter) {
      case "unread":
        return t("articleList.unread");
      case "starred":
        return t("articleList.starred");
      default:
        return t("articleList.all");
    }
  };

  const getCountNumber = () => {
    if (!feedId && !categoryId) {
      return $filter === "starred" ? $totalStarredCount : $totalUnreadCount;
    } else if (feedId) {
      return $getFeedCount(feedId);
    } else if (categoryId) {
      return $getCategoryCount(categoryId);
    }
  };

  const getFilteredCount = () => {
    switch ($filter) {
      case "starred": {
        const starredCount = getCountNumber();
        return starredCount > 0
          ? `${starredCount} ${t("articleList.starredItems")}`
          : `${t("articleList.noStarred")}`;
      }
      case "unread":
      case "all": {
        const unreadCount = getCountNumber();
        return unreadCount > 0
          ? `${unreadCount} ${t("articleList.unreadItems")}`
          : `${t("articleList.noUnread")}`;
      }
      default:
        return "";
    }
  };

  return (
    <div className="px-2 z-10">
      <div className="article-list-header w-full border-b py-2 standalone:pt-safe-or-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{getTitleText()}</span>
            <span className="truncate text-xs text-muted-foreground opacity-60">
              {$isSyncing ? t("common.syncing") : getFilteredCount()}
            </span>
          </div>
          <div className="ml-auto flex gap-1">
            <MarkAllReadButton />
            <MenuButton />
          </div>
        </div>
      </div>
    </div>
  );
}
