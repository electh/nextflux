import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { filter } from "@/stores/articlesStore";
import { Circle, Star, Text } from "lucide-react";
import { useStore } from "@nanostores/react";
import { useTranslation } from "react-i18next";
export default function ArticleListFooter() {
  const { t } = useTranslation();
  const $filter = useStore(filter);
  return (
    <div className="article-list-footer absolute bottom-0 w-full bg-transparent flex flex-col items-center justify-center pb-4 standalone:pb-safe-or-4">
      <Tabs
        aria-label="filter"
        value={$filter}
        onValueChange={(value) => {
          filter.set(value);
        }}
      >
        <>
          <TabsList
            variant="pill"
            aria-label="filter"
            className="backdrop-blur-md shadow-custom w-fit *:h-6 *:w-fit *:px-3 *:text-xs *:font-normal"
          >
            <TabsTrigger value="starred">
              <div className="flex items-center gap-1.5">
                <Star className="size-3 fill-current" strokeWidth={0} />
                <span>{t("articleList.starred")}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="unread">
              <div className="flex items-center gap-1.5">
                <Circle className="size-3 p-px fill-current" strokeWidth={0} />
                <span>{t("articleList.unread")}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="all">
              <div className="flex items-center gap-1.5">
                <Text strokeWidth={4} className="size-3" />
                <span>{t("articleList.all")}</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </>
      </Tabs>
    </div>
  );
}
