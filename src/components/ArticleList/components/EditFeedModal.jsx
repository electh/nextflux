import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Form } from "@base-ui/react/form";
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
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { categories, feeds } from "@/stores/feedsStore";
import { editFeedModalOpen, currentFeedId } from "@/stores/modalStore";
import { useParams } from "react-router-dom";
import minifluxAPI from "@/api/miniflux";
import { forceSync } from "@/stores/syncStore";
import { Check, Copy, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import CustomModal from "@/components/ui/CustomModal.jsx";
import { reportError } from "@/lib/errors.js";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
export default function EditFeedModal() {
  const { t } = useTranslation();
  const { feedId: routeFeedId } = useParams();
  const $feeds = useStore(feeds);
  const $categories = useStore(categories);
  const $editFeedModalOpen = useStore(editFeedModalOpen);
  const $currentFeedId = useStore(currentFeedId);
  // 优先使用 store 中的 feedId，如果没有则使用路由参数中的 feedId
  const feedId = $currentFeedId || routeFeedId;
  const [loading, setLoading] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    hide_globally: false,
    crawler: false,
    scraper_rules: "",
    keeplist_rules: "",
    blocklist_rules: "",
    rewrite_rules: "",
  });
  useEffect(() => {
    if (feedId) {
      const feed = $feeds.find((f) => f.id === parseInt(feedId));
      if (feed) {
        setFormData({
          title: feed.title,
          category_id: feed.categoryId,
          hide_globally: feed.hide_globally,
          crawler: feed.crawler,
          scraper_rules: feed.scraper_rules,
          keeplist_rules: feed.keeplist_rules,
          blocklist_rules: feed.blocklist_rules,
          rewrite_rules: feed.rewrite_rules,
        });
        setFeedUrl(feed.url);
      }
    }
  }, [feedId, $feeds]);
  const onClose = () => {
    editFeedModalOpen.set(false);
    currentFeedId.set(null); // 清除 store 中的 feedId
    if (feedId) {
      const feed = $feeds.find((f) => f.id === parseInt(feedId));
      if (feed) {
        setFormData({
          title: feed.title,
          category_id: feed.categoryId,
          hide_globally: feed.hide_globally,
          crawler: feed.crawler,
          scraper_rules: feed.scraper_rules,
          keeplist_rules: feed.keeplist_rules,
          blocklist_rules: feed.blocklist_rules,
          rewrite_rules: feed.rewrite_rules,
        });
        setFeedUrl(feed.url);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await minifluxAPI.updateFeed(feedId, formData);
      await forceSync(); // 重新加载订阅源列表以更新UI
      onClose();
    } catch (error) {
      reportError(error, "feed.update");
    } finally {
      setLoading(false);
    }
  };
  return (
    <CustomModal
      open={$editFeedModalOpen}
      onOpenChange={onClose}
      title={t("articleList.editFeed")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full">
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="edit-feed-form"
            disabled={loading}
            aria-busy={loading}
            className="w-full"
          >
            {loading && <Spinner />}
            {t("common.save")}
          </Button>
        </>
      }
    >
      <div className="w-full px-4 pb-4">
        <Form id="edit-feed-form" className="w-full" onSubmit={handleSubmit}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">{t("feed.feedTitle")}</FieldLabel>
                <Input
                  placeholder={t("feed.feedTitlePlaceholder")}
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      title: event.target.value,
                    })
                  }
                  required={true}
                  name="title"
                  id="title"
                />
                <FieldError>{t("feed.feedTitlePlaceholder")}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-category">
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
                  <SelectTrigger className="w-full" id="edit-category">
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
              <Field>
                <FieldLabel htmlFor="feedUrl">{t("feed.feedUrl")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    placeholder={feedUrl}
                    disabled
                    name="feedUrl"
                    id="feedUrl"
                  />
                  <InputGroupAddon className="pr-0.5" align="inline-end">
                    <Button
                      variant="ghost"
                      className="rounded-field"
                      onClick={() => {
                        navigator.clipboard.writeText(feedUrl);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 3000);
                      }}
                      disabled={isCopied}
                      size="icon-sm"
                    >
                      {isCopied ? (
                        <Check className="size-3 shrink-0 text-muted-foreground" />
                      ) : (
                        <Copy className="size-3 shrink-0 text-muted-foreground" />
                      )}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger
                  render={
                    <Button
                      variant="outline"
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
                    <Field orientation="horizontal">
                      <Checkbox
                        value="hide_globally"
                        checked={formData.hide_globally}
                        onCheckedChange={(value) =>
                          setFormData({
                            ...formData,
                            hide_globally: value,
                          })
                        }
                        id="hide_globally"
                      />
                      <FieldContent>
                        <FieldLabel htmlFor="hide_globally">
                          {t("feed.feedHide")}
                        </FieldLabel>
                        <FieldDescription>
                          {t("feed.feedHideDescription")}
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </FieldGroup>
          </FieldSet>
        </Form>
      </div>
    </CustomModal>
  );
}
