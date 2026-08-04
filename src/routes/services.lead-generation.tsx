import { createFileRoute } from "@tanstack/react-router";
import { ServiceProductPage } from "@/components/services/ServiceProductPage";
import { getServicePage } from "@/lib/servicePages";

export const Route = createFileRoute("/services/lead-generation")({
  head: () => {
    const page = getServicePage("lead-generation")!;
    return {
    meta: [
      { title: `${page.title.en} — TAKATAK` },
      { name: "description", content: page.tagline.en },
      { property: "og:title", content: `${page.title.en} — TAKATAK` },
      { property: "og:description", content: page.tagline.en },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    };
  },
  component: () => <ServiceProductPage page={getServicePage("lead-generation")!} />,
});
