import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { Search as SearchIcon } from "lucide-react";
import {
  feedSearchResults,
  search,
  searchFeeds,
  searching,
  searchResults,
} from "@/stores/searchStore";
import { searchDialogOpen } from "@/stores/modalStore.js";
import SearchResults from "./SearchResults";
import { useNavigate } from "react-router-dom";
import { settingsState } from "@/stores/settingsStore";
import { useTranslation } from "react-i18next";
import { reportError } from "@/lib/errors.js";
import { filter } from "@/stores/articlesStore.js";
import { handleMarkStatus } from "@/handlers/articleHandlers";
import { debounce } from "lodash";
export default function SearchModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isOpen = useStore(searchDialogOpen);
  const $searchResults = useStore(searchResults);
  const $feedSearchResults = useStore(feedSearchResults);
  const { showHiddenFeeds } = useStore(settingsState);
  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState("articles");
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    let ignore = false;
    searching.set(true);
    const handleSearch = debounce(
      async () => {
        if (!keyword) {
          searchResults.set([]);
          feedSearchResults.set([]);
          return;
        }
        searchType === "articles"
          ? searchResults.set([])
          : feedSearchResults.set([]);
        try {
          const res =
            searchType === "articles"
              ? await search(keyword)
              : await searchFeeds(keyword);
          if (ignore) {
            return;
          }
          searchType === "articles"
            ? searchResults.set(res)
            : feedSearchResults.set(res);
          searching.set(false);
        } catch (error) {
          reportError(error, "search.modal");
          searching.set(false);
        }
      },
      500,
      {
        leading: false,
        trailing: true,
      },
    );
    if (!isComposing) {
      handleSearch();
    }
    return () => {
      ignore = true;
    };
  }, [keyword, searchType, showHiddenFeeds, isComposing]);

  // 处理选择结果
  const handleSelect = (item) => {
    if (searchType === "articles") {
      navigate(`/article/${item.id}`);
      if (item.status !== "read") {
        handleMarkStatus(item);
      }
    } else {
      navigate(`/feed/${item.id}`);
    }
    filter.set("all");
    searchDialogOpen.set(false);
    setKeyword("");
  };

  // 打开时加载缓存，关闭时清空搜索
  useEffect(() => {
    if (!isOpen) {
      setKeyword("");
      searchResults.set([]);
      feedSearchResults.set([]);
      setSearchType("articles");
    }
  }, [isOpen, searchType]);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => searchDialogOpen.set(open)}>
      <DialogContent
        showCloseButton={false}
        className="w-[700px] max-w-[90vw] h-[500px] max-h-[85vh] bg-popover/90 backdrop-blur-lg border shadow-2xl p-0 flex flex-col gap-0 overflow-hidden sm:max-w-[700px]"
      >
        <DialogTitle className="sr-only">{t("common.search")}</DialogTitle>
        <DialogHeader className="p-2 border-b">
          <InputGroup className="bg-transparent shadow-none ring-0 ring-transparent">
            <InputGroupAddon>
              <SearchIcon className="size-5 text-muted-foreground opacity-60 stroke-3" />
            </InputGroupAddon>
            <InputGroupInput
              ref={inputRef}
              autoFocus
              className="text-lg"
              aria-label={t("common.search")}
              placeholder={
                searchType === "articles"
                  ? t("search.searchArticlesPlaceholder")
                  : t("search.searchFeedsPlaceholder")
              }
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
            />
          </InputGroup>
        </DialogHeader>
        <div className="p-0 m-0" data-slot="overlay-body">
          <SearchResults
            results={
              searchType === "articles" ? $searchResults : $feedSearchResults
            }
            keyword={keyword}
            onSelect={handleSelect}
            type={searchType}
            isComposing={isComposing}
            inputRef={inputRef}
          />
        </div>
        <DialogFooter className="p-0 m-0">
          <div className="w-full p-2 border-t bg-background flex flex-wrap items-center justify-between gap-2">
            <Tabs
              value={searchType}
              onValueChange={(key) => {
                setSearchType(key);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              <TabsList variant="pill" aria-label="searchType">
                <TabsTrigger value="articles">
                  {t("common.article")}
                </TabsTrigger>
                <TabsTrigger value="feeds">{t("common.feed")}</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-wrap items-center gap-1 px-1">
              <Kbd>{"\u2191"}</Kbd>
              <Kbd>{"\u2193"}</Kbd>
              <span className="text-xs text-muted-foreground font-semibold">
                {t("search.toggleItem")}
              </span>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Kbd>{"\u21B5"}</Kbd>
              <span className="text-xs text-muted-foreground font-semibold">
                {t("search.open")}
              </span>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
