import { createFileRoute } from "@tanstack/react-router";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getService } from "@/lib/services";

const service = getService("voip_phone")!;

export const Route = createFileRoute("/services/voip")({
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
