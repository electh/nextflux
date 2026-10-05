import { apiClient } from "@/api/client.js";

export async function getEnclosure(id) {
  const response = await apiClient.get(`/v1/enclosures/${id}`);
  return response.data;
}

export async function updateEnclosureProgress(id, position) {
  await apiClient.put(`/v1/enclosures/${id}`, {
    media_progression: position,
  });
}
