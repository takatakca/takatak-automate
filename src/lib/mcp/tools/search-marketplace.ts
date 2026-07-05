import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  searchPackages,
  formatStartingPrice,
  shortestDelivery,
} from "@/lib/marketplacePackages";

export default defineTool({
  name: "search_marketplace",
  title: "Search TAKATAK marketplace",
  description:
    "Search TAKATAK marketplace packages (websites, logos, SEO, mobile apps, etc.) by keyword and optional category slug.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Search text (title, tags, category)."),
    category: z.string().trim().optional().describe("Optional category slug filter."),
    limit: z.number().int().min(1).max(25).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, category, limit }) => {
    const results = searchPackages(query, category).slice(0, limit).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: p.categoryName,
      startingPrice: formatStartingPrice(p),
      deliveryDays: shortestDelivery(p),
      rating: p.rating,
      reviews: p.reviews,
      blurb: p.blurb,
      url: `/marketplace/gigs/${p.id}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { results, count: results.length },
    };
  },
});