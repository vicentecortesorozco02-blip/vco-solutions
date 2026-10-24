import type { Metadata, Viewport } from "next";

import { brand } from "@/config/brand";
import { fontVariables } from "@/config/fonts";
import { getSiteUrl } from "@/config/site";

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

/**
 * The document shell, shared by the public site and the private panel.
 * Each of them brings its own chrome: see (site)/layout.tsx and panel/.
 */
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

        {children}
      </body>
    </html>
  );
}
