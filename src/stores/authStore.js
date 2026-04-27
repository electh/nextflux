import { persistentAtom } from "@nanostores/persistent";
import { normalizeServerUrl } from "@/lib/url";
import { stopAutoSync } from "./syncStore";

const defaultValue = {
  serverUrl: "",
  username: "",
  password: "",
  userId: "",
  token: "",
  authType: "basic",
};

export const authState = persistentAtom("auth", defaultValue, {
  encode: JSON.stringify,
  decode: (str) => {
    const storedValue = JSON.parse(str);
    return {
      ...defaultValue,
      ...storedValue,
      serverUrl: storedValue.serverUrl
        ? normalizeServerUrl(storedValue.serverUrl)
        : defaultValue.serverUrl,
    };
  },
});

// 登录方法
export async function login(serverUrl, username, password, token) {
  try {
    const normalizedServerUrl = normalizeServerUrl(serverUrl);
    let headers = {};
    if (token) {
      headers["X-Auth-Token"] = token;
    } else {
      headers["Authorization"] = "Basic " + btoa(`${username}:${password}`);
    }

    const response = await fetch(`${normalizedServerUrl}/v1/me`, {
      headers,
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(
        response.statusText || `HTTP error! status: ${response.status}`,
      );
    }

    const user = await response.json();

    // 保存认证信息
    authState.set({
      serverUrl: normalizedServerUrl,
      username: user.username,
      password: token ? "" : password,
      token: token || "",
      authType: token ? "token" : "basic",
      userId: user.id,
    });

    return user;
  } catch (error) {
    console.error("登录失败:", error);
    throw error;
  }
}

// 登出方法
export async function logout() {
  try {
    // 停止自动同步
    stopAutoSync();

    // 重置所有状态
    authState.set(defaultValue);

    // 异步清理存储
    await Promise.all([
      // 清理 localStorage
      new Promise((resolve) => {
        localStorage.clear();
        resolve();
      }),
      // 清理 indexedDB
      new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase("minifluxReader");
        request.onsuccess = () => resolve();
        request.onerror = () => reject();
      }),
    ]);
  } catch (error) {
    console.error("登出失败:", error);
    // 可以选择是否抛出错误
  }
}
