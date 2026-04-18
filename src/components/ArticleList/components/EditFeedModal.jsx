import {
  Button,
  Checkbox,
  Input,
  Link,
  Select,
  Label,
  ListBox,
  TextArea,
  Form,
  Fieldset,
  Description,
  FieldGroup,
  TextField,
  FieldError,
  Spinner,
  InputGroup,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { categories, feeds } from "@/stores/feedsStore";
import { editFeedModalOpen, currentFeedId } from "@/stores/modalStore";
import { useParams } from "react-router-dom";
import minifluxAPI from "@/api/miniflux";
import { forceSync } from "@/stores/syncStore";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import CustomModal from "@/components/ui/CustomModal.jsx";

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
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    hide_globally: false,
    crawler: false,
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
      console.error("更新订阅源失败:", error);
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
          <Button variant="tertiary" onPress={onClose} fullWidth>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="edit-feed-form"
            isPending={loading}
            fullWidth
          >
            {loading && <Spinner color="current" size="sm" />}
            {t("common.save")}
          </Button>
        </>
      }
    >
      <div className="w-full px-4 pb-4">
        <Form id="edit-feed-form" className="w-full" onSubmit={handleSubmit}>
          <Fieldset>
            <FieldGroup>
              <TextField isRequired name="title" variant="secondary">
                <Label>{t("feed.feedTitle")}</Label>
                <Input
                  placeholder={t("feed.feedTitlePlaceholder")}
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({ ...formData, title: event.target.value })
                  }
                />
                <FieldError>{t("feed.feedTitlePlaceholder")}</FieldError>
              </TextField>
              <Select
                isRequired
                variant="secondary"
                placeholder={t("feed.feedCategoryPlaceholder")}
                value={
                  formData.category_id === "" ? null : formData.category_id
                }
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
              <TextField fullWidth variant="secondary" name="feedUrl">
                <Label>{t("feed.feedUrl")}</Label>
                <InputGroup>
                  <InputGroup.Input placeholder={feedUrl} disabled />
                  <InputGroup.Suffix className="pr-0.5">
                    <Button
                      size="sm"
                      isIconOnly
                      isDisabled={isCopied}
                      variant="ghost"
                      onPress={() => {
                        navigator.clipboard.writeText(feedUrl);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 3000);
                      }}
                    >
                      {isCopied ? (
                        <Check className="size-3 shrink-0 text-muted" />
                      ) : (
                        <Copy className="size-3 shrink-0 text-muted" />
                      )}
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
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
              <Checkbox
                value="hide_globally"
                variant="secondary"
                isSelected={formData.hide_globally}
                onChange={(value) =>
                  setFormData({ ...formData, hide_globally: value })
                }
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  <Label>{t("feed.feedHide")}</Label>
                  <Description>{t("feed.feedHideDescription")}</Description>
                </Checkbox.Content>
              </Checkbox>
            </FieldGroup>
          </Fieldset>
        </Form>
      </div>
    </CustomModal>
  );
}
