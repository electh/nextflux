import { settingsState } from "@/stores/settingsStore.js";

const getPlainText = (html) => {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.innerText.replace(/\s+/g, " ").trim();
  } catch {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
};

// 返回字符串 str 中可以安全 emit 的前缀长度：
// 末尾可能是 tag 的部分前缀，需要保留等待后续 chunk 确认
function safeEmitLength(str, tag) {
  for (let i = Math.min(tag.length - 1, str.length); i > 0; i--) {
    if (tag.startsWith(str.slice(str.length - i))) {
      return str.length - i;
    }
  }
  return str.length;
}

// 创建一个有状态的思考内容过滤器
// 过滤 <think>…</think> 标签（DeepSeek-R1、QwQ 等模型的推理过程）
// 同时忽略 reasoning_content 字段（DeepSeek 原生 API）
function createThinkFilter(onChunk) {
  let inThinking = false;
  let pending = "";

  return function push(delta) {
    pending += delta;

    while (pending) {
      if (inThinking) {
        const closeIdx = pending.indexOf("</think>");
        if (closeIdx >= 0) {
          inThinking = false;
          // 跳过 </think> 后紧跟的换行/空格，避免多余空行
          pending = pending.slice(closeIdx + 8).replace(/^\s+/, "");
        } else {
          // 保留末尾可能是 </think> 部分前缀的内容，其余丢弃
          pending = pending.slice(safeEmitLength(pending, "</think>"));
          break;
        }
      } else {
        const openIdx = pending.indexOf("<think>");
        if (openIdx >= 0) {
          if (openIdx > 0) onChunk(pending.slice(0, openIdx));
          inThinking = true;
          pending = pending.slice(openIdx + 7);
        } else {
          // 末尾可能是 <think> 的部分前缀，暂不 emit
          const safe = safeEmitLength(pending, "<think>");
          if (safe > 0) {
            onChunk(pending.slice(0, safe));
            pending = pending.slice(safe);
          }
          break;
        }
      }
    }
  };
}

export const summarizeArticleStream = async (article, { onChunk, onDone, onError }) => {
  const { aiApiKey, aiBaseUrl, aiModel, aiPrompt } = settingsState.get();

  if (!aiApiKey) {
    onError(new Error("AI API Key not configured"));
    return;
  }

  const plainText = getPlainText(article.content || "");
  const title = article.title || "";
  const baseUrl = aiBaseUrl.replace(/\/$/, "");

  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        stream: true,
        messages: [
          {
            role: "system",
            content: aiPrompt,
          },
          {
            role: "user",
            content: `Please summarize this article:\n\nTitle: ${title}\n\n${plainText.slice(0, 8000)}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });
  } catch (err) {
    onError(err);
    return;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    onError(new Error(error?.error?.message || `API error: ${response.status}`));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = "";
  const pushChunk = createThinkFilter(onChunk);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      sseBuffer += decoder.decode(value, { stream: true });
      const lines = sseBuffer.split("\n");
      sseBuffer = lines.pop(); // 保留最后一个不完整行

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          // 忽略 reasoning_content（DeepSeek 原生 API 的推理字段）
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) pushChunk(delta);
        } catch {
          // 跳过解析失败的行
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err);
  }
};
