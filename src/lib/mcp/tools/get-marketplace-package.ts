import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getPackage } from "@/lib/marketplacePackages";

export default defineTool({
  name: "get_marketplace_package",
  title: "Get marketplace package",
  description:
    "Get full details for a single TAKATAK marketplace package (tiers, add-ons, FAQ, deliverables) by id or slug.",
  inputSchema: {
    id: z.string().trim().min(1).describe("Package id or slug."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const pkg = getPackage(id);
    if (!pkg) {
      return {
        content: [{ type: "text", text: `No package found for id "${id}".` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(pkg, null, 2) }],
      structuredContent: { package: pkg },
    };
  },
});