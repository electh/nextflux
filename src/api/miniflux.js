import * as categoryApi from "@/api/resources/categories.js";
import * as entryApi from "@/api/resources/entries.js";
import * as feedApi from "@/api/resources/feeds.js";
import * as integrationApi from "@/api/resources/integrations.js";
import * as enclosureApi from "@/api/resources/enclosures.js";

export * from "@/api/resources/categories.js";
export * from "@/api/resources/entries.js";
export * from "@/api/resources/feeds.js";
export * from "@/api/resources/integrations.js";
export * from "@/api/resources/enclosures.js";

const minifluxApi = {
  ...categoryApi,
  ...entryApi,
  ...feedApi,
  ...integrationApi,
  ...enclosureApi,
};

export default minifluxApi;
