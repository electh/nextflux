import { useDefaultLayout } from "react-resizable-panels";
import { useTranslation } from "react-i18next";
import FeedListSidebar from "@/components/FeedList/FeedListSidebar.jsx";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar.jsx";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.jsx";
import { useIsMobile } from "@/hooks/use-mobile.jsx";
import { readingLayoutStorage } from "@/lib/readingLayoutStorage.js";

function ResizableReadingLayout({ children, reader }) {
  const { t } = useTranslation();
  const { open, isMobile } = useSidebar();
  const showSidebar = !isMobile && open;
  const panelIds = showSidebar
    ? ["feeds", "articles", "reader"]
    : ["articles", "reader"];
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "nextflux-reading-layout",
    panelIds,
    storage: readingLayoutStorage,
    onlySaveAfterUserInteractions: true,
  });

  return (
    <>
      {!showSidebar && <FeedListSidebar />}
      <ResizablePanelGroup
        id="reading-layout"
        role="main"
        orientation="horizontal"
        className="min-w-0 flex-1 bg-sidebar"
        style={{ height: "100dvh" }}
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        resizeTargetMinimumSize={{ fine: 12, coarse: 24 }}
      >
        {showSidebar && (
          <ResizablePanel
            key="feeds"
            id="feeds"
            defaultSize="256px"
            minSize="240px"
            maxSize="360px"
            groupResizeBehavior="preserve-pixel-size"
          >
            <FeedListSidebar resizable />
          </ResizablePanel>
        )}
        {showSidebar && (
          <ResizableHandle
            key="feeds-handle"
            id="feeds-handle"
            aria-label={t("common.resizeFeeds")}
          />
        )}
        <ResizablePanel
          key="articles"
          id="articles"
          defaultSize="336px"
          minSize="280px"
          maxSize="60%"
          groupResizeBehavior="preserve-pixel-size"
        >
          {children}
        </ResizablePanel>
        <ResizableHandle
          key="articles-handle"
          id="articles-handle"
          withDivider={false}
          aria-label={t("common.resizeArticles")}
        />
        <ResizablePanel
          key="reader"
          id="reader"
          minSize="400px"
          maxSize="100%"
          style={{ overflow: "visible" }}
        >
          {reader}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}

export default function ReadingLayout({ children, reader }) {
  const { isMedium } = useIsMobile();

  if (!isMedium) {
    return (
      <ResizableReadingLayout reader={reader}>
        {children}
      </ResizableReadingLayout>
    );
  }

  return (
    <>
      <FeedListSidebar />
      <SidebarInset className="min-w-0 bg-sidebar">
        <div className="main-content flex w-full min-w-0 bg-sidebar">
          {children}
          {reader}
        </div>
      </SidebarInset>
    </>
  );
}
