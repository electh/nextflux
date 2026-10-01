export function mapRemoteFeed(feed) {
  return {
    id: feed.id,
    title: feed.title,
    url: feed.feed_url,
    site_url: feed.site_url,
    crawler: feed.crawler,
    hide_globally: Boolean(feed.hide_globally || feed.category?.hide_globally),
    categoryId: feed.category?.id,
    parsing_error_count: feed.parsing_error_count,
    scraper_rules: feed.scraper_rules,
    keeplist_rules: feed.keeplist_rules,
    blocklist_rules: feed.blocklist_rules,
    rewrite_rules: feed.rewrite_rules,
  };
}

export function getIncrementalSyncStart(lastSyncTime, overlapSeconds = 2) {
  return new Date(new Date(lastSyncTime).getTime() - overlapSeconds * 1000);
}
