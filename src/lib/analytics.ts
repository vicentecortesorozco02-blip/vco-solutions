/**
 * Analytics contract.
 *
 * No tracking vendor is installed. What exists is the event vocabulary and a
 * single `track()` seam, so that adding a provider later is one file change
 * and never a hunt through components for the right place to instrument.
 *
 * Rules:
 *  - Event names are a closed union. A new event means editing this file,
 *    which forces a decision about whether it is worth measuring.
 *  - Payloads carry no personal data. Never pass an email, a name or the free
 *    text of a form message.
 */

export type AnalyticsEvent =
  | "cta_primary_click"
  | "cta_secondary_click"
  | "solution_card_click"
  | "case_card_click"
  | "form_start"
  | "form_submit"
  | "form_success"
  | "form_error"
  | "diagnosis_calculated"
  | "faq_open";

export interface AnalyticsPayload {
  /** Where on the page the interaction happened: "hero", "footer", "sticky". */
  location?: string;
  /** Content identifier: a solution slug, a case slug, a FAQ id. */
  id?: string;
  /** Numeric value, e.g. hours computed by the diagnosis tool. */
  value?: number;
}

type Provider = (event: AnalyticsEvent, payload: AnalyticsPayload) => void;

let provider: Provider | null = null;

/** Called once from a client boundary when a provider is finally chosen. */
export function registerAnalyticsProvider(next: Provider): void {
  provider = next;
}

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (provider) {
    provider(event, payload);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    // Visible during development so instrumentation gaps are obvious.
    console.debug("[analytics]", event, payload);
  }
}
