import { useSyncExternalStore } from "react";
import { createMediaQueryStore } from "@/lib/mediaQueryStore.js";

// Match Tailwind's sm/md/lg boundaries, including fractional CSS pixels.
const mobile = createMediaQueryStore("(width < 1024px)");
const medium = createMediaQueryStore("(width < 768px)");
const small = createMediaQueryStore("(width < 640px)");

function useQuery(store) {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}

export const useIsMobileViewport = () => useQuery(mobile);
export const useIsMedium = () => useQuery(medium);

export function useIsMobile() {
  return {
    isMobile: useIsMobileViewport(),
    isMedium: useIsMedium(),
    isSmall: useQuery(small),
  };
}
