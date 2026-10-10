/**
 * Content model.
 *
 * All repeatable content (solutions, cases, FAQ, method) is typed data, not
 * JSX. This keeps copy out of visual components and means a CMS or database
 * can replace these modules later by satisfying the same interfaces.
 *
 * Nothing in here may contain an invented client, figure or percentage.
 * See `Provenance` below.
 */

import type { LucideIcon } from "lucide-react";

/**
 * Credibility guard.
 *
 * `measured`     real data from a delivered project. Requires `source`.
 * `illustrative` arithmetic or a worked example, clearly labelled as such
 *                in the UI. Never presented as a client result.
 */
export type Provenance = "measured" | "illustrative";

/** Who performs a step in a process diagram. */
export type FlowActor = "person" | "system" | "trigger" | "outcome";

export interface FlowStep {
  id: string;
  /** Imperative, human language. "Copia los datos al Excel". */
  label: string;
  actor: FlowActor;
  /** Optional short qualifier shown under the label. Keep under 30 chars. */
  note?: string;
}

export interface ProcessSide {
  /** "Hoy" / "Con el sistema". */
  title: string;
  steps: FlowStep[];
  /** One-line summary of the human cost or gain. */
  summary: string;
}

export interface ProcessComparison {
  before: ProcessSide;
  after: ProcessSide;
}

export interface Metric {
  label: string;
  value: string;
  /** Optional unit rendered smaller next to the value. */
  unit?: string;
  provenance: Provenance;
  /** Required when provenance is "measured". */
  source?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface MethodPhase {
  /** "01" .. "05". Rendered as an editorial section marker. */
  number: string;
  /** Single verb, first person plural. */
  title: string;
  /** One sentence, plain language, no jargon. */
  summary: string;
  /** What the client actually receives at the end of this phase. */
  deliverable: string;
  /** 2-3 concrete activities. Not marketing adjectives. */
  detail: string[];
}

export interface SolutionSummary {
  slug: string;
  /** Outcome-led, not technology-led. */
  title: string;
  /**
   * One word, for the big uppercase list on the home page ("Presupuestos").
   * Must still make sense on its own.
   */
  shortTitle: string;
  /** One sentence a non-technical manager understands immediately. */
  excerpt: string;
  /** Compressed flow shown on cards: "Solicitud > cálculo > PDF > respuesta". */
  chain: string[];
  icon: LucideIcon;
  /** Controls ordering and index-page grouping. Lower shows first. */
  order: number;
  /** Solutions can be added without touching any component. */
  published: boolean;
}

export interface Solution extends SolutionSummary {
  /** H1 on the detail page. May differ from the card title. */
  heading: string;
  /** The situation the reader recognises as their own. */
  problem: {
    title: string;
    body: string;
    /** Symptoms, phrased as things people say out loud. */
    symptoms: string[];
  };
  process: ProcessComparison;
  /** What we typically build. Technology named only here, never in the hero. */
  buildingBlocks: string[];
  /** Systems we connect to. Generic categories, never invented logos. */
  integrations: string[];
  benefits: { title: string; body: string }[];
  faq: FaqItem[];
  /** Related solutions by slug. Empty array is fine. */
  related: string[];
  seo: { title: string; description: string };
}

/**
 * `demonstration` a worked example built by us to show the shape of a
 *                 project. Labelled as such everywhere it appears.
 * `product`       software we built and run for our own business. Real and
 *                 in use, but not a client engagement: it says so.
 * `project`       a real delivered engagement for a client. Requires a named
 *                 client or explicit consent.
 */
export type CaseKind = "demonstration" | "product" | "project";

/**
 * A real screenshot of delivered work, shown inside a device frame. Never a
 * mock-up of something that does not exist.
 */
export interface Shot {
  /** Path under /public. */
  src: string;
  /** Describes what the screen shows, for people who cannot see it. */
  alt: string;
  /** One line under the image. Say when the data on screen is sample data. */
  caption: string;
  device: "laptop" | "phone";
}

export interface CaseSummary {
  slug: string;
  title: string;
  /** Sector in generic terms while we cannot name clients. */
  sector: string;
  excerpt: string;
  kind: CaseKind;
  headline: Metric;
  /** The name of the product or project itself, when it has one. */
  name?: string;
  /** Screenshot used on cards and on the home page. Real work only. */
  cover?: Shot;
  /** Public address of the work, when there is one to visit. */
  url?: string;
  order: number;
  published: boolean;
}

export interface CaseStudy extends CaseSummary {
  /** How the company worked before, in their words. */
  situation: string;
  process: ProcessComparison;
  /** What we built, in plain language first. */
  solution: {
    title: string;
    body: string;
    components: string[];
  };
  results: Metric[];
  /** The arithmetic behind the headline figure, shown openly. */
  workings?: string;
  /** Screens of the real thing. Products and projects only. */
  gallery?: Shot[];
  seo: { title: string; description: string };
}
