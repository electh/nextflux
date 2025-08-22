import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function extractFirstImage(article) {
  if (!article?.content) return null;

  // 检查附件中的图片
  if (article.enclosures?.length > 0) {
    const imgEnclosure = article.enclosures.find((enclosure) =>
      enclosure.mime_type?.startsWith("image/"),
    );
    if (imgEnclosure?.url) {
      return imgEnclosure.url;
    }
  }

  // 如果附件中没有图片，则从内容中查找
  const div = document.createElement("div");
  div.innerHTML = article.content;

  const img = div.querySelector("img");
  return img ? img.src : null;
}

export function getFontSizeClass(fontSize) {
  // fontSize 参数单位为 px
  if (fontSize === 14) {
    return "prose-sm"; // 14px
  } else if (fontSize === 16) {
    // 16px is the default prose size; don't add an extra class so the base `prose` applies
    return "";
  } else if (fontSize === 18) {
    return "prose-lg"; // 18px
  } else if (fontSize === 20) {
    return "prose-xl"; // 20px
  } else {
    return "prose-2xl"; // 24px
  }
}

// 清理标题中的HTML标签
export function cleanTitle(title) {
  if (!title) return "";

  // 创建临时DOM元素
  const div = document.createElement("div");
  div.innerHTML = title;

  // 获取纯文本内容
  const cleanText = div.textContent || div.innerText || "";

  // 替换多余的空白字符
  return cleanText.replace(/\s+/g, " ").trim();
}

// 获取html文本内容
export function extractTextFromHtml(html) {
  if (!html) {
    return "";
  }

  return html
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/&nbsp;/g, " ") // Replace space entities
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(dec)) // Handle numeric HTML entities
    .replace(/&([a-z]+);/g, (_match, entity) => {
      // Handle named HTML entities
      const entities = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
      };
      return entities[entity] || "";
    })
    .trim();
}

// 获取链接的hostname
export function getHostname(href) {
  try {
    return new URL(href).hostname;
  } catch {
    return href;
  }
}
