import { atom, computed } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import { getFeeds, getCategories, getFeedCounts } from "../db/storage";
import { filter } from "@/stores/articleFilterStore.js";
import { starredCounts, unreadCounts } from "@/stores/feedCountersStore.js";
import { settingsState } from "@/stores/settingsStore.js";
import {
  reconcileRecords,
  sameRecord,
} from "@/domain/sync/reconcileRecords.js";
import { reportError } from "@/lib/errors.js";

export {
  starredCounts,
  totalStarredCount,
  totalUnreadCount,
  unreadCounts,
} from "@/stores/feedCountersStore.js";

export const feeds = atom([]);
export const categories = atom([]);
export const error = atom(null);

import { sessionAccount } from "@/stores/authStore.js";
import { accountStorageKey } from "@/domain/auth/accounts.js";

export const categoryExpandedState = persistentAtom(
  accountStorageKey(sessionAccount, "categoryExpanded"),
  {},
  {
    encode: (value) => JSON.stringify(value),
    decode: (str) => JSON.parse(str),
  },
);

// 更新分类展开状态
export const updateCategoryExpandState = (categoryId, isExpanded) => {
  const currentState = categoryExpandedState.get();
  if (currentState[categoryId] === isExpanded) return;
  categoryExpandedState.set({
    ...currentState,
    [categoryId]: isExpanded,
  });
};

let previousFilteredFeeds = [];
export const filteredFeeds = computed(
  [feeds, filter, starredCounts, unreadCounts, settingsState],
  ($feeds, $filter, $starredCounts, $unreadCounts, $settings) => {
    const visibleFeeds = $settings.showHiddenFeeds
      ? $feeds
      : $feeds.filter((feed) => !feed.hide_globally);
    const next = visibleFeeds.filter((feed) => {
      switch ($filter) {
        case "starred":
          return $starredCounts[feed.id] > 0;
        case "unread":
          return $unreadCounts[feed.id] > 0;
        default:
          return true;
      }
    });
    previousFilteredFeeds = reconcileRecords(previousFilteredFeeds, next);
    return previousFilteredFeeds;
  },
);

let previousGroups = [];
export const feedsByCategory = computed(
  [filteredFeeds, categories],
  ($filteredFeeds, $categories) => {
    const next = Object.entries(
      $filteredFeeds.reduce((acc, feed) => {
        const categoryId = feed.categoryId || "uncategorized";
        const category = $categories.find((c) => c.id === feed.categoryId);
        const categoryName = category ? category.title : "未分类";

        if (!acc[categoryId]) {
          acc[categoryId] = {
            name: categoryName,
            feeds: [],
          };
        }
        acc[categoryId].feeds.push(feed);
        return acc;
      }, {}),
    )
      .map(([id, category]) => ({
        id,
        title: category.name,
        isActive: false,
        feeds: category.feeds,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
    previousGroups = reconcileRecords(previousGroups, next);
    return previousGroups;
  },
);

export const getCategoryCount = computed(
  [feeds, filter, starredCounts, unreadCounts],
  ($feeds, $filter, $starredCounts, $unreadCounts) => (categoryId) => {
    // 根据分类ID筛选出该分类下的所有订阅源
    const categoryFeeds = $feeds.filter((feed) =>
      categoryId === "uncategorized"
        ? !feed.categoryId
        : feed.categoryId === parseInt(categoryId),
    );

    switch ($filter) {
      case "starred":
        return categoryFeeds.reduce(
          (sum, feed) => sum + ($starredCounts[feed.id] || 0),
          0,
        );
      case "unread":
      default:
        return categoryFeeds.reduce(
          (sum, feed) => sum + ($unreadCounts[feed.id] || 0),
          0,
        );
    }
  },
);

export const getFeedCount = computed(
  [filter, starredCounts, unreadCounts],
  ($filter, $starredCounts, $unreadCounts) => (feedId) => {
    switch ($filter) {
      case "starred":
        return $starredCounts[feedId] || 0;
      case "unread":
      default:
        return $unreadCounts[feedId] || 0;
    }
  },
);

// Each row subscribes to its own numeric value instead of the shared count function.
export const createFeedCountStore = (id) =>
  computed(getFeedCount, (getCount) => getCount(id));
export const createCategoryCountStore = (id) =>
  computed(getCategoryCount, (getCount) => getCount(id));

let loadVersion = 0;
export async function loadFeeds() {
  const version = ++loadVersion;
  try {
    const [storedFeeds, storedCategories, counts] = await Promise.all([
      getFeeds(),
      getCategories(),
      getFeedCounts(),
    ]);
    if (version !== loadVersion) return;
    feeds.set(reconcileRecords(feeds.get(), storedFeeds));
    categories.set(reconcileRecords(categories.get(), storedCategories));
    const visibleIds = new Set(
      storedFeeds
        .filter(
          (feed) => settingsState.get().showHiddenFeeds || !feed.hide_globally,
        )
        .map(({ id }) => String(id)),
    );
    const visibleCounts = (values) =>
      Object.fromEntries(
        Object.entries(values).filter(([id]) => visibleIds.has(id)),
      );
    const unread = visibleCounts(counts.unread);
    const starred = visibleCounts(counts.starred);
    if (!sameRecord(unreadCounts.get(), unread)) unreadCounts.set(unread);
    if (!sameRecord(starredCounts.get(), starred)) starredCounts.set(starred);
  } catch (err) {
    error.set(reportError(err, "feeds.load", "加载订阅源失败"));
  }
}
