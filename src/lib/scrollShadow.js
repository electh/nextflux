// Clamp elastic overscroll and tolerate subpixel rounding at the end.
export function getScrollShadowVisibility({
  position,
  scrollSize,
  clientSize,
  offset = 0,
  orientation = "vertical",
  direction = "ltr",
}) {
  const extent = Math.max(0, scrollSize - clientSize);
  if (extent <= 1) return "none";
  const normalizedPosition =
    orientation === "horizontal" && direction === "rtl" ? -position : position;
  const progress = Math.min(extent, Math.max(0, normalizedPosition));
  const threshold = Math.max(0, offset);
  const before = progress > threshold;
  const after = extent - progress > threshold + 1;
  if (before && after) return "both";
  if (orientation === "horizontal") {
    if (before) return direction === "rtl" ? "right" : "left";
    if (after) return direction === "rtl" ? "left" : "right";
  } else {
    if (before) return "top";
    if (after) return "bottom";
  }
  return "none";
}
