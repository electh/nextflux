// Invalid or unavailable browser storage must not prevent the reader from opening.
export function createReadingLayoutStorage(getStorage) {
  return {
    getItem(key) {
      try {
        const value = getStorage().getItem(key);
        if (!value) return null;
        const layout = JSON.parse(value);
        if (
          !layout ||
          Array.isArray(layout) ||
          typeof layout !== "object" ||
          !Object.keys(layout).length ||
          !Object.values(layout).every(
            (size) => Number.isFinite(size) && size >= 0 && size <= 100,
          )
        ) {
          return null;
        }
        return value;
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        getStorage().setItem(key, value);
      } catch {
        // Resizing still works for this session when localStorage is unavailable.
      }
    },
  };
}

export const readingLayoutStorage = createReadingLayoutStorage(
  () => window.localStorage,
);
