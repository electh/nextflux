import { atom } from "nanostores";

export const aiSummary = atom("");
export const aiLoading = atom(false);
export const aiError = atom(null);

export function resetAISummary() {
  aiSummary.set("");
  aiLoading.set(false);
  aiError.set(null);
}
