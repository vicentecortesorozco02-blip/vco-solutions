import type { MetadataRoute } from "next";

import { getSiteUrl, isProduction, panelRoutes } from "@/config/site";

/**
 * Preview deployments must never be indexed: a staging copy of the site
 * competing with production is a self-inflicted SEO wound.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  if (!isProduction || process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/legal/", panelRoutes.home],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
