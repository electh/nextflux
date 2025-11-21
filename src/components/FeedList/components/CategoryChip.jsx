import { Chip } from "@heroui/react";
import { cn } from "@/lib/utils.js";
import { Loader2, X } from "lucide-react";
import { feeds, categories } from "@/stores/feedsStore.js";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import minifluxAPI from "@/api/miniflux.js";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { deleteCategory } from "@/db/storage";

export default function CategoryChip({ category }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const $feeds = useStore(feeds);
  const $categories = useStore(categories);
  const hasFeeds = $feeds.some((feed) => feed.categoryId === category.id);

  const handleDeleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      await minifluxAPI.deleteCategory(categoryId);
      // 更新本地数据库
      await deleteCategory(categoryId);
      // 更新内存中的 store
      categories.set($categories.filter((c) => c.id !== categoryId));
      toast.success(t("common.success"));
    } catch (error) {
      console.error("删除分类失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Chip
      key={category.id}
      variant="flat"
      size="sm"
      endContent={
        !hasFeeds ? (
          <span
            className={cn(
              "text-xs size-4 flex items-center justify-center rounded-full p-1 ml-1 text-content2-foreground",
              loading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-default-100",
            )}
            onClick={
              loading ? undefined : () => handleDeleteCategory(category.id)
            }
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </span>
        ) : null
      }
    >
      {category.title}
    </Chip>
  );
}
