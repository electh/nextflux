import { db } from "@/db/database.js";
import {
  acknowledgeChanges,
  pendingFields,
} from "@/domain/articles/offlineChanges.js";

export async function queueArticleChanges(ids, changes) {
  await db.transaction("rw", db.articles, async () => {
    const articles = await db.articles.bulkGet(ids);
    if (articles.some((article) => !article))
      throw new Error("Article is not downloaded on this device");
    await db.articles.bulkPut(
      articles.map((article) => {
        const pendingChanges = { ...article.pendingChanges };
        for (const [field, value] of Object.entries(changes)) {
          pendingChanges[field] = { value, token: crypto.randomUUID() };
        }
        return { ...article, ...changes, pendingChanges };
      }),
    );
  });
  window.dispatchEvent(new Event("nextflux:outbox"));
}

export const getPendingArticles = () =>
  db.articles.filter((article) => pendingFields(article).length > 0).toArray();
export const getPendingCount = () =>
  db.articles.filter((article) => pendingFields(article).length > 0).count();

export async function acknowledgeArticleChanges(id, sent) {
  await db.transaction("rw", db.articles, async () => {
    const article = await db.articles.get(id);
    if (!article) return;
    await db.articles.update(id, {
      pendingChanges: acknowledgeChanges(article, sent),
    });
  });
}
