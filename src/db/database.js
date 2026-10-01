import Dexie from "dexie";
import { reportError } from "@/lib/errors.js";

export const db = new Dexie("minifluxReader");

db.version(11).stores({
  articles:
    "id, feedId, status, starred, created_at, [status+feedId], [starred+feedId]",
  categories: "id, title",
  feeds: "id, url",
  feedIcons: "feedId",
});

db.version(12)
  .stores({
    articles:
      "id, feedId, status, starred, created_at, published_at, [status+feedId], [starred+feedId]",
    categories: "id, title",
    feeds: "id, url",
    feedIcons: "feedId",
  })
  .upgrade((transaction) =>
    transaction.table("articles").where("status").equals("removed").delete(),
  );

db.open().catch((error) => {
  reportError(error, "database.open");
  if (error.name === "VersionError" || error.name === "UpgradeError") {
    return db.delete().then(() => window.location.reload());
  }
  return undefined;
});
