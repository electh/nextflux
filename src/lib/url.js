export function normalizeServerUrl(serverUrl) {
  return typeof serverUrl === "string"
    ? serverUrl.trim().replace(/\/+(?:v1\/*)?$/, "")
    : "";
}
