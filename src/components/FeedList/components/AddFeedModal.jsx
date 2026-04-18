import {
  Button,
  Checkbox,
  Input,
  Link,
  ScrollShadow,
  Select,
  Label,
  ListBox,
  ListBoxItem,
  TextArea,
  TextField,
  FieldError,
  Description,
  Spinner,
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
import { Search, Rss, Loader2 } from "lucide-react";
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

  const isDiscoverMode = !formData.feed_url || formData.feed_url === "";

  return (
    <CustomModal
      open={$addFeedModalOpen}
      onOpenChange={onClose}
      title={t("sidebar.addFeed")}
      footer={
        isDiscoverMode ? (
          <Button
            fullWidth
            isDisabled={searchQuery === "" || searchType === "" || searching}
            onPress={handleSearch}
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {t("common.search")}
          </Button>
        ) : (
          <div className="flex gap-2 w-full">
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
              variant="tertiary"
            >
              {t("common.back")}
            </Button>
            <Button
              type="submit"
              form="add-feed-form"
              isPending={loading}
              fullWidth
            >
              {loading && <Spinner color="current" size="sm" />}
              {t("common.save")}
            </Button>
          </div>
        )
      }
    >
      <ScrollShadow size={10} className="w-full overflow-y-auto px-4 pb-4">
        <AnimatePresence initial={false} mode="wait">
          {!formData.feed_url || formData.feed_url === "" ? (
            <motion.div
              key="discover"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            >
              <Select
                isRequired
                variant="secondary"
                placeholder={t("feed.feedTypePlaceholder")}
                value={searchType}
                onChange={(value) => {
                  setSearchType(value);
                  setSearchQuery("");
                  setResults([]);
                }}
              >
                <Label>{t("feed.feedType")}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {supportedTypes.map((type) => (
                      <ListBoxItem
                        key={type.id}
                        id={type.id}
                        textValue={type.label}
                      >
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <TextField isRequired variant="secondary">
                <Label>{t("feed.searchQuery")}</Label>
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
                />
              </TextField>
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
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            >
              <TextField isRequired name="feed_url" variant="secondary">
                <Label>{t("feed.feedUrl")}</Label>
                <Input
                  placeholder={t("feed.feedUrlPlaceholder")}
                  value={formData.feed_url}
                  onChange={(event) =>
                    setFormData({ ...formData, feed_url: event.target.value })
                  }
                />
                <FieldError>{t("feed.feedUrlRequired")}</FieldError>
              </TextField>
              <Select
                isRequired
                variant="secondary"
                placeholder={t("feed.feedCategoryPlaceholder")}
                value={formData.category_id ?? null}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    category_id: value == null ? "" : Number(value),
                  })
                }
              >
                <Label>{t("feed.feedCategory")}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {$categories.map((category) => (
                      <ListBox.Item
                        key={category.id}
                        id={category.id}
                        textValue={category.title}
                      >
                        {category.title}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <TextField name="keeplist_rules" variant="secondary">
                <Label>
                  {
                    <Link
                      className="no-underline hover:underline"
                      href="https://miniflux.app/docs/rules.html#feed-filtering-rules"
                      target="_blank"
                    >
                      {t("feed.feedKeeplistRules")}
                      <Link.Icon />
                    </Link>
                  }
                </Label>
                <Input
                  placeholder={t("feed.feedKeeplistRulesPlaceholder")}
                  value={formData.keeplist_rules}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      keeplist_rules: event.target.value,
                    })
                  }
                />
              </TextField>
              <TextField name="blocklist_rules" variant="secondary">
                <Label>
                  {
                    <Link
                      className="no-underline hover:underline"
                      href="https://miniflux.app/docs/rules.html#feed-filtering-rules"
                      target="_blank"
                    >
                      {t("feed.feedBlocklistRules")}
                      <Link.Icon />
                    </Link>
                  }
                </Label>
                <Input
                  placeholder={t("feed.feedBlocklistRulesPlaceholder")}
                  value={formData.blocklist_rules}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      blocklist_rules: event.target.value,
                    })
                  }
                />
              </TextField>
              <TextField name="rewrite_rules" variant="secondary">
                <Label>
                  {
                    <Link
                      className="no-underline hover:underline"
                      href="https://miniflux.app/docs/rules.html#rewrite-rules"
                      target="_blank"
                    >
                      {t("feed.feedRewriteRules")}
                      <Link.Icon />
                    </Link>
                  }
                </Label>
                <TextArea
                  placeholder={t("feed.feedRewriteRulesPlaceholder")}
                  value={formData.rewrite_rules}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      rewrite_rules: event.target.value,
                    })
                  }
                />
              </TextField>
              <Checkbox
                value="crawler"
                variant="secondary"
                isSelected={formData.crawler}
                onChange={(value) =>
                  setFormData({ ...formData, crawler: value })
                }
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  <Label>{t("feed.feedCrawler")}</Label>
                  <Description>{t("feed.feedCrawlerDescription")}</Description>
                </Checkbox.Content>
              </Checkbox>
            </motion.form>
          )}
        </AnimatePresence>
      </ScrollShadow>
    </CustomModal>
  );
}
