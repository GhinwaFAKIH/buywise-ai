import { siteUrl } from "./site-url";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Googlebot", "Google-Extended", "Claude-SearchBot", "Claude-User"], allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
