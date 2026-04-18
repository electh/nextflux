import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@nanostores/react";
import { PhotoProvider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import "./ArticleView.css";
import ActionButtons from "@/components/ArticleView/components/ActionButtons.jsx";
import { generateReadableDate } from "@/lib/format.js";
import {
  activeArticle,
  filteredArticles,
  imageGalleryActive,
} from "@/stores/articlesStore.js";
import { Chip, Separator, ScrollShadow, Link } from "@heroui/react";
import EmptyPlaceholder from "@/components/ArticleList/components/EmptyPlaceholder";
import { cleanTitle, getFontSizeClass } from "@/lib/utils";
import ArticleImage from "@/components/ArticleView/components/ArticleImage.jsx";
import parse from "html-react-parser";
import { settingsState } from "@/stores/settingsStore";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { currentThemeMode, themeState } from "@/stores/themeStore.js";
import CodeBlock from "@/components/ArticleView/components/CodeBlock.jsx";
import { useTranslation } from "react-i18next";
import { cn, getHostname } from "@/lib/utils.js";
import FeedIcon from "@/components/ui/FeedIcon.jsx";
import { getArticleById } from "@/db/storage";
import Attachments from "@/components/ArticleView/components/Attachments.jsx";
import AISummary from "@/components/ArticleView/components/AISummary.jsx";

const ArticleView = () => {
  const { t } = useTranslation();
  const { articleId } = useParams();
  const [error, setError] = useState(null);
  const $activeArticle = useStore(activeArticle);
  const $filteredArticles = useStore(filteredArticles);
  const {
    lineHeight,
    fontSize,
    maxWidth,
    alignJustify,
    fontFamily,
    titleFontSize,
    titleAlignType,
    reduceMotion,
    floatingSidebar,
  } = useStore(settingsState);
  const { lightTheme } = useStore(themeState);
  const $currentThemeMode = useStore(currentThemeMode);
  const scrollAreaRef = useRef(null);
  // 判断当前是否实际使用了stone主题
  const isStoneTheme = () => {
    return lightTheme === "stone" && $currentThemeMode === "light";
  };

  // 监听文章ID变化,滚动到顶部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current;
      if (viewport) {
        setTimeout(
          () => {
            viewport.scrollTo({
              top: 0,
              behavior: "instant", // 使用 instant 避免与动画冲突
            });
          },
          reduceMotion ? 1 : 300,
        );
      }
    }
  }, [articleId, reduceMotion]);

  useEffect(() => {
    const loadArticleByArticleId = async () => {
      if (!articleId) {
        activeArticle.set(null);
        return;
      }

      if (articleId) {
        setError(null);
        try {
          const loadedArticle = await getArticleById(articleId);
          if (loadedArticle) {
            // 保存原始内容
            loadedArticle.originalContent = loadedArticle.content;
            activeArticle.set(loadedArticle);
          } else {
            setError("请选择要阅读的文章");
          }
        } catch (err) {
          console.error("加载文章失败:", err);
          setError(err.message);
        }
      }
    };

    loadArticleByArticleId();
  }, [articleId, $filteredArticles]);

  const handleLinkWithImg = (domNode) => {
    const imgNodes = domNode.children.filter(
      (child) => child.type === "tag" && child.name === "img",
    );

    if (imgNodes.length > 0) {
      const hostname = getHostname(domNode.attribs.href);
      return (
        <>
          {imgNodes.map((imgNode, index) => (
            <ArticleImage
              imgNode={imgNode}
              key={imgNode.attribs?.src || index}
            />
          ))}
          <div className="flex justify-center">
            <Chip color="accent" variant="soft" className="cursor-pointer my-2">
              <a
                href={domNode.attribs.href}
                className="border-none!"
                rel="noopener noreferrer"
                target="_blank"
              >
                {hostname}
              </a>
              <Link.Icon />
            </Chip>
          </div>
        </>
      );
    }
    return domNode;
  };

  // 检查是否有音频附件
  const audioEnclosure = $activeArticle?.enclosures?.find((enclosure) =>
    enclosure.mime_type?.startsWith("audio/"),
  );

  const navigate = useNavigate();

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={articleId ? "content" : "empty"}
          className={cn(
            "flex-1 p-0 h-screen fixed md:static inset-0 z-20",
            !articleId ? "hidden md:flex md:flex-1" : "",
            floatingSidebar ? "" : "md:pr-2 md:py-2",
          )}
          initial={
            articleId ? { opacity: 1, x: 40 } : { opacity: 0, x: 0, scale: 0.8 }
          }
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={
            articleId
              ? { opacity: 0, x: 40, scale: 1 }
              : { opacity: 0, x: 0, scale: 0.8 }
          }
          transition={{
            duration: 0.5,
            type: "spring",
            bounce: 0,
            ease: "easeInOut",
          }}
        >
          {!$activeArticle || error ? (
            <EmptyPlaceholder />
          ) : (
            <ScrollShadow
              ref={scrollAreaRef}
              isEnabled={false}
              className={cn(
                "article-scroll-area h-full bg-background md:bg-transparent relative",
                floatingSidebar
                  ? "md:bg-transparent"
                  : "md:bg-overlay md:shadow-custom md:rounded-2xl",
              )}
            >
              <ActionButtons />

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={articleId}
                  initial={reduceMotion ? {} : { y: 50, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    transition: {
                      opacity: { delay: 0.05 },
                    },
                  }}
                  exit={reduceMotion ? {} : { y: -50, opacity: 0 }}
                  transition={{ bounce: 0, ease: "easeInOut" }}
                  className="article-view-content px-5 pt-5 pb-20 w-full mx-auto"
                  style={{
                    maxWidth: `${maxWidth}ch`,
                    fontFamily: fontFamily,
                  }}
                >
                  <header
                    className="article-header"
                    style={{ textAlign: titleAlignType }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/feed/${$activeArticle?.feed?.id}`)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          navigate(`/feed/${$activeArticle?.feed?.id}`);
                      }}
                      className={cn(
                        "text-muted text-sm flex items-center gap-1 hover:cursor-pointer focus:outline-none",
                        titleAlignType === "center" ? "justify-center" : "",
                      )}
                    >
                      <FeedIcon feedId={$activeArticle?.feed?.id} />
                      {$activeArticle?.feed?.title}
                    </button>
                    <h1
                      className="article-title font-semibold my-2 hover:cursor-pointer leading-tight"
                      style={{
                        fontSize: `${titleFontSize * fontSize}px`,
                      }}
                    >
                      <a
                        href={$activeArticle?.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {cleanTitle($activeArticle?.title)}
                      </a>
                    </h1>
                    <div className="text-muted opacity-60 text-sm">
                      <time
                        dateTime={$activeArticle?.published_at}
                        key={t.language}
                      >
                        {generateReadableDate($activeArticle?.published_at)}
                      </time>
                    </div>
                  </header>
                  <Separator className="my-4" />
                  <AISummary articleId={$activeArticle?.id} />
                  {audioEnclosure && (
                    <audio
                      controls
                      className="w-full my-4"
                      src={audioEnclosure.url}
                    >
                      {t("articleView.audioNotSupported")}
                    </audio>
                  )}
                  <PhotoProvider
                    bannerVisible={true}
                    onVisibleChange={(visible) =>
                      imageGalleryActive.set(visible)
                    }
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
                        isStoneTheme() ? "prose-stone" : "",
                      )}
                      style={{
                        lineHeight: lineHeight + "em",
                        textAlign: alignJustify ? "justify" : "left",
                      }}
                    >
                      {parse($activeArticle?.content, {
                        replace(domNode) {
                          if (
                            domNode.type === "tag" &&
                            domNode.name === "img"
                          ) {
                            return <ArticleImage imgNode={domNode} />;
                          }
                          if (domNode.type === "tag" && domNode.name === "a") {
                            return domNode.children.length > 0
                              ? handleLinkWithImg(domNode)
                              : domNode;
                          }
                          if (
                            domNode.type === "tag" &&
                            domNode.name === "iframe"
                          ) {
                            const { src } = domNode.attribs;
                            domNode.attribs = {
                              ...domNode.attribs,
                              referrerpolicy: "strict-origin-when-cross-origin",
                            };

                            // 判断是否为 Bilibili iframe
                            const isBilibili = src && src.includes("bilibili");

                            // 如果不是 YouTube iframe,直接返回原始节点
                            if (!isBilibili) {
                              return domNode;
                            }

                            // 如果是 Bilibili iframe, 组装新的iframe
                            if (isBilibili) {
                              // 获取bilibili视频 bvid
                              const bvid = src.match(/bvid=([^&]+)/)?.[1];
                              if (bvid) {
                                return (
                                  <iframe
                                    src={`//bilibili.com/blackboard/html5mobileplayer.html?isOutside=true&bvid=${bvid}&p=1&hideCoverInfo=1&danmaku=0`}
                                    allowFullScreen={true}
                                  ></iframe>
                                );
                              }
                              return domNode;
                            }
                          }
                          if (
                            domNode.type === "tag" &&
                            domNode.name === "pre"
                          ) {
                            // 1. 首先检查是否有code子节点
                            const codeNode = domNode.children.find(
                              (child) =>
                                child.type === "tag" && child.name === "code",
                            );

                            // 递归获取所有文本内容的辅助函数
                            const getTextContent = (node) => {
                              if (!node) return "";
                              if (node.type === "text") return node.data;
                              if (node.type === "tag") {
                                if (node.name === "br") return "\n";
                                // 处理其他标签内的文本
                                const childText = node.children
                                  .map((child) => getTextContent(child))
                                  .join("");
                                // 对于块级元素,在前后添加换行
                                if (
                                  [
                                    "p",
                                    "div",
                                    "h1",
                                    "h2",
                                    "h3",
                                    "h4",
                                    "h5",
                                    "h6",
                                  ].includes(node.name)
                                ) {
                                  return `${childText}\n`;
                                }
                                return childText;
                              }
                              return "";
                            };

                            if (codeNode) {
                              // 2. 处理带有code标签的情况
                              const className = codeNode.attribs?.class || "";
                              const language =
                                className
                                  .split(/\s+/)
                                  .find(
                                    (cls) =>
                                      cls.startsWith("language-") ||
                                      cls.startsWith("lang-"),
                                  )
                                  ?.replace(/^(language-|lang-)/, "") || "text";

                              const code = getTextContent(codeNode)
                                .replace(/\n{3,}/g, "\n\n") // 将连续3个及以上换行替换为2个
                                .trim();

                              return code ? (
                                <CodeBlock code={code} language={language} />
                              ) : (
                                domNode
                              );
                            } else {
                              // 3. 处理直接在pre标签中的文本
                              const code = getTextContent(domNode)
                                .replace(/\n{3,}/g, "\n\n")
                                .trim();

                              // 如果内容为空则不处理
                              if (!code) {
                                return domNode;
                              }

                              return <CodeBlock code={code} language="text" />;
                            }
                          }
                        },
                      })}
                      <Attachments article={$activeArticle} />
                    </div>
                  </PhotoProvider>
                </motion.div>
              </AnimatePresence>
            </ScrollShadow>
          )}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
};

export default ArticleView;
