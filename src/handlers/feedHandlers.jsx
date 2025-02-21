import i18next from "i18next";
import { addToast, Spinner } from "@heroui/react";
import minifluxAPI from "@/api/miniflux.js";
import { forceSync } from "@/stores/syncStore.js";
import { categoriesExpandStates } from "@/stores/feedsStore.js";

export const handleRefresh = (feedId) => {
  if (!feedId) return;

  addToast({
    title: i18next.t("common.refreshing"),
    color: "default",
    icon: <Spinner variant="simple" />,
  });

  return (async () => {
    try {
      await minifluxAPI.refreshFeed(feedId);
      await forceSync();
      addToast({
        title: i18next.t("common.success"),
        color: "success",
      });
    } catch (error) {
      addToast({
        title: i18next.t("common.error"),
        color: "danger",
      });
      throw error;
    }
  })();
};

export const toggleCategoryExpanded = (id, isOpen) => {
  categoriesExpandStates.set({
    ...categoriesExpandStates.get(),
    [id]: isOpen ?? !categoriesExpandStates.get()[id],
  });
};
