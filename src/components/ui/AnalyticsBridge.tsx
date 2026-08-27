"use client";

import { useEffect } from "react";

import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * One delegated click listener for the whole site.
 *
 * CTAs declare intent with data attributes instead of onClick handlers, which
 * means buttons and links stay server components and no section is forced into
 * the client bundle just to be measured.
 */
export function AnalyticsBridge() {
  useEffect(() => {
    function onClick(nativeEvent: MouseEvent) {
      const target = nativeEvent.target;
      if (!(target instanceof Element)) return;

      const node = target.closest<HTMLElement>("[data-analytics-event]");
      if (!node) return;

      const event = node.dataset.analyticsEvent as AnalyticsEvent | undefined;
      if (!event) return;

      track(event, {
        location: node.dataset.analyticsLocation,
        id: node.dataset.analyticsId,
      });
    }

    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
