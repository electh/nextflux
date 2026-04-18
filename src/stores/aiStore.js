import { atom } from "nanostores";

// summary state per article id: { [articleId]: { loading, summary, error } }
export const aiSummaries = atom({});

export const setSummaryLoading = (articleId) => {
  aiSummaries.set({
    ...aiSummaries.get(),
    [articleId]: { loading: true, summary: "", error: null },
  });
};

export const appendSummaryChunk = (articleId, chunk) => {
  const current = aiSummaries.get();
  const prev = current[articleId];
  if (!prev) return;
  aiSummaries.set({
    ...current,
    [articleId]: { ...prev, summary: (prev.summary || "") + chunk },
  });
};

export const setSummaryDone = (articleId) => {
  const current = aiSummaries.get();
  const prev = current[articleId];
  if (!prev) return;
  aiSummaries.set({
    ...current,
    [articleId]: { ...prev, loading: false },
  });
};

export const setSummaryError = (articleId, error) => {
  aiSummaries.set({
    ...aiSummaries.get(),
    [articleId]: { loading: false, summary: null, error },
  });
};

export const clearSummary = (articleId) => {
  const current = { ...aiSummaries.get() };
  delete current[articleId];
  aiSummaries.set(current);
};
