import { defineMcp } from "@lovable.dev/mcp-js";
import listServicesTool from "./tools/list-services";
import searchMarketplaceTool from "./tools/search-marketplace";
import getMarketplacePackageTool from "./tools/get-marketplace-package";
import listMarketplaceCategoriesTool from "./tools/list-marketplace-categories";

export default defineMcp({
  name: "takatak-mcp",
  title: "TAKATAK",
  version: "0.1.0",
  instructions:
    "TAKATAK read-only tools. Use `list_services` to discover TAKATAK services, `list_marketplace_categories` and `search_marketplace` to explore marketplace packages, and `get_marketplace_package` for full package details.",
  tools: [
    listServicesTool,
    listMarketplaceCategoriesTool,
    searchMarketplaceTool,
    getMarketplacePackageTool,
  ],
});