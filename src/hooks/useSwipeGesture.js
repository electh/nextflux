import { useEffect, useRef, useState } from "react";

export function useSwipeGesture({ onSwipeRight, threshold = 50 }) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);

  useEffect(() => {
    // 默认排除的选择器，包括音频和视频播放器的进度条
    const excludeSelectors = [
      ".audio-player-slider", // 音频播放器进度条
      ".video-player", // 视频播放器
      ".code-block", // code
      "iframe", // 所有iframe元素
      ".resize-bar", // article list resizer bar
      ".resize-handle", // article list resizer handle
    ];

    // 检查元素是否应该被排除
    const shouldExcludeElement = (element) => {
      if (!element) return false;

      // 检查元素本身或其父元素是否匹配排除选择器
      return excludeSelectors.some((selector) => {
        // 检查元素本身
        if (element.matches?.(selector)) return true;

        // 检查父元素
        let parent = element.parentElement;
        while (parent) {
          if (parent.matches?.(selector)) return true;
          parent = parent.parentElement;
        }

        return false;
      });
    };

    const handleTouchStart = (e) => {
      // 如果触摸开始于排除的元素，则不处理
      if (shouldExcludeElement(e.target)) return;

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      setIsScrolling(false);
      setIsHorizontalSwipe(false);
    };

    const handleTouchMove = (e) => {
      // 如果没有记录起始位置或触摸在排除的元素上，则不处理
      if (
        !touchStartX.current ||
        !touchStartY.current ||
        shouldExcludeElement(e.target)
      )
        return;

      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;

      // 如果还没有确定滑动方向
      if (!isScrolling && !isHorizontalSwipe) {
        // 判断滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setIsHorizontalSwipe(true);
          e.preventDefault(); // 阻止垂直滚动
        } else {
          setIsScrolling(true);
        }
      }

      // 如果是水平滑动，阻止默认行为
      if (isHorizontalSwipe) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      // 如果没有记录起始位置或触摸在排除的元素上，则不处理
      if (!touchStartX.current || shouldExcludeElement(e.target)) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;

      if (isHorizontalSwipe && deltaX > threshold) {
        onSwipeRight?.();
      }

      // 重置状态
      touchStartX.current = 0;
      touchStartY.current = 0;
      setIsScrolling(false);
      setIsHorizontalSwipe(false);
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeRight, threshold, isScrolling, isHorizontalSwipe]);
}
