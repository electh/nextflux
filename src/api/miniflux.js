import axios from "axios";
import { authState, logout } from "@/stores/authStore";
import { toast } from "sonner";

// 创建 axios 实例
const createApiClient = () => {
  const auth = authState.get();

  const client = axios.create({
    baseURL: auth?.serverUrl || "",
    headers:
      auth?.authType === "token"
        ? {
            "X-Auth-Token": auth.token,
          }
        : auth?.username && auth?.password
          ? {
              Authorization:
                "Basic " + btoa(`${auth.username}:${auth.password}`),
            }
          : {},
  });

  // 添加响应拦截器
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // 如果响应状态码是 401,执行登出操作
      if (error.response?.status === 401) {
        logout();
      }
      const errorMessage = error.response?.data?.error_message;
      if (errorMessage && error.response?.status !== 404) {
        toast.error(errorMessage);
      }
      return Promise.reject(error);
    },
  );

  return client;
};

// 创建 API 客户端实例
let apiClient = createApiClient();

// 监听认证状态变化
authState.listen((newAuth) => {
  apiClient.defaults.baseURL = newAuth?.serverUrl || "";
  if (newAuth?.authType === "token") {
    apiClient.defaults.headers["X-Auth-Token"] = newAuth.token;
    delete apiClient.defaults.headers["Authorization"];
  } else {
    apiClient.defaults.headers["Authorization"] =
      newAuth?.username && newAuth?.password
        ? "Basic " + btoa(`${newAuth.username}:${newAuth.password}`)
        : "";
    delete apiClient.defaults.headers["X-Auth-Token"];
  }
});

// 获取所有订阅源
export const getFeeds = async () => {
  try {
    const response = await apiClient.get("/v1/feeds");
    return response.data;
  } catch (error) {
    console.error("获取订阅源失败:", error);
    throw error;
  }
};

// 获取指定订阅源的文章
export const getFeedEntries = async (feedId, params = {}) => {
  try {
    const response = await apiClient.get("/v1/feeds/" + feedId + "/entries", {
      params: { direction: "desc", limit: 50, ...params },
    });
    return response.data.entries;
  } catch (error) {
    console.error("获取文章失败:", error);
    throw error;
  }
};

// 更新文章阅读状态
export const updateEntryStatus = async (entry) => {
  try {
    const status = entry.status === "read" ? "unread" : "read";
    await apiClient.put("/v1/entries", {
      entry_ids: [entry.id],
      status,
    });
  } catch (error) {
    console.error(
      `标记文章${entry.status === "read" ? "已读" : "未读"}失败:`,
      error,
    );
    throw error;
  }
};

// 更新文章星标状态
export const updateEntryStarred = async (entry) => {
  try {
    await apiClient.put(`/v1/entries/${entry.id}/bookmark`);
  } catch (error) {
    console.error("更新文章星标状态失败:", error);
    throw error;
  }
};

// 获取变更文章
export const getChangedEntries = async (lastSyncTime) => {
  try {
    const timestamp = Math.floor(new Date(lastSyncTime).getTime() / 1000);
    const response = await apiClient.get("/v1/entries", {
      params: {
        changed_after: timestamp,
        direction: "desc",
        limit: 0,
      },
    });
    return response.data.entries;
  } catch (error) {
    console.error("获取变更文章失败:", error);
    throw error;
  }
};

// 获取新文章
export const getNewEntries = async (lastSyncTime) => {
  try {
    const timestamp = Math.floor(new Date(lastSyncTime).getTime() / 1000);
    const response = await apiClient.get("/v1/entries", {
      params: {
        after: timestamp,
        direction: "desc",
        limit: 0,
      },
    });
    return response.data.entries;
  } catch (error) {
    console.error("获取新文章失败:", error);
    throw error;
  }
};

// 标记全部已读
export const markAllAsRead = async (type, id = null) => {
  try {
    let endpoint = "/v1/entries";

    // 如果是用户级别的标记已读，先获取用户信息
    if (type === "all") {
      const response = await apiClient.get("/v1/me");
      const userId = response.data.id;
      endpoint = `/v1/users/${userId}/mark-all-as-read`;
    } else if (type === "feed" && id) {
      endpoint = `/v1/feeds/${id}/mark-all-as-read`;
    } else if (type === "category" && id) {
      endpoint = `/v1/categories/${id}/mark-all-as-read`;
    }

    await apiClient.put(endpoint);
  } catch (error) {
    console.error("标记全部已读失败:", error);
    throw error;
  }
};

// 获取所有星标文章
export const getAllStarredEntries = async () => {
  try {
    const response = await apiClient.get("/v1/entries", {
      params: {
        starred: true,
        status: "read",
        direction: "desc",
        limit: 0, // 不限制数量
      },
    });
    return response.data.entries;
  } catch (error) {
    console.error("获取星标文章失败:", error);
    throw error;
  }
};

// 获取文章原始内容
export const fetchEntryContent = async (entryId) => {
  try {
    const response = await apiClient.get(
      `/v1/entries/${entryId}/fetch-content`,
    );
    return response.data.content;
  } catch (error) {
    console.error("获取文章原始内容失败:", error);
    throw error;
  }
};

// 删除订阅源
export const deleteFeed = async (feedId) => {
  try {
    await apiClient.delete(`/v1/feeds/${feedId}`);
  } catch (error) {
    console.error("删除订阅源失败:", error);
    throw error;
  }
};

// 更新订阅源
export const updateFeed = async (feedId, data) => {
  try {
    const response = await apiClient.put(`/v1/feeds/${feedId}`, data);
    return response.data;
  } catch (error) {
    console.error("更新订阅源失败:", error);
    throw error;
  }
};

// 创建订阅源
export const createFeed = async (feedUrl, categoryId, params) => {
  try {
    const response = await apiClient.post("/v1/feeds", {
      feed_url: feedUrl,
      category_id: categoryId,
      ...params,
    });
    return response.data;
  } catch (error) {
    console.error("创建订阅源失败:", error);
    throw error;
  }
};

// 创建分类
export const createCategory = async (title) => {
  try {
    const response = await apiClient.post("/v1/categories", {
      title,
    });
    return response.data;
  } catch (error) {
    console.error("创建分类失败:", error);
    throw error;
  }
};

// 删除分类
export const deleteCategory = async (categoryId) => {
  try {
    await apiClient.delete(`/v1/categories/${categoryId}`);
  } catch (error) {
    console.error("删除分类失败:", error);
    throw error;
  }
};

// 更新分类
export const updateCategory = async (categoryId, title) => {
  try {
    const response = await apiClient.put(`/v1/categories/${categoryId}`, {
      title,
    });
    return response.data;
  } catch (error) {
    console.error("更新分类失败:", error);
    throw error;
  }
};

// 获取所有分类
export const getCategories = async () => {
  try {
    const response = await apiClient.get("/v1/categories");
    return response.data;
  } catch (error) {
    console.error("获取分类列表失败:", error);
    throw error;
  }
};

// 导入 OPML
export const importOPML = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/v1/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("导入OPML失败:", error);
    throw error;
  }
};

// 分页获取未读文章
export const getUnreadEntriesByPage = async (offset = 0, limit = 100) => {
  try {
    const response = await apiClient.get("/v1/entries", {
      params: {
        status: "unread",
        direction: "desc",
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("获取未读文章失败:", error);
    throw error;
  }
};

// 刷新订阅源
export const refreshFeed = async (feedId) => {
  try {
    await apiClient.put(`/v1/feeds/${feedId}/refresh`);
  } catch (error) {
    console.error("刷新订阅源失败:", error);
    throw error;
  }
};

// 刷新所有订阅源
export const refreshAllFeeds = async () => {
  try {
    await apiClient.put("/v1/feeds/refresh");
  } catch (error) {
    console.error("刷新所有订阅源失败:", error);
    throw error;
  }
};

// 检查是否启用了第三方集成
export const checkIntegrations = async () => {
  try {
    const response = await apiClient.get("/v1/integrations/status");
    return response.data.has_integrations;
  } catch (error) {
    console.error("检查第三方集成状态失败:", error);
    throw error;
  }
};

// 保存文章到第三方服务
export const saveToThirdParty = async (entryId) => {
  try {
    await apiClient.post(`/v1/entries/${entryId}/save`);
  } catch (error) {
    console.error("保存到第三方服务失败:", error);
    throw error;
  }
};

// 发现订阅源
export const discoverFeeds = async (url) => {
  try {
    const response = await apiClient.post("/v1/discover", {
      url: url,
    });
    return response.data;
  } catch (error) {
    console.error("发现订阅源失败:", error);
    throw error;
  }
};

// 获取订阅源图标
export const getIconByFeedId = async (feedId) => {
  try {
    const response = await apiClient.get(`/v1/feeds/${feedId}/icon`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("获取订阅源图标失败:", error);
  }
};

// 为了兼容现有代码，提供一个默认导出对象
const minifluxApi = {
  getFeeds,
  getFeedEntries,
  updateEntryStatus,
  updateEntryStarred,
  getChangedEntries,
  getNewEntries,
  markAllAsRead,
  getAllStarredEntries,
  fetchEntryContent,
  deleteFeed,
  updateFeed,
  createFeed,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategories,
  importOPML,
  getUnreadEntriesByPage,
  refreshFeed,
  refreshAllFeeds,
  checkIntegrations,
  saveToThirdParty,
  discoverFeeds,
  getIconByFeedId,
};

export default minifluxApi;
