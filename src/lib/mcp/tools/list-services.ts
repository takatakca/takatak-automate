import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { services } from "@/lib/services";

export default defineTool({
  name: "list_services",
  title: "List TAKATAK services",
  description:
    "List all TAKATAK services (domains, hosting, websites, marketing, VoIP, etc.) with status, category, and public URL.",
  inputSchema: {
    category: z
      .enum(["infrastructure", "build", "growth", "communication", "marketplace"])
      .optional()
      .describe("Optional filter: only return services in this category."),
    status: z
      .enum(["live", "beta", "coming_soon"])
      .optional()
      .describe("Optional filter: only return services with this status."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, status }) => {
    const filtered = services.filter(
      (s) => (!category || s.category === category) && (!status || s.status === status),
    );
    const rows = filtered.map((s) => ({
      key: s.key,
      title: s.title,
      category: s.category,
      status: s.status,
      shortDescription: s.shortDescription,
      publicRoute: s.publicRoute,
      automationLevel: s.automationLevel,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { services: rows },
    };
  },
});