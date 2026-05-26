import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ query: z.string().min(1).max(2000) });

export interface AdvisorRecommendation {
  title: string;
  reason: string;
  cta: { label: string; to: string };
}

export interface AdvisorResult {
  source: "backend" | "fallback";
  summary: string;
  recommendations: AdvisorRecommendation[];
}

export const aiServiceAdvisor = createServerFn({ method: "POST" })
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }): Promise<AdvisorResult> => {
    const baseUrl = process.env.RENDER_API_BASE_URL ?? "https://takatak.onrender.com";
    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/ai/service-advisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: data.query }),
      });
      if (res.ok) {
        const json = (await res.json()) as Partial<AdvisorResult>;
        if (json && Array.isArray(json.recommendations)) {
          return {
            source: "backend",
            summary: json.summary ?? "Here are the TAKATAK services that match your needs.",
            recommendations: json.recommendations,
          };
        }
      }
    } catch (e) {
      console.error("[aiServiceAdvisor] backend error", e);
    }

    const q = data.query.toLowerCase();
    const recs: AdvisorRecommendation[] = [];
    const push = (r: AdvisorRecommendation) => { if (recs.length < 4) recs.push(r); };
    if (/(domain|\.com|\.ca|name)/.test(q))
      push({ title: "Register a domain", reason: "Your query mentions a domain name.", cta: { label: "Search domains", to: "/domain" } });
    if (/(host|server|wordpress|cpanel)/.test(q))
      push({ title: "Web hosting", reason: "You'll need managed hosting to run your site.", cta: { label: "View plans", to: "/hosting" } });
    if (/(website|site|web|landing)/.test(q))
      push({ title: "Website creation", reason: "TAKATAK can build your site end-to-end.", cta: { label: "Start a website", to: "/services/websites" } });
    if (/(logo|brand|design)/.test(q))
      push({ title: "Logo & branding", reason: "Get a freelancer-built brand identity via TAKATAK.", cta: { label: "Browse logo design", to: "/marketplace/category/logo_design" } });
    if (/(seo|google|maps|local|listing|qmaps)/.test(q))
      push({ title: "QMAPS — Local listings", reason: "Boost local visibility.", cta: { label: "Get QMAPS", to: "/services/local-listings" } });
    if (/(lead|prospect|flex)/.test(q))
      push({ title: "FLEXS — Lead generation", reason: "Automated lead sourcing.", cta: { label: "Get FLEXS", to: "/services/lead-generation" } });
    if (/(ai|chatbot|automation|gpt)/.test(q))
      push({ title: "AI business tools", reason: "AI-assisted automation for your business.", cta: { label: "Explore AI tools", to: "/services/ai-business-tools" } });
    if (recs.length === 0)
      push({ title: "Post a custom project", reason: "We couldn't auto-match — post a project and TAKATAK will assign a vetted freelancer.", cta: { label: "Post a project", to: "/marketplace/post-project" } });
    return {
      source: "fallback",
      summary: "Backend AI is unavailable — showing local recommendations from the TAKATAK catalog.",
      recommendations: recs,
    };
  });