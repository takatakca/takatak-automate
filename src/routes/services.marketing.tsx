import { createFileRoute } from "@tanstack/react-router";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getService } from "@/lib/services";

const service = getService("online_marketing")!;

export const Route = createFileRoute("/services/marketing")({
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
