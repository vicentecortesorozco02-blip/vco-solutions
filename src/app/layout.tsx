import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AnalyticsBridge } from "@/components/ui/AnalyticsBridge";
import { brand } from "@/config/brand";
import { fontVariables } from "@/config/fonts";
import { getSiteUrl } from "@/config/site";
import { organizationSchema, websiteSchema } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s — ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  authors: [{ name: brand.legalName }],
  creator: brand.legalName,
  publisher: brand.legalName,
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: brand.locale.replace("-", "_"),
    siteName: brand.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: brand.colors.bg,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={brand.language} className={fontVariables}>
      <body className="min-h-dvh antialiased">
        {/* Entrance animations must never hide content when JS is unavailable. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

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
      </body>
    </html>
  );
}
