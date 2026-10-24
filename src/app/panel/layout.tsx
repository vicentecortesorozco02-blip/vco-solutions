import type { Metadata } from "next";

/**
 * Everything under /panel is private: never indexed, never cached by a
 * shared proxy, never in the sitemap. The proxy also sends X-Robots-Tag.
 */
export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel" },
  robots: { index: false, follow: false, nocache: true },
};

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
