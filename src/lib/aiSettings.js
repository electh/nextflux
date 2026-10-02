export function validateAiSetting(name, value) {
  const trimmedValue = typeof value === "string" ? value.trim() : "";
  if (!trimmedValue) return "required";
  if (name === "aiBaseUrl") {
    try {
      const url = new URL(trimmedValue);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        !url.hostname ||
        /\s/.test(trimmedValue)
      ) {
        return "invalidBaseUrl";
      }
    } catch {
      return "invalidBaseUrl";
    }
  }
  return null;
}
