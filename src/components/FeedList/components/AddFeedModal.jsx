import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  Input,
  Link,
  ScrollShadow,
  Select,
  SelectItem,
  Textarea,
  Divider,
} from "@heroui/react";
import { toast } from "sonner";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { categories } from "@/stores/feedsStore";
import { addFeedModalOpen } from "@/stores/modalStore";
import minifluxAPI from "@/api/miniflux";
import { forceSync } from "@/stores/syncStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Search, Rss, Loader2 } from "lucide-react";
import GlassYellow from "@/assets/glass-yellow.svg";
import {
  SiYoutube,
  SiReddit,
  SiMastodon,
} from "@icons-pack/react-simple-icons";
import CustomModal from "@/components/ui/CustomModal.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Podcast } from "lucide-react";
import ResultListbox from "./ResultListbox";
export default function AddFeedModal() {
  const { t } = useTranslation();
  const $categories = useStore(categories);
  const $addFeedModalOpen = useStore(addFeedModalOpen);
  const [loading, setLoading] = useState(false); // 调用添加接口加载状态
  const [results, setResults] = useState([]); // 搜索结果
  const [searchType, setSearchType] = useState("feed"); // 搜索类型
  const [searchQuery, setSearchQuery] = useState(""); // 搜索关键字
  const [searching, setSearching] = useState(false); // 调用搜索接口加载状态
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    feed_url: "",
    category_id: "",
    crawler: false,
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
          keeplist_rules: formData.keeplist_rules,
          blocklist_rules: formData.blocklist_rules,
          rewrite_rules: formData.rewrite_rules,
        },
      );
      await forceSync(); // 重新加载订阅源列表以更新UI
      onClose();
      // 导航到新增的订阅源
      console.log(response);
      navigate(`/feed/${response.feed_id}`);
    } catch (error) {
      console.error("添加订阅源失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      open={$addFeedModalOpen}
      onOpenChange={onClose}
      title={t("sidebar.addFeed")}
    >
      <ScrollShadow size={10} className="w-full overflow-y-auto px-4 pb-4">
        <AnimatePresence initial={false} mode="wait">
          {!formData.feed_url || formData.feed_url === "" ? (
            <motion.div
              key="discover"
              className="flex flex-col gap-2"
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            >
              <Select
                isRequired
                label={t("feed.feedType")}
                labelPlacement="outside"
                size="sm"
                variant="faded"
                placeholder={t("feed.feedTypePlaceholder")}
                disallowEmptySelection
                selectedKeys={[searchType]}
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setSearchQuery("");
                  setResults([]);
                }}
              >
                {supportedTypes.map((type) => (
                  <SelectItem
                    key={type.id}
                    value={type.id}
                    variant="flat"
                    startContent={type.icon}
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
              <Input
                isRequired
                label={t("feed.searchQuery")}
                labelPlacement="outside"
                size="sm"
                variant="faded"
                placeholder={
                  supportedTypes.find((type) => type.id === searchType)
                    .placeholder
                }
                value={searchQuery}
                onValueChange={(value) => {
                  setSearchQuery(value);
                  setResults([]);
                }}
                classNames={{ inputWrapper: "pr-1!", helperWrapper: "hidden!" }}
              />
              <Button
                size="sm"
                color="primary"
                className="border-primary border shadow-custom-button bg-primary bg-linear-to-b from-white/15 to-transparent text-sm mt-1"
                isDisabled={
                  searchQuery === "" || searchType === "" || searching
                }
                onPress={handleSearch}
                startContent={
                  searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )
                }
              >
                {t("common.search")}
              </Button>
              <Divider className="my-1" />
              <ResultListbox
                results={results}
                searchType={searchType}
                handleSelect={handleSelect}
              />
            </motion.div>
          ) : (
            <motion.form
              key="submit"
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-4"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            >
              <Input
                isRequired
                labelPlacement="outside"
                size="sm"
                label={t("feed.feedUrl")}
                variant="faded"
                isDisabled
                name="feed_url"
                placeholder={t("feed.feedUrlPlaceholder")}
                errorMessage={t("feed.feedUrlRequired")}
                value={formData.feed_url}
                onValueChange={(value) =>
                  setFormData({ ...formData, feed_url: value })
                }
              />
              <Select
                isRequired
                labelPlacement="outside"
                size="sm"
                label={t("feed.feedCategory")}
                variant="faded"
                name="category_id"
                placeholder={t("feed.feedCategoryPlaceholder")}
                selectedKeys={[formData.category_id?.toString()]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: parseInt(e.target.value),
                  })
                }
              >
                {$categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    variant="flat"
                  >
                    {category.title}
                  </SelectItem>
                ))}
              </Select>
              <Checkbox
                name="crawler"
                size="sm"
                classNames={{
                  base: "w-full max-w-full p-0 mx-0 -mt-4 mb-1",
                  label: "mt-4",
                }}
                isSelected={formData.crawler}
                onValueChange={(value) =>
                  setFormData({ ...formData, crawler: value })
                }
              >
                <div className="line-clamp-1">{t("feed.feedCrawler")}</div>
                <div className="text-xs text-default-400 line-clamp-1">
                  {t("feed.feedCrawlerDescription")}
                </div>
              </Checkbox>
              <Accordion
                isCompact
                hideIndicator
                className="p-0"
                itemClasses={{
                  base: "p-0",
                  trigger: "p-0 gap-1 cursor-pointer group",
                  title: "text-default-500 text-sm",
                  content: "flex flex-col gap-4 pt-4 pb-0",
                }}
              >
                <AccordionItem
                  key="advanced"
                  aria-label="advanced"
                  startContent={
                    <>
                      <Plus className="size-4 text-default-500 group-data-[open=true]:hidden" />
                      <Minus className="size-4 text-default-500 hidden group-data-[open=true]:block" />
                    </>
                  }
                  title={t("feed.advancedOptions")}
                >
                  <Input
                    labelPlacement="outside"
                    size="sm"
                    label={
                      <Link
                        isExternal
                        showAnchorIcon
                        color="foreground"
                        href="https://miniflux.app/docs/rules.html#feed-filtering-rules"
                        className="text-xs"
                      >
                        {t("feed.feedKeeplistRules")}
                      </Link>
                    }
                    variant="faded"
                    name="keeplist_rules"
                    placeholder={t("feed.feedKeeplistRulesPlaceholder")}
                    value={formData.keeplist_rules}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        keeplist_rules: value,
                      })
                    }
                  />
                  <Input
                    labelPlacement="outside"
                    size="sm"
                    label={
                      <Link
                        isExternal
                        showAnchorIcon
                        color="foreground"
                        href="https://miniflux.app/docs/rules.html#feed-filtering-rules"
                        className="text-xs"
                      >
                        {t("feed.feedBlocklistRules")}
                      </Link>
                    }
                    variant="faded"
                    name="blocklist_rules"
                    placeholder={t("feed.feedBlocklistRulesPlaceholder")}
                    value={formData.blocklist_rules}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        blocklist_rules: value,
                      })
                    }
                  />
                  <Textarea
                    labelPlacement="outside"
                    size="sm"
                    label={
                      <Link
                        isExternal
                        showAnchorIcon
                        color="foreground"
                        href="https://miniflux.app/docs/rules.html#rewrite-rules"
                        className="text-xs"
                      >
                        {t("feed.feedRewriteRules")}
                      </Link>
                    }
                    isClearable
                    variant="faded"
                    name="rewrite_rules"
                    placeholder={t("feed.feedRewriteRulesPlaceholder")}
                    value={formData.rewrite_rules}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rewrite_rules: value })
                    }
                  />
                </AccordionItem>
              </Accordion>
              <div className="flex flex-col md:flex-row-reverse gap-2">
                <Button
                  color="primary"
                  fullWidth
                  type="submit"
                  isLoading={loading}
                  size="sm"
                  className="border-primary border shadow-custom-button bg-primary bg-linear-to-b from-white/15 to-transparent text-sm"
                >
                  {t("common.save")}
                </Button>
                <Button
                  fullWidth
                  onPress={() => {
                    setFormData({
                      feed_url: "",
                      category_id: "",
                      crawler: false,
                      keeplist_rules: "",
                      blocklist_rules: "",
                      rewrite_rules: "",
                    });
                  }}
                  size="sm"
                  variant="flat"
                  className="border text-sm"
                >
                  {t("common.back")}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </ScrollShadow>
    </CustomModal>
  );
}
