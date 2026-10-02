import { apiClient } from "@/api/client.js";
import { reportError } from "@/lib/errors.js";

export async function getFeeds({ signal } = {}) {
  const response = await apiClient.get("/v1/feeds", { signal });
  return response.data;
}

export async function markFeedsAsRead(feedIds) {
  const uniqueFeedIds = [...new Set(feedIds.map(Number))];
  const batchSize = 10;
  const succeededFeedIds = [];
  const failedFeedIds = [];

  for (let index = 0; index < uniqueFeedIds.length; index += batchSize) {
    const batch = uniqueFeedIds.slice(index, index + batchSize);
    const results = await Promise.allSettled(
      batch.map((feedId) =>
        apiClient.put(`/v1/feeds/${feedId}/mark-all-as-read`),
      ),
    );

    results.forEach((result, resultIndex) => {
      const target =
        result.status === "fulfilled" ? succeededFeedIds : failedFeedIds;
      target.push(batch[resultIndex]);
    });
  }

  return { succeededFeedIds, failedFeedIds };
}

export async function deleteFeed(feedId) {
  await apiClient.delete(`/v1/feeds/${feedId}`);
}

export async function updateFeed(feedId, data) {
  const response = await apiClient.put(`/v1/feeds/${feedId}`, data);
  return response.data;
}

export async function createFeed(feedUrl, categoryId, params) {
  const response = await apiClient.post("/v1/feeds", {
    feed_url: feedUrl,
    category_id: categoryId,
    ...params,
  });
  return response.data;
}

export async function importOPML(file) {
  const response = await apiClient.post("/v1/import", await file.text(), {
    headers: { "Content-Type": "application/xml" },
  });
  return response.data;
}

export async function exportOPML() {
  const response = await apiClient.get("/v1/export", { responseType: "text" });
  return response.data;
}

export async function refreshFeed(feedId) {
  await apiClient.put(`/v1/feeds/${feedId}/refresh`);
}

export async function refreshAllFeeds() {
  await apiClient.put("/v1/feeds/refresh");
}

export async function discoverFeeds(url) {
  const response = await apiClient.post("/v1/discover", { url });
  return response.data;
}

export async function getIconByFeedId(feedId) {
  try {
    const response = await apiClient.get(`/v1/feeds/${feedId}/icon`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    reportError(error, "feed.getIcon");
    return undefined;
  }
}
