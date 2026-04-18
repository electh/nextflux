import { atom, computed } from "nanostores";

export const addFeedModalOpen = atom(false);
export const editFeedModalOpen = atom(false);
export const unsubscribeModalOpen = atom(false);
export const renameModalOpen = atom(false);
export const addCategoryModalOpen = atom(false);
export const shortcutsModalOpen = atom(false);
export const logoutModalOpen = atom(false);
export const aboutModalOpen = atom(false);
export const searchDialogOpen = atom(false);
export const settingsModalOpen = atom(false);
export const aiModalOpen = atom(false);

// 存储当前操作的 feedId（用于侧边栏右键菜单）
export const currentFeedId = atom(null);
// 存储当前操作的 categoryId（用于侧边栏右键菜单）
export const currentCategoryId = atom(null);


export const isModalOpen = computed([
  addFeedModalOpen,
  editFeedModalOpen,
  unsubscribeModalOpen,
  renameModalOpen,
  addCategoryModalOpen,
  shortcutsModalOpen,
  logoutModalOpen,
  aboutModalOpen,
  searchDialogOpen,
  settingsModalOpen,
  aiModalOpen,
], (...args) => {
  return args.some(Boolean);
});
