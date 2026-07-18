import type { MetadataRoute } from "next";
import { siteConfig } from "./config";
import { getApiUrl } from "./utils/api";

import type { Reviewer } from "./data/reviewers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const main = [
    {
      url: `${siteConfig.url}/`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1
    },
    {
      url: `${siteConfig.url}/community`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9
    }
  ];

  let reviewerUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(getApiUrl("/api/reviewers"));
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        reviewerUrls = json.data.map((reviewer: Reviewer) => ({
          url: `${siteConfig.url}/reviewers/${reviewer.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8
        }));
      }
    }
  } catch {
    // Fall back to empty
  }

  return [...main, ...reviewerUrls];
}
