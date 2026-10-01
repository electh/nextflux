import { getFeedIcon, setFeedIcon } from "@/db/storage.js";
import { getIconByFeedId } from "@/api/resources/feeds.js";
import { createIconLoader } from "./iconLoaderFactory.js";

export const iconService = createIconLoader({
  get: getFeedIcon,
  put: setFeedIcon,
  fetchIcon: getIconByFeedId,
  isOnline: () => navigator.onLine,
});
window.addEventListener("nextflux:logout", iconService.clear);
