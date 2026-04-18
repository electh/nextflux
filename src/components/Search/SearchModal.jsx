import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { Separator, InputGroup, Kbd, Modal, Tabs, Button } from "@heroui/react";
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
        } catch {
          console.error("搜索失败");
          searching.set(false);
        }
      },
      500,
      { leading: false, trailing: true },
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
    <Modal>
      <Button className="hidden" />
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => searchDialogOpen.set(open)}
        variant="transparent"
      >
        <Modal.Container scroll="inside" size="lg">
          <Modal.Dialog className="max-h-[80vh] h-[400px] bg-background/90 backdrop-blur-lg border shadow-2xl p-0">
            <Modal.Header className="p-3 bg-background">
              <InputGroup>
                <InputGroup.Prefix>
                  <SearchIcon className="size-4 text-muted opacity-60" />
                </InputGroup.Prefix>
                <InputGroup.Input
                  ref={inputRef}
                  autoFocus
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
            </Modal.Header>
            <Modal.Body className="p-0 m-0 bg-background">
              <SearchResults
                results={
                  searchType === "articles"
                    ? $searchResults
                    : $feedSearchResults
                }
                keyword={keyword}
                onSelect={handleSelect}
                type={searchType}
                isComposing={isComposing}
              />
            </Modal.Body>
            <Modal.Footer className="p-0 m-0">
              <div className="w-full p-3 border-t flex items-center justify-between">
                <Tabs
                  selectedKey={searchType}
                  onSelectionChange={(key) => {
                    setSearchType(key);
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                >
                  <Tabs.ListContainer>
                    <Tabs.List
                      aria-label="searchType"
                      className="w-fit *:h-6 *:w-fit *:px-3 *:text-sm *:font-normal p-px gap-0"
                    >
                      <Tabs.Tab id="articles">
                        {t("common.article")}
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="feeds">
                        {t("common.feed")}
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>
                </Tabs>
                <div className="flex items-center gap-1 px-1">
                  <Kbd>
                    <Kbd.Abbr keyValue="up" />
                  </Kbd>
                  <Kbd>
                    <Kbd.Abbr keyValue="down" />
                  </Kbd>
                  <span className="text-xs text-muted font-semibold">
                    {t("search.toggleItem")}
                  </span>
                  <Separator orientation="vertical" className="h-5 mx-1" />
                  <Kbd>
                    <Kbd.Abbr keyValue="enter" />
                  </Kbd>
                  <span className="text-xs text-muted font-semibold">
                    {t("search.open")}
                  </span>
                </div>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
