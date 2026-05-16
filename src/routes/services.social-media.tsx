import { createFileRoute } from "@tanstack/react-router";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getService } from "@/lib/services";

const service = getService("social_media")!;

export const Route = createFileRoute("/services/social-media")({
  head: () => ({
    meta: [
      { title: `${service.title} — TAKATAK` },
      { name: "description", content: service.shortDescription },
      { property: "og:title", content: `${service.title} — TAKATAK` },
      { property: "og:description", content: service.shortDescription },
    ],
  }),
  component: () => <ServicePageTemplate service={service} />,
});
