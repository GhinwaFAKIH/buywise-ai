import { guides } from "./guides/guides";
import { siteUrl } from "./site-url";

export default function sitemap() {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/guides`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/compare-skincare-products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/skincare-finder`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/calculator`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/top-skincare-products`, changeFrequency: "monthly", priority: 0.85 },
    ...["skin","hair","makeup"].map(section=>({url: `${siteUrl}/${section}`,changeFrequency:"weekly",priority:0.9})),
    { url: `${siteUrl}/calculator/how-to-compare-skincare-prices`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/fr/guide-prix-skincare`, changeFrequency: "monthly", priority: 0.8, alternates: { languages: { "fr-FR": `${siteUrl}/fr/guide-prix-skincare`, en: `${siteUrl}/guides/how-to-compare-skincare-prices` } } },
    { url: `${siteUrl}/comparison-dataset`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/ai-visibility`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/ontology`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/methodology`, changeFrequency: "monthly", priority: 0.5 },
    ...guides.map(({ slug }) => ({
      url: `${siteUrl}/guides/${slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
