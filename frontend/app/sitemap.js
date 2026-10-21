import { guides } from "./guides/guides";
import { siteUrl } from "./site-url";

export default function sitemap() {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/guides`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/shop`, changeFrequency: "weekly", priority: 0.9 },
    ...guides.map(({ slug }) => ({
      url: `${siteUrl}/guides/${slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
