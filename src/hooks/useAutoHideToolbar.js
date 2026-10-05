import { useEffect, useRef, useState } from "react";

export function useAutoHideToolbar(scrollAreaRef, enabled, resetKey) {
  const toolbarRef = useRef(null);
  const hoveredRef = useRef(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setHidden(false);
    const viewport = scrollAreaRef.current;
    if (!viewport) return;
    let previousTop = viewport.scrollTop;
    let distance = 0;
    let direction = 0;

    const onScroll = () => {
      // Clamp elastic overscroll so bouncing at either edge cannot hide the bar.
      const top = Math.max(
        0,
        Math.min(
          viewport.scrollTop,
          viewport.scrollHeight - viewport.clientHeight,
        ),
      );
      const delta = top - previousTop;
      previousTop = top;
      const toolbar = toolbarRef.current;
      if (
        top <= (toolbar?.offsetHeight ?? 48) ||
        hoveredRef.current ||
        toolbar?.contains(document.activeElement)
      ) {
        distance = 0;
        setHidden(false);
        return;
      }
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      if (nextDirection !== direction) distance = 0;
      direction = nextDirection;
      distance += Math.abs(delta);
      // Ignore small movements; reveal more readily than we hide.
      if (distance >= (direction > 0 ? 48 : 12)) {
        setHidden(direction > 0);
        distance = 0;
      }
    };
    const onPointerMove = (event) => {
      if (event.pointerType === "touch") return;
      const offset = event.clientY - viewport.getBoundingClientRect().top;
      if (offset >= 0 && offset <= 24) {
        distance = 0;
        setHidden(false);
      }
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("pointermove", onPointerMove);
    };
  }, [scrollAreaRef, enabled, resetKey]);

  return {
    toolbarRef,
    hidden: enabled && hidden,
    onFocusCapture: () => setHidden(false),
    onPointerEnter: (event) => {
      if (event.pointerType !== "touch") {
        hoveredRef.current = true;
        setHidden(false);
      }
    },
    onPointerLeave: () => {
      hoveredRef.current = false;
    },
  };
}
