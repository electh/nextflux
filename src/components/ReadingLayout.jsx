import { useDefaultLayout } from "react-resizable-panels";
import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import FeedListSidebar from "@/components/FeedList/FeedListSidebar.jsx";
import { useSidebar } from "@/components/ui/sidebar.jsx";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.jsx";
import { useIsMedium } from "@/hooks/use-mobile.jsx";
import { readingLayoutStorage } from "@/lib/readingLayoutStorage.js";

const expandedPanelIds = ["feeds", "articles", "reader"];
const collapsedPanelIds = ["articles", "reader"];
const compactLayout = { articles: 100, reader: 0 };
const resizeTargetMinimumSize = { fine: 12, coarse: 24 };

export default function ReadingLayout({ children, reader }) {
  const { t } = useTranslation();
  const { open, isMobile } = useSidebar();
  const isMedium = useIsMedium();
  const showSidebar = !isMobile && open;
  const panelIds = showSidebar ? expandedPanelIds : collapsedPanelIds;
  const groupRef = useRef(null);
  const elementRef = useRef(null);
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "nextflux-reading-layout",
    panelIds,
    storage: readingLayoutStorage,
    onlySaveAfterUserInteractions: true,
  });

  useLayoutEffect(() => {
    if (isMedium) return;
    // The group stays mounted on mobile, so explicitly restore the desktop
    // layout instead of carrying the compact layout's 100/0 split back to it.
    // Panel registration settles in a nested layout update after a sidebar change.
    const frame = requestAnimationFrame(() => {
      const width = elementRef.current?.clientWidth;
      const current = groupRef.current?.getLayout();
      if (
        !width ||
        !current ||
        Object.keys(current).length !== panelIds.length ||
        !panelIds.every((id) => id in current)
      )
        return;
      const available = width - (showSidebar ? 2 : 1);
      const feeds = showSidebar ? (256 / available) * 100 : 0;
      const articles = (336 / available) * 100;
      groupRef.current.setLayout(
        defaultLayout ?? {
          ...(showSidebar ? { feeds } : {}),
          articles,
          reader: 100 - feeds - articles,
        },
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [isMedium, showSidebar, panelIds, defaultLayout]);

  return (
    <>
      {!showSidebar && <FeedListSidebar />}
      <ResizablePanelGroup
        id="reading-layout"
        groupRef={groupRef}
        elementRef={elementRef}
        role="main"
        orientation="horizontal"
        className="min-w-0 flex-1 bg-sidebar"
        style={{ height: "100dvh" }}
        data-compact={isMedium}
        disabled={isMedium}
        defaultLayout={isMedium ? compactLayout : defaultLayout}
        onLayoutChanged={onLayoutChanged}
        resizeTargetMinimumSize={resizeTargetMinimumSize}
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
          minSize={isMedium ? "0%" : "280px"}
          maxSize={isMedium ? "100%" : "60%"}
          groupResizeBehavior="preserve-pixel-size"
        >
          {children}
        </ResizablePanel>
        <ResizableHandle
          key="articles-handle"
          id="articles-handle"
          disabled={isMedium}
          withDivider={false}
          aria-label={t("common.resizeArticles")}
        />
        <ResizablePanel
          key="reader"
          id="reader"
          minSize={isMedium ? "0%" : "400px"}
          maxSize="100%"
          style={{ overflow: "visible" }}
        >
          {reader}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
