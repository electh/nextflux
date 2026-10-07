import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { getScrollShadowVisibility } from "@/lib/scrollShadow.js";
import "./scroll-shadow.css";

/** Scrollable content with overflow-aware edge fading. */
const ScrollShadow = forwardRef(function ScrollShadow(
  {
    children,
    className,
    style,
    orientation = "vertical",
    size = 40,
    offset = 0,
    hideScrollBar = false,
    isEnabled = true,
    visibility = "auto",
    onVisibilityChange,
    ...props
  },
  ref,
) {
  const elementRef = useRef(null);
  const notifyRef = useRef(onVisibilityChange);
  const previousVisibility = useRef(null);
  useImperativeHandle(ref, () => elementRef.current, []);
  useLayoutEffect(() => {
    notifyRef.current = onVisibilityChange;
  }, [onVisibilityChange]);

  useLayoutEffect(() => {
    const element = elementRef.current;
    let frame = null;
    const update = () => {
      frame = null;
      const horizontal = orientation === "horizontal";
      const next = !isEnabled
        ? "none"
        : visibility !== "auto"
          ? visibility
          : getScrollShadowVisibility({
              position: horizontal ? element.scrollLeft : element.scrollTop,
              scrollSize: horizontal
                ? element.scrollWidth
                : element.scrollHeight,
              clientSize: horizontal
                ? element.clientWidth
                : element.clientHeight,
              offset,
              orientation,
              direction: getComputedStyle(element).direction,
            });
      if (previousVisibility.current !== next) {
        previousVisibility.current = next;
        element.dataset.scrollShadowVisibility = next;
        notifyRef.current?.(next);
      }
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    update();
    if (!isEnabled || visibility !== "auto") return;

    // Observe the content too: images and virtual list spacers can change
    // scrollHeight without resizing the scrolling viewport itself.
    const resizeObserver = new ResizeObserver(schedule);
    const observeSizes = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(element);
      for (const child of element.children) resizeObserver.observe(child);
    };
    observeSizes();
    const mutationObserver = new MutationObserver((records) => {
      if (records.some((record) => record.type === "childList")) observeSizes();
      schedule();
    });
    mutationObserver.observe(element, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style", "class", "dir"],
    });
    element.addEventListener("scroll", schedule, { passive: true });
    element.addEventListener("load", schedule, true);
    return () => {
      element.removeEventListener("scroll", schedule);
      element.removeEventListener("load", schedule, true);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [orientation, offset, visibility, isEnabled]);

  return (
    <div
      {...props}
      ref={elementRef}
      data-slot="scroll-shadow"
      data-orientation={orientation}
      data-hide-scrollbar={hideScrollBar || undefined}
      className={cn("scroll-shadow relative", className)}
      style={{ "--scroll-shadow-size": `${Math.max(0, size)}px`, ...style }}
    >
      {children}
    </div>
  );
});

export { ScrollShadow };
