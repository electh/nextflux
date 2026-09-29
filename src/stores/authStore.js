import { persistentAtom } from "@nanostores/persistent";
import { normalizeServerUrl } from "@/lib/url";
import { stopAutoSync } from "./syncStore";
import { clearAllData } from "@/db/storage";

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
    try {
      const storedValue = JSON.parse(str);
      return {
        ...defaultValue,
        ...storedValue,
        serverUrl: storedValue.serverUrl
          ? normalizeServerUrl(storedValue.serverUrl)
          : defaultValue.serverUrl,
      };
    } catch {
      return defaultValue;
    }
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
      const basicToken = btoa(
        unescape(encodeURIComponent(`${username}:${password}`)),
      );
      headers["Authorization"] = "Basic " + basicToken;
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

// 处理认证失效（401 等错误），仅清除凭据，保留用户偏好设置及服务器配置
export function handleAuthError() {
  try {
    stopAutoSync();
    const currentAuth = authState.get();
    authState.set({
      ...currentAuth,
      password: "",
      token: "",
    });
  } catch (error) {
    console.error("处理认证失效失败:", error);
  }
}

// 登出方法
export async function logout() {
  try {
    // 停止自动同步
    stopAutoSync();

    const currentAuth = authState.get();
    // 重置认证状态，保留 serverUrl 和 username 方便下次登录
    authState.set({
      ...defaultValue,
      serverUrl: currentAuth?.serverUrl || "",
      username: currentAuth?.username || "",
    });

    // 清理本地文章和分类缓存数据，绝不清除用户偏好设置 (settings / theme)
    await clearAllData();
  } catch (error) {
    console.error("登出失败:", error);
  }
}
