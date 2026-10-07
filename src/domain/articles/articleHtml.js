const BLOCK_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6"]);

export function hasImageContent(node) {
  if (!node.children) return false;

  return node.children.some((child) => {
    if (child.type !== "tag") return false;
    if (child.name === "img") return true;
    return child.name === "a" && hasImageContent(child);
  });
}

export function getNodeText(node) {
  if (!node) return "";
  if (node.type === "text") return node.data;
  if (node.type !== "tag") return "";
  if (node.name === "br") return "\n";

  const text = (node.children || []).map(getNodeText).join("");
  return BLOCK_TAGS.has(node.name) ? `${text}\n` : text;
}

export function normalizeCode(node) {
  return getNodeText(node)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
