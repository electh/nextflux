import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { categories } from "@/stores/feedsStore";
import { addFeedModalOpen } from "@/stores/modalStore";
import minifluxAPI from "@/api/miniflux";
import { forceSync } from "@/stores/syncStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Rss, Loader2, ChevronDown } from "lucide-react";
import GlassYellow from "@/assets/glass-yellow.svg";
import { reportError } from "@/lib/errors.js";
import {
  SiYoutube,
  SiReddit,
  SiMastodon,
} from "@icons-pack/react-simple-icons";
import CustomModal from "@/components/ui/CustomModal.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Podcast } from "lucide-react";
import ResultListbox from "./ResultListbox";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
export default function AddFeedModal() {
  const { t } = useTranslation();
  const $categories = useStore(categories);
  const $addFeedModalOpen = useStore(addFeedModalOpen);
  const [loading, setLoading] = useState(false); // 调用添加接口加载状态
  const [results, setResults] = useState([]); // 搜索结果
  const [searchType, setSearchType] = useState("feed"); // 搜索类型
  const [searchQuery, setSearchQuery] = useState(""); // 搜索关键字
  const [isComposing, setIsComposing] = useState(false); // 是否正在使用输入法输入中文
  const [searching, setSearching] = useState(false); // 调用搜索接口加载状态
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    feed_url: "",
    category_id: "",
    crawler: false,
    scraper_rules: "",
    keeplist_rules: "",
    blocklist_rules: "",
    rewrite_rules: "",
  });
  const supportedTypes = [
    {
      id: "feed",
      label: t("feed.feed"),
      prefix: "",
      suffix: "",
      rewrite_rules: "",
      icon: <Rss strokeWidth={3} className="size-4 text-[#FFA500]" />,
      placeholder: "https://www.example.com",
    },
    {
      id: "youtube",
      label: t("feed.youtubeChannel"),
      prefix: "https://www.youtube.com/@",
      suffix: "",
      rewrite_rules: "",
      icon: <SiYoutube className="size-4 text-[#FF0000]" />,
      placeholder: t("feed.youtubeChannelPlaceholder"),
    },
    {
      id: "reddit",
      label: t("feed.reddit"),
      prefix: "https://www.reddit.com/r/",
      suffix: "/top.rss",
      rewrite_rules: "remove_tables",
      icon: <SiReddit className="size-4 text-[#FF4500]" />,
      placeholder: t("feed.redditPlaceholder"),
    },
    {
      id: "podcast",
      label: t("feed.podcast"),
      prefix: "",
      suffix: "",
      rewrite_rules: "",
      icon: <Podcast className="size-4 text-[#9933CC]" />,
      placeholder: t("feed.podcastPlaceholder"),
    },
    {
      id: "mastodon",
      label: t("feed.mastodon"),
      prefix: "",
      suffix: "",
      rewrite_rules: "",
      icon: <SiMastodon className="size-4 text-[#6364FF]" />,
      placeholder: t("feed.mastodonPlaceholder"),
    },
    {
      id: "glass",
      label: t("feed.glass"),
      prefix: "",
      suffix: "",
      rewrite_rules: "",
      icon: <img src={GlassYellow} className="size-4" alt="glass" />,
      placeholder: t("feed.glassPlaceholder"),
    },
  ];
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      setSearching(true);
      const type = supportedTypes.find((type) => type.id === searchType);
      if (!type) return;
      let feeds;
      if (searchType === "podcast") {
        // 调用播客搜索API
        const response = await fetch(
          `https://api.podcastindex.org/search?term=${encodeURIComponent(searchQuery)}`,
        );
        const data = await response.json();

        // 将播客搜索结果转换为feed格式
        feeds = data.results.map((podcast) => ({
          url: podcast.feedUrl,
          title: podcast.collectionName,
          icon_url: podcast.artworkUrl100,
        }));
      } else {
        const url = `${type.prefix}${searchQuery}${type.suffix}`;
        feeds = await minifluxAPI.discoverFeeds(url);
      }
      setResults(feeds);
      // 如果搜索结果唯一，则自动添加
      if (feeds.length === 1) {
        setFormData({
          ...formData,
          feed_url: feeds[0].url,
          rewrite_rules: type.rewrite_rules,
        });
      }
    } catch (e) {
      if (e.response?.status === 404) {
        toast.error(t("search.searchResultsPlaceholder"));
      }
      setResults([]);
    } finally {
      setSearching(false);
    }
  };
  const handleSelect = (key) => {
    setFormData({
      ...formData,
      feed_url: Array.from(key)[0],
      rewrite_rules: supportedTypes.find((type) => type.id === searchType)
        .rewrite_rules,
    });
  };
  const onClose = () => {
    addFeedModalOpen.set(false);
    setSearchType("feed");
    setSearchQuery("");
    setResults([]);
    setFormData({
      feed_url: "",
      category_id: "",
      crawler: false,
      scraper_rules: "",
      keeplist_rules: "",
      blocklist_rules: "",
      rewrite_rules: "",
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await minifluxAPI.createFeed(
        formData.feed_url,
        formData.category_id,
        {
          crawler: formData.crawler,
          scraper_rules: formData.scraper_rules,
          keeplist_rules: formData.keeplist_rules,
          blocklist_rules: formData.blocklist_rules,
          rewrite_rules: formData.rewrite_rules,
        },
      );
      await forceSync(); // 重新加载订阅源列表以更新UI
      onClose();
      // 导航到新增的订阅源
      navigate(`/feed/${response.feed_id}`);
    } catch (error) {
      reportError(error, "feed.create");
    } finally {
      setLoading(false);
    }
  };
  const isDiscoverMode = !formData.feed_url || formData.feed_url === "";
  return (
    <CustomModal
      open={$addFeedModalOpen}
      onOpenChange={onClose}
      title={t("sidebar.addFeed")}
      footer={
        isDiscoverMode ? (
          <Button
            onClick={handleSearch}
            disabled={searchQuery === "" || searchType === "" || searching}
            className="w-full"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {t("common.search")}
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setFormData({
                  feed_url: "",
                  category_id: "",
                  crawler: false,
                  scraper_rules: "",
                  keeplist_rules: "",
                  blocklist_rules: "",
                  rewrite_rules: "",
                });
              }}
              className="w-full"
            >
              {t("common.back")}
            </Button>
            <Button
              type="submit"
              form="add-feed-form"
              disabled={loading}
              aria-busy={loading}
              className="w-full"
            >
              {loading && <Spinner />}
              {t("common.save")}
            </Button>
          </>
        )
      }
    >
      <div
        className={cn("overflow-y-auto", "w-full overflow-y-auto px-4 pb-4")}
      >
        <AnimatePresence initial={false} mode="wait">
          {!formData.feed_url || formData.feed_url === "" ? (
            <motion.div
              key="discover"
              className="flex flex-col gap-3"
              initial={{
                opacity: 0,
                x: "-100%",
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                type: "spring",
                bounce: 0,
                duration: 0.2,
              }}
            >
              <Field>
                <FieldLabel htmlFor="add-type">{t("feed.feedType")}</FieldLabel>
                <Select
                  value={searchType}
                  items={[
                    {
                      value: null,
                      label: t("feed.feedTypePlaceholder"),
                    },
                    ...supportedTypes.map((item) => ({
                      value: item.id,
                      label: item.label,
                    })),
                  ]}
                  onValueChange={(value) => {
                    setSearchType(value);
                    setSearchQuery("");
                    setResults([]);
                  }}
                  required={true}
                >
                  <SelectTrigger className="w-full" id="add-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {supportedTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="field-9238">
                  {t("feed.searchQuery")}
                </FieldLabel>
                <Input
                  placeholder={
                    supportedTypes.find((type) => type.id === searchType)
                      .placeholder
                  }
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setResults([]);
                  }}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !isComposing) {
                      event.preventDefault();
                      handleSearch();
                    }
                  }}
                  required={true}
                  id="field-9238"
                />
              </Field>
              <ResultListbox
                results={results}
                searchType={searchType}
                handleSelect={handleSelect}
              />
            </motion.div>
          ) : (
            <motion.form
              id="add-feed-form"
              key="submit"
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-4"
              initial={{
                opacity: 0,
                x: "100%",
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                type: "spring",
                bounce: 0,
                duration: 0.2,
              }}
            >
              <Field>
                <FieldLabel htmlFor="feed_url">{t("feed.feedUrl")}</FieldLabel>
                <Input
                  placeholder={t("feed.feedUrlPlaceholder")}
                  value={formData.feed_url}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      feed_url: event.target.value,
                    })
                  }
                  required={true}
                  name="feed_url"
                  id="feed_url"
                />
                <FieldError>{t("feed.feedUrlRequired")}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="add-category">
                  {t("feed.feedCategory")}
                </FieldLabel>
                <Select
                  value={
                    formData.category_id === "" ? null : formData.category_id
                  }
                  items={[
                    {
                      value: null,
                      label: t("feed.feedCategoryPlaceholder"),
                    },
                    ...$categories.map((item) => ({
                      value: item.id,
                      label: item.title,
                    })),
                  ]}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category_id: value == null ? "" : Number(value),
                    })
                  }
                  required={true}
                >
                  <SelectTrigger className="w-full" id="add-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {$categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger
                  render={
                    <Button
                      variant="secondary"
                      className={cn(
                        "w-full",
                        "flex justify-between rounded-field px-3 text-muted-foreground",
                      )}
                    >
                      {t("feed.advancedOptions")}
                      <ChevronDown
                        className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                      />
                    </Button>
                  }
                />
                <CollapsibleContent className="overflow-visible">
                  <div className="flex flex-col gap-4 pt-2">
                    <Field>
                      <FieldLabel htmlFor="scraper_rules">
                        {
                          <a
                            className="inline-flex items-center gap-1 no-underline hover:underline"
                            href="https://miniflux.app/docs/rules.html#scraper-rules"
                            target="_blank"
                          >
                            {t("feed.feedScraperRules")}
                            <ArrowUpRight className="size-3.5" />
                          </a>
                        }
                      </FieldLabel>
                      <Input
                        placeholder={t("feed.feedScraperRulesPlaceholder")}
                        value={formData.scraper_rules}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            scraper_rules: event.target.value,
                          })
                        }
                        name="scraper_rules"
                        id="scraper_rules"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="keeplist_rules">
                        {
                          <a
                            className="inline-flex items-center gap-1 no-underline hover:underline"
                            href="https://miniflux.app/docs/rules.html#feed-filtering-rules"
                            target="_blank"
                          >
                            {t("feed.feedKeeplistRules")}
                            <ArrowUpRight className="size-3.5" />
                          </a>
                        }
                      </FieldLabel>
                      <Input
                        placeholder={t("feed.feedKeeplistRulesPlaceholder")}
                        value={formData.keeplist_rules}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            keeplist_rules: event.target.value,
                          })
                        }
                        name="keeplist_rules"
                        id="keeplist_rules"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="blocklist_rules">
                        {
                          <a
                            className="inline-flex items-center gap-1 no-underline hover:underline"
                            href="https://miniflux.app/docs/rules.html#feed-filtering-rules"
                            target="_blank"
                          >
                            {t("feed.feedBlocklistRules")}
                            <ArrowUpRight className="size-3.5" />
                          </a>
                        }
                      </FieldLabel>
                      <Input
                        placeholder={t("feed.feedBlocklistRulesPlaceholder")}
                        value={formData.blocklist_rules}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            blocklist_rules: event.target.value,
                          })
                        }
                        name="blocklist_rules"
                        id="blocklist_rules"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="rewrite_rules">
                        {
                          <a
                            className="inline-flex items-center gap-1 no-underline hover:underline"
                            href="https://miniflux.app/docs/rules.html#rewrite-rules"
                            target="_blank"
                          >
                            {t("feed.feedRewriteRules")}
                            <ArrowUpRight className="size-3.5" />
                          </a>
                        }
                      </FieldLabel>
                      <Textarea
                        placeholder={t("feed.feedRewriteRulesPlaceholder")}
                        value={formData.rewrite_rules}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            rewrite_rules: event.target.value,
                          })
                        }
                        name="rewrite_rules"
                        id="rewrite_rules"
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        value="crawler"
                        checked={formData.crawler}
                        onCheckedChange={(value) =>
                          setFormData({
                            ...formData,
                            crawler: value,
                          })
                        }
                        id="crawler"
                      />
                      <FieldContent>
                        <FieldLabel htmlFor="crawler">
                          {t("feed.feedCrawler")}
                        </FieldLabel>
                        <FieldDescription>
                          {t("feed.feedCrawlerDescription")}
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </CustomModal>
  );
}
