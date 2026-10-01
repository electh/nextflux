import { apiClient } from "@/api/client.js";

export async function createCategory(title) {
  const response = await apiClient.post("/v1/categories", { title });
  return response.data;
}

export async function deleteCategory(categoryId) {
  await apiClient.delete(`/v1/categories/${categoryId}`);
}

export async function updateCategory(categoryId, title) {
  const response = await apiClient.put(`/v1/categories/${categoryId}`, {
    title,
  });
  return response.data;
}

export async function getCategories({ signal } = {}) {
  const response = await apiClient.get("/v1/categories", { signal });
  return response.data;
}
