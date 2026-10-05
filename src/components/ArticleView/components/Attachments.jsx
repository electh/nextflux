import { Badge } from "@/components/ui/badge";
import ArticleImage from "./ArticleImage";
import { useTranslation } from "react-i18next";
export default function Attachments({ article }) {
  const { t } = useTranslation();

  // 检查是否有图片附件
  const imgEnclosures = article?.enclosures?.filter((enclosure) =>
    enclosure.mime_type?.startsWith("image/"),
  );

  // 定义黑名单域名列表
  const blacklist = ["youtube.com", "youtu.be", "glass.photo"];

  // 检查文章的URL是否在黑名单中
  const isBlacklisted = blacklist.some((domain) =>
    article?.feed?.url?.includes(domain),
  );
  if (isBlacklisted || !article?.enclosures) {
    return null;
  }
  if (imgEnclosures?.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2 rounded-xl shadow-custom bg-background p-5 mt-2">
      <div>
        <Badge variant="secondary">{t("articleView.attachments")}</Badge>
      </div>
      {imgEnclosures.map((enclosure) => (
        <ArticleImage
          key={enclosure.url}
          type="enclosure"
          imgNode={{
            attribs: {
              src: enclosure.url,
              alt: enclosure.title,
            },
          }}
        />
      ))}
    </div>
  );
}
