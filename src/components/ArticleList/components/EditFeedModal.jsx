import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { categories, feeds } from "@/stores/feedsStore";
import { editFeedModalOpen } from "@/stores/modalStore";
import { useParams } from "react-router-dom";
import minifluxAPI from "@/api/miniflux";
import { forceSync } from "@/stores/syncStore";
import { MiniCloseButton } from "@/components/ui/MiniCloseButton.jsx";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EditFeedModal() {
  const { t } = useTranslation();
  const { feedId } = useParams();
  const $feeds = useStore(feeds);
  const $categories = useStore(categories);
  const $editFeedModalOpen = useStore(editFeedModalOpen);
  const [loading, setLoading] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    hide_globally: false,
    crawler: false,
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
        });
        setFeedUrl(feed.url);
      }
    }
  }, [feedId, $feeds]);

  const onClose = () => {
    editFeedModalOpen.set(false);
    const feed = $feeds.find((f) => f.id === parseInt(feedId));
    setFormData({
      title: feed.title,
      category_id: feed.categoryId,
      hide_globally: feed.hide_globally,
      crawler: feed.crawler,
    });
    setFeedUrl(feed.url);
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
    <Modal
      isOpen={$editFeedModalOpen}
      onClose={onClose}
      placement="center"
      radius="md"
      size="sm"
      hideCloseButton
      classNames={{
        header: "px-4 py-3 flex justify-between text-base font-medium",
        body: "px-4 py-1",
        footer: "px-4 py-4",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <div>{t("articleList.editFeed.title")}</div>
            <MiniCloseButton onClose={onClose} />
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                isRequired
                labelPlacement="outside"
                size="sm"
                label={t("articleList.editFeed.feedTitle")}
                variant="faded"
                name="title"
                placeholder={t("articleList.editFeed.feedTitlePlaceholder")}
                errorMessage={t("articleList.editFeed.feedTitleRequired")}
                value={formData.title}
                onValueChange={(value) =>
                  setFormData({ ...formData, title: value })
                }
              />
              <Select
                isRequired
                labelPlacement="outside"
                size="sm"
                label={t("articleList.editFeed.feedCategory")}
                variant="faded"
                name="category_id"
                placeholder={t("articleList.editFeed.feedCategoryPlaceholder")}
                errorMessage={t("articleList.editFeed.feedCategoryRequired")}
                selectedKeys={[formData.category_id?.toString()]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: parseInt(e.target.value),
                  })
                }
              >
                {$categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
              </Select>
              <div>
                <div className="text-xs ml-0.5 mb-1">
                  {t("articleList.editFeed.feedUrl")}
                </div>
                <div className="flex items-center gap-2 bg-content2 rounded-lg pl-3 pr-1 py-1 border-default-200 hover:border-default-400 border-2 shadow-sm transition-colors">
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="text-sm text-default-400 w-full truncate">
                      {feedUrl}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="!h-5"
                    isIconOnly
                    isDisabled={isCopied}
                    variant="flat"
                    startContent={
                      isCopied ? (
                        <Check className="size-3 shrink-0 text-default-500" />
                      ) : (
                        <Copy className="size-3 shrink-0 text-default-500" />
                      )
                    }
                    onPress={() => {
                      navigator.clipboard.writeText(feedUrl);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 3000);
                    }}
                  />
                </div>
              </div>
              <Checkbox
                name="crawler"
                size="sm"
                classNames={{
                  base: "w-full max-w-full p-0 mx-0 -mt-4  mb-1",
                  label: "mt-4",
                }}
                isSelected={formData.crawler}
                onValueChange={(value) =>
                  setFormData({ ...formData, crawler: value })
                }
              >
                <div className="line-clamp-1">
                  {t("articleList.editFeed.feedCrawler")}
                </div>
                <div className="text-xs text-default-400 line-clamp-1">
                  {t("articleList.editFeed.feedCrawlerDescription")}
                </div>
              </Checkbox>
              <Checkbox
                name="hide_globally"
                size="sm"
                classNames={{
                  base: "w-full max-w-full p-0 mx-0 -mt-4  mb-1",
                  label: "mt-4",
                }}
                isSelected={formData.hide_globally}
                onValueChange={(value) =>
                  setFormData({ ...formData, hide_globally: value })
                }
              >
                <div className="line-clamp-1">
                  {t("articleList.editFeed.feedHide")}
                </div>
                <div className="text-xs text-default-400 line-clamp-1">
                  {t("articleList.editFeed.feedHideDescription")}
                </div>
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={onClose} size="sm">
              {t("common.cancel")}
            </Button>
            <Button color="primary" type="submit" isLoading={loading} size="sm">
              {t("common.save")}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
