import axios from "axios";
import { toast } from "sonner";
import { authState, sessionAccount, expireSession } from "@/stores/authStore";
import { reportError } from "@/lib/errors.js";
import i18n from "@/i18n/index.js";

function getAuthHeaders(auth) {
  if (auth?.authType === "token") {
    return { "X-Auth-Token": auth.token };
  }

  if (auth?.username && auth?.password) {
    return {
      Authorization: `Basic ${btoa(`${auth.username}:${auth.password}`)}`,
    };
  }

  return {};
}

export const apiClient = axios.create({
  baseURL: sessionAccount.serverUrl || "",
  headers: getAuthHeaders(sessionAccount),
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      JSON.stringify(authState.get()) === JSON.stringify(sessionAccount)
    ) {
      try {
        expireSession();
      } catch (sessionError) {
        reportError(sessionError, "auth.expireSession");
        toast.error(i18n.t("auth.logoutFailed"));
      }
    }

    const errorMessage = error.response?.data?.error_message;
    if (errorMessage && error.response?.status !== 404) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  },
);
