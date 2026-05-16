import { createFileRoute } from "@tanstack/react-router";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getService } from "@/lib/services";

const service = getService("freelancer_marketplace")!;

export const Route = createFileRoute("/services/marketplace")({
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
