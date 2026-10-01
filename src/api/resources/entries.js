import { apiClient } from "@/api/client.js";

export async function getFeedEntries(feedId, params = {}) {
  const response = await apiClient.get(`/v1/feeds/${feedId}/entries`, {
    params: { direction: "desc", limit: 50, ...params },
  });
  return response.data.entries;
}

export async function updateEntryStatus(entry) {
  const status = entry.status === "read" ? "unread" : "read";
  await updateEntries([entry.id], { status });
}

export async function updateEntryStarred(entry) {
  await updateEntries([entry.id], { starred: entry.starred !== 1 });
}

export async function getEntriesPage(params = {}, { signal } = {}) {
  const response = await apiClient.get("/v1/entries", {
    params: { direction: "desc", order: "id", limit: 200, ...params },
    signal,
    paramsSerializer: { indexes: null },
  });
  return response.data;
}

export async function fetchEntryContent(entryId) {
  const response = await apiClient.get(`/v1/entries/${entryId}/fetch-content`);
  return response.data.content;
}

let supportsExplicitStarred = true;
export async function updateEntries(entryIds, changes) {
  if (!entryIds.length) return;
  if (changes.starred === undefined || supportsExplicitStarred) {
    try {
      await apiClient.put("/v1/entries", { entry_ids: entryIds, ...changes });
      return;
    } catch (error) {
      // starred writes were added in 2.3.2; older servers reject starred-only bodies.
      if (changes.starred === undefined || error.response?.status !== 400)
        throw error;
      supportsExplicitStarred = false;
    }
  }
  if (changes.status !== undefined) {
    await apiClient.put("/v1/entries", {
      entry_ids: entryIds,
      status: changes.status,
    });
  }
  for (const id of entryIds) {
    const { data } = await apiClient.get(`/v1/entries/${id}`);
    if (data.starred !== changes.starred)
      await apiClient.put(`/v1/entries/${id}/bookmark`);
  }
}
