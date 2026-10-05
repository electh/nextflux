import axios from "axios";
import { toast } from "sonner";
import { authState, sessionAccount, logout } from "@/stores/authStore";

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
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      JSON.stringify(authState.get()) === JSON.stringify(sessionAccount)
    ) {
      logout();
    }

    const errorMessage = error.response?.data?.error_message;
    if (errorMessage && error.response?.status !== 404) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  },
);
