// Very small Markdown -> HTML renderer supporting headings, paragraphs, lists, bold, italic, links, code blocks
export function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function markdownToHtml(input) {
  if (!input) return "";
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let i = 0;
  let inList = false;
  let listType = "ul";
  let inCode = false;
  let codeBuffer = [];

  const flushList = () => {
    if (inList) {
      html += `</${listType}>`;
      inList = false;
      listType = "ul";
    }
  };

  while (i < lines.length) {
    let line = lines[i];

    // fenced code block
    if (line.trim().startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
        i++;
        continue;
      } else {
        // end code
        html += `<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`;
        inCode = false;
        i++;
        continue;
      }
    }

    if (inCode) {
      codeBuffer.push(line);
      i++;
      continue;
    }

    // heading
    const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      flushList();
      const level = hMatch[1].length;
      html += `<h${level}>${inlineMarkdown(hMatch[2])}</h${level}>`;
      i++;
      continue;
    }

    // unordered list
    const ulMatch = line.match(/^\s*([-+*])\s+(.*)$/);
    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ulMatch || olMatch) {
      const thisType = ulMatch ? "ul" : "ol";
      if (!inList) {
        inList = true;
        listType = thisType;
        html += `<${listType}>`;
      } else if (listType !== thisType) {
        // close previous and start new
        html += `</${listType}><${thisType}>`;
        listType = thisType;
      }
      const content = inlineMarkdown((ulMatch || olMatch)[2]);
      html += `<li>${content}</li>`;
      i++;
      continue;
    }

    // blank line
    if (line.trim() === "") {
      flushList();
      html += ""; // paragraph breaks handled when encountering text
      i++;
      continue;
    }

    // paragraph (collect following non-empty non-list lines into one paragraph)
    flushList();
    let para = line;
    let j = i + 1;
    while (j < lines.length && lines[j].trim() !== "" && !lines[j].match(/^\s*([-+*]|\d+\.)\s+/) && !lines[j].match(/^(#{1,6})\s+/) && !lines[j].startsWith('```')) {
      para += " " + lines[j].trim();
      j++;
    }
    html += `<p>${inlineMarkdown(para)}</p>`;
    i = j;
  }

  // close any open list
  if (inList) html += `</${listType}>`;

  return html;
}

// inline formatting: bold **text**, italic *text*, links [text](url), code `inline`
export function inlineMarkdown(text) {
  if (!text) return "";
  let s = escapeHtml(text);
  // links
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, url) => {
    const u = escapeHtml(url);
  return `<a href="${u}" target="_blank" rel="noopener noreferrer">${inlineMarkdown(t)}</a>`;
  });
  // bold
  s = s.replace(/\*\*(.+?)\*\*/g, (m, p1) => `<strong>${inlineMarkdown(p1)}</strong>`);
  // italic
  s = s.replace(/\*(.+?)\*/g, (m, p1) => `<em>${inlineMarkdown(p1)}</em>`);
  // inline code
  s = s.replace(/`([^`]+)`/g, (m, code) => `<code>${escapeHtml(code)}</code>`);
  return s;
}
