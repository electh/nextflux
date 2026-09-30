import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { loadFeeds } from "@/stores/feedsStore.js";
import { isSyncing, lastSync } from "@/stores/syncStore.js";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { formatLastSync } from "@/lib/format";
import { settingsState } from "@/stores/settingsStore.js";
import ArticlesGroup from "@/components/FeedList/components/ArticlesGroup.jsx";
import FeedsGroup from "@/components/FeedList/components/FeedsGroup.jsx";
import SyncButton from "@/components/FeedList/components/SyncButton.jsx";
import ProfileButton from "@/components/FeedList/components/ProfileButton.jsx";
import logo from "@/assets/logo.png";
import { getLastSyncTime } from "@/db/storage.js";
import AddFeedButton from "@/components/FeedList/components/AddFeedButton.jsx";
import { useTranslation } from "react-i18next";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useParams, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { isModalOpen } from "@/stores/modalStore";
const FeedListSidebar = () => {
  const { t } = useTranslation();
  const $lastSync = useStore(lastSync);
  const $isSyncing = useStore(isSyncing);
  const { showHiddenFeeds, floatingSidebar } = useStore(settingsState);
  const { setOpenMobile } = useSidebar();
  const { articleId } = useParams();
  const { isMobile, isMedium } = useIsMobile();
  const navigate = useNavigate();
  // 判断是否在移动端且正在查看文章详情
  const isArticleDetailOpen = isMedium && !!articleId;
  const basePath = window.location.pathname.split("/article/")[0];
  useSwipeGesture({
    onSwipeRight: () => {
      if (!articleId && isMobile && !isModalOpen.get()) {
        setOpenMobile(true);
      }
      if (articleId && isMobile) {
        navigate(basePath || "/");
      }
    },
  });
  useEffect(() => {
    lastSync.set(getLastSyncTime());
  }, []);
  useEffect(() => {
    loadFeeds();
  }, [$lastSync, showHiddenFeeds]);
  return (
    <Sidebar
      variant={floatingSidebar ? "floating" : "sidebar"}
      className={`sidebar ${isArticleDetailOpen ? "sidebar-shifted" : ""}`}
    >
      <SidebarHeader className="sidebar-header standalone:pt-safe-or-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-1">
              <img src={logo} alt="logo" className="size-8" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Nextflux</span>
                <span className="truncate text-xs text-muted-foreground opacity-60">
                  {$isSyncing ? t("common.syncing") : formatLastSync($lastSync)}
                </span>
              </div>
              <SyncButton />
              <AddFeedButton />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className={cn("overflow-y-auto", "h-full")}>
          <ArticlesGroup />
          <FeedsGroup />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <ProfileButton />
      </SidebarFooter>
    </Sidebar>
  );
};
export default FeedListSidebar;
