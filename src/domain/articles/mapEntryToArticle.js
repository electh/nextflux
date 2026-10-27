export function mapEntryToArticle(entry) {
  return {
    id: entry.id,
    feedId: entry.feed?.id ?? entry.feed_id,
    title: entry.title,
    author: entry.author,
    url: entry.url,
    commentsUrl: entry.comments_url || "",
    content: entry.content,
    status: entry.status,
    starred: entry.starred ? 1 : 0,
    published_at: entry.published_at,
    created_at: entry.created_at,
    reading_time: entry.reading_time,
    enclosures: entry.enclosures || [],
  };
}
