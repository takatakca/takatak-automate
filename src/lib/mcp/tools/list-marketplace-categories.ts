import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PACKAGE_CATEGORIES_DISPLAY } from "@/lib/marketplacePackages";

export default defineTool({
  name: "list_marketplace_categories",
  title: "List marketplace categories",
  description:
    "List all TAKATAK marketplace categories (slug + display name) available for search filtering.",
  inputSchema: {} as Record<string, z.ZodTypeAny>,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      { type: "text", text: JSON.stringify(PACKAGE_CATEGORIES_DISPLAY, null, 2) },
    ],
    structuredContent: { categories: PACKAGE_CATEGORIES_DISPLAY },
  }),
});