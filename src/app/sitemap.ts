import type { MetadataRoute } from "next";

import { getSiteUrl, routes } from "@/config/site";
import { publishedCases } from "@/content/cases";
import { publishedSolutions } from "@/content/solutions";

/**
 * Sitemap.
 *
 * Generated from content, never hand-maintained: publishing a solution or a
 * case is enough for it to appear here. Legal pages are excluded on purpose,
 * they are marked noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: "monthly" | "yearly" }[] = [
    { path: routes.home, priority: 1, changeFrequency: "monthly" },
    { path: routes.solutions, priority: 0.9, changeFrequency: "monthly" },
    { path: routes.cases, priority: 0.9, changeFrequency: "monthly" },
    { path: routes.method, priority: 0.8, changeFrequency: "yearly" },
    { path: routes.diagnosis, priority: 0.7, changeFrequency: "monthly" },
    { path: routes.company, priority: 0.6, changeFrequency: "yearly" },
    { path: routes.contact, priority: 0.8, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path === "/" ? "" : route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...publishedSolutions.map((solution) => ({
      url: `${base}${routes.solution(solution.slug)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...publishedCases.map((entry) => ({
      url: `${base}${routes.case(entry.slug)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
