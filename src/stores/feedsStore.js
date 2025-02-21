import { atom, computed } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import storage from "../db/storage";
import { filter } from "@/stores/articlesStore.js";
import { settingsState } from "@/stores/settingsStore.js";

await storage.init();

export const feeds = atom([]);
export const categories = atom(await storage.getCategories());
const defaultValue = Object.fromEntries(
  categories
    .get()
    .map((item) => [item.id, settingsState.get().defaultExpandCategory])
);
export const categoriesExpandStates = persistentAtom(
  "categoryExpanded",
  defaultValue,
  {
    encode: JSON.stringify,
    decode: (str) => {
      const storedValue = JSON.parse(str);
      return { ...defaultValue, ...storedValue };
    },
  }
);
export const error = atom(null);
export const unreadCounts = atom({});
export const starredCounts = atom({});

export const filteredFeeds = computed(
  [feeds, filter, starredCounts, unreadCounts, settingsState],
  ($feeds, $filter, $starredCounts, $unreadCounts, $settings) => {
    const visibleFeeds = $settings.showHiddenFeeds
      ? $feeds
      : $feeds.filter((feed) => !feed.hide_globally);
    return visibleFeeds.filter((feed) => {
      switch ($filter) {
        case "starred":
          return $starredCounts[feed.id] > 0;
        case "unread":
          return $unreadCounts[feed.id] > 0;
        default:
          return true;
      }
    });
  }
);

export const feedsByCategory = computed(
  [categoriesExpandStates, filteredFeeds, unreadCounts, starredCounts],
  ($categoriesExpandStates, $filteredFeeds, $unreadCounts, $starredCounts) => {
    return Object.entries(
      $filteredFeeds.reduce((acc, feed) => {
        const categoryName = feed.categoryName || "未分类";
        const categoryId = feed.categoryId || "uncategorized";
        if (!acc[categoryId]) {
          acc[categoryId] = {
            name: categoryName,
            feeds: [],
          };
        }
        acc[categoryId].feeds.push(feed);
        return acc;
      }, {})
    ).map(([id, category]) => ({
      id,
      title: category.name,
      isActive: false,
      expanded: $categoriesExpandStates[id],
      feeds: category.feeds.map((feed) => ({
        ...feed,
        unreadCount: $unreadCounts[feed.id] || 0,
        starredCount: $starredCounts[feed.id] || 0,
      })),
    }));
  }
);

// flatten categories and feeds which reactive to categoriesExpandStates
export const categoriesAndFeeds = computed(
  [feedsByCategory],
  ($feedsByCategory) => {
    return $feedsByCategory.flatMap((category) => [
      { cid: category.id, fid: undefined },
      ...(category.expanded
        ? category.feeds.map((feed) => ({ cid: category.id, fid: feed.id }))
        : []),
    ]);
  }
);

export const getCategoryCount = computed(
  [feeds, filter, starredCounts, unreadCounts],
  ($feeds, $filter, $starredCounts, $unreadCounts) => (categoryId) => {
    // 根据分类ID筛选出该分类下的所有订阅源
    const categoryFeeds = $feeds.filter((feed) =>
      categoryId === "uncategorized"
        ? !feed.categoryId
        : feed.categoryId === parseInt(categoryId)
    );

    switch ($filter) {
      case "starred":
        return categoryFeeds.reduce(
          (sum, feed) => sum + ($starredCounts[feed.id] || 0),
          0
        );
      case "unread":
      default:
        return categoryFeeds.reduce(
          (sum, feed) => sum + ($unreadCounts[feed.id] || 0),
          0
        );
    }
  }
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
  }
);

export const totalUnreadCount = computed([unreadCounts], ($unreadCounts) => {
  return Object.values($unreadCounts).reduce((sum, count) => sum + count, 0);
});

export const totalStarredCount = computed([starredCounts], ($starredCounts) => {
  return Object.values($starredCounts).reduce((sum, count) => sum + count, 0);
});

export async function loadFeeds() {
  try {
    await storage.init();
    const storedFeeds = await storage.getFeeds();
    feeds.set(storedFeeds || []);
    // const storedCategories = await storage.getCategories();
    // categories.set(storedCategories || []);
    const filteredFeeds = settingsState.get().showHiddenFeeds
      ? storedFeeds
      : storedFeeds.filter((feed) => !feed.hide_globally);

    // 获取未读和收藏计数
    const unreadCount = {};
    const starredCount = {};
    for (const feed of filteredFeeds) {
      unreadCount[feed.id] = await storage.getUnreadCount(feed.id);
      starredCount[feed.id] = await storage.getStarredCount(feed.id);
    }
    unreadCounts.set(unreadCount);
    starredCounts.set(starredCount);
  } catch (err) {
    error.set("加载订阅源失败");
    console.error(err);
  }
}
