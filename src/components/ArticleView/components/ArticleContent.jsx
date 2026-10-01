import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { lazy, Suspense, useMemo } from "react";
import parse from "html-react-parser";
import { PhotoProvider } from "react-photo-view";
import { useTranslation } from "react-i18next";
import ArticleImage from "./ArticleImage.jsx";
import Attachments from "./Attachments.jsx";
import Iframe from "./Iframe.jsx";
import { imageGalleryActive } from "@/stores/articlesStore.js";
import { cn, getFontSizeClass, getHostname } from "@/lib/utils.js";
import {
  getCodeLanguage,
  hasImageContent,
  normalizeCode,
} from "@/domain/articles/articleHtml.js";
const CodeBlock = lazy(() => import("./CodeBlock.jsx"));
function renderLinkedImages(node) {
  const images = node.children.filter(
    (child) => child.type === "tag" && child.name === "img",
  );
  if (images.length === 0) return node;
  return (
    <>
      {images.map((image, index) => (
        <ArticleImage imgNode={image} key={image.attribs?.src || index} />
      ))}
      <div className="flex justify-center">
        <Badge className="cursor-pointer my-2" variant="secondary">
          <a
            href={node.attribs.href}
            className="border-none!"
            rel="noopener noreferrer"
            target="_blank"
          >
            {getHostname(node.attribs.href)}
          </a>
          <ArrowUpRight />
        </Badge>
      </div>
    </>
  );
}
function replaceArticleNode(node) {
  if (node.type !== "tag") return undefined;
  if (node.name === "img") return <ArticleImage imgNode={node} />;
  if (node.name === "a" && node.children.length > 0) {
    return renderLinkedImages(node);
  }
  if (node.name === "p" && hasImageContent(node)) {
    node.name = "div";
    return node;
  }
  if (node.name === "iframe") return <Iframe domNode={node} />;
  if (node.name !== "pre") return undefined;
  const codeNode = node.children.find(
    (child) => child.type === "tag" && child.name === "code",
  );
  const code = normalizeCode(codeNode || node);
  if (!code) return node;
  return (
    <Suspense
      fallback={
        <pre className="overflow-x-auto">
          <code>{code}</code>
        </pre>
      }
    >
      <CodeBlock
        code={code}
        language={codeNode ? getCodeLanguage(codeNode) : "text"}
      />
    </Suspense>
  );
}
export default function ArticleContent({
  article,
  alignJustify,
  fontSize,
  isStoneTheme,
  lineHeight,
}) {
  const { t } = useTranslation();
  const content = useMemo(
    () =>
      parse(article.content, {
        replace: replaceArticleNode,
      }),
    [article.content],
  );
  const audioEnclosure = article.enclosures?.find((enclosure) =>
    enclosure.mime_type?.startsWith("audio/"),
  );
  return (
    <>
      {audioEnclosure && (
        <audio controls className="w-full my-4" src={audioEnclosure.url}>
          {t("articleView.audioNotSupported")}
        </audio>
      )}
      <PhotoProvider
        bannerVisible
        onVisibleChange={(visible) => imageGalleryActive.set(visible)}
        maskOpacity={0.8}
        loop={false}
        speed={() => 300}
      >
        <div
          className={cn(
            "article-content prose dark:prose-invert max-w-none",
            "prose-pre:rounded-lg prose-pre:shadow-small",
            "prose-h1:text-[1.5em] prose-h2:text-[1.25em] prose-h3:text-[1.125em] prose-h4:text-[1em]",
            getFontSizeClass(fontSize),
            isStoneTheme && "prose-stone",
          )}
          style={{
            lineHeight: `${lineHeight}em`,
            textAlign: alignJustify ? "justify" : "left",
          }}
        >
          {content}
          <Attachments article={article} />
        </div>
      </PhotoProvider>
    </>
  );
}
