import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AnalyticsBridge } from "@/components/ui/AnalyticsBridge";
import { organizationSchema, websiteSchema } from "@/lib/seo";

/**
 * Header, main landmark, footer and structured data of the public site.
 *
 * Lives outside the root layout so the private panel can bring its own
 * chrome. Used by (site)/layout.tsx and by the root not-found page.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-inverse focus:px-4 focus:py-2 focus:text-sm focus:text-fg-inverse"
      >
        Saltar al contenido
      </a>

      <Header />

      <main id="contenido" className="pt-16 lg:pt-[4.5rem]">
        {children}
      </main>

      <Footer />
      <AnalyticsBridge />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema(), websiteSchema()]),
        }}
      />
    </>
  );
}
