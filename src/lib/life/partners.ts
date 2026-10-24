import { chargeDate, isSpend } from "./finance";
import type { Charge, ChargeShare, ISODate, Partner, Project, ProjectPartner, TagColor } from "./model";

/**
 * Socios y gastos compartidos.
 *
 * Two questions that look alike and are not:
 *
 *   ¿quién lo pagó?   → `charge.paid_by_partner_id` (null: lo pagaste tú)
 *   ¿a quién le toca? → the split: `charge_shares` when it is written down,
 *                        and otherwise the project's agreed percentages
 *
 * The balance between the two is what somebody owes somebody. A percentage
 * nobody has agreed yet is null, and a charge with no agreed split is
 * reported as such instead of being divided evenly behind your back.
 */

export interface PartnerShare {
  /** Null is you. */
  partnerId: string | null;
  amount: number;
  settled: boolean;
}

interface ShareInput {
  chargeShares: ChargeShare[];
  projectPartners: ProjectPartner[];
}

export interface SplitResult {
  shares: PartnerShare[];
  /** True when nothing says how to split it: no shares, no agreed percentages. */
  undecided: boolean;
}

/**
 * How one charge splits. Explicit shares win; otherwise the project's agreed
 * percentages, with whatever is left over as yours.
 */
export function splitOf(charge: Charge, data: ShareInput): SplitResult {
  const total = Number(charge.amount);
  const explicit = data.chargeShares.filter((s) => s.charge_id === charge.id);

  if (explicit.length) {
    return {
      shares: explicit.map((s) => ({
        partnerId: s.partner_id,
        amount: s.amount !== null ? Number(s.amount) : s.share !== null ? (total * Number(s.share)) / 100 : 0,
        settled: s.settled,
      })),
      undecided: explicit.every((s) => s.amount === null && s.share === null),
    };
  }

  // Un gasto que no se reparte es entero de quien lo pagó.
  if (!charge.shared)
    return { shares: [{ partnerId: charge.paid_by_partner_id, amount: total, settled: true }], undecided: false };

  const agreed = charge.project_id
    ? data.projectPartners.filter((p) => p.project_id === charge.project_id && p.share !== null)
    : [];
  if (!agreed.length) return { shares: [{ partnerId: null, amount: total, settled: true }], undecided: true };

  const partners = agreed.map((p) => ({
    partnerId: p.partner_id,
    amount: (total * Number(p.share)) / 100,
    settled: false,
  }));
  const mine = total - partners.reduce((sum, p) => sum + p.amount, 0);
  return {
    shares: mine > 0.004 ? [{ partnerId: null, amount: mine, settled: true }, ...partners] : partners,
    undecided: false,
  };
}

export interface PartnerBalance {
  partner: Partner;
  /** What they put in. */
  paid: number;
  /** What was theirs to pay. */
  owes: number;
  /** paid − owes. Positive: you owe them. Negative: they owe you. */
  net: number;
  /** Charges whose split nobody has agreed yet. */
  undecided: number;
}

/**
 * Where each partner stands, from paid charges only. A failed attempt or an
 * authorisation never moves a balance.
 */
export function partnerBalances(
  data: ShareInput & { charges: Charge[]; partners: Partner[] },
  projectId?: string,
): PartnerBalance[] {
  const paid = new Map<string, number>();
  const owes = new Map<string, number>();
  const undecided = new Map<string, number>();

  for (const charge of data.charges) {
    if (!isSpend(charge)) continue;
    if (projectId && charge.project_id !== projectId) continue;
    if (!charge.shared && charge.paid_by_partner_id === null) continue;

    if (charge.paid_by_partner_id) {
      paid.set(charge.paid_by_partner_id, (paid.get(charge.paid_by_partner_id) ?? 0) + Number(charge.amount));
    }

    const split = splitOf(charge, data);
    if (split.undecided) {
      const key = charge.project_id ?? "";
      undecided.set(key, (undecided.get(key) ?? 0) + 1);
      continue;
    }
    for (const share of split.shares) {
      if (!share.partnerId) continue;
      owes.set(share.partnerId, (owes.get(share.partnerId) ?? 0) + share.amount);
    }
  }

  const involved = projectId
    ? new Set(data.projectPartners.filter((p) => p.project_id === projectId).map((p) => p.partner_id))
    : null;

  return data.partners
    .filter((partner) => !involved || involved.has(partner.id))
    .map((partner) => ({
      partner,
      paid: paid.get(partner.id) ?? 0,
      owes: owes.get(partner.id) ?? 0,
      net: (paid.get(partner.id) ?? 0) - (owes.get(partner.id) ?? 0),
      undecided: 0,
    }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

/** Shared charges of a project, newest first. */
export function sharedCharges(charges: Charge[], projectId: string): Charge[] {
  return charges
    .filter((c) => c.project_id === projectId && (c.shared || c.paid_by_partner_id !== null))
    .sort((a, b) => ((chargeDate(a) ?? "") < (chargeDate(b) ?? "") ? 1 : -1));
}

export interface ProjectExpense extends PartnerActivity {
  /** False when one person carries it whole. */
  shared: boolean;
}

/**
 * Every expense of a project, shared or not, newest first.
 *
 * A project also spends on its own: a domain, a licence, a dinner that
 * nobody splits. Those are expenses of the project paid by one person, and
 * the page shows them next to the shared ones instead of hiding them.
 */
export function projectCharges(
  data: ShareInput & { charges: Charge[]; partners: Partner[] },
  projectId: string,
): ProjectExpense[] {
  return data.charges
    .filter((charge) => charge.project_id === projectId && isSpend(charge))
    .sort((a, b) => ((chargeDate(a) ?? "") < (chargeDate(b) ?? "") ? 1 : -1))
    .map((charge) => ({
      date: chargeDate(charge),
      charge,
      shared: charge.shared,
      paidBy: charge.paid_by_partner_id ? (data.partners.find((p) => p.id === charge.paid_by_partner_id) ?? null) : null,
      split: splitOf(charge, data),
    }));
}

/** What each one has actually put into the project, you included. */
export function projectPaidBy(expenses: ProjectExpense[]): { partnerId: string | null; amount: number }[] {
  const by = new Map<string | null, number>();
  for (const { charge, paidBy } of expenses) {
    const key = paidBy?.id ?? null;
    by.set(key, (by.get(key) ?? 0) + Number(charge.amount));
  }
  return [...by.entries()]
    .map(([partnerId, amount]) => ({ partnerId, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/** Charges split with somebody but with no agreed split yet. */
export function undecidedSplits(charges: Charge[], data: ShareInput): Charge[] {
  return charges.filter((c) => c.shared && splitOf(c, data).undecided);
}

export const partnersOf = (data: { projectPartners: ProjectPartner[]; partners: Partner[] }, projectId: string) =>
  data.projectPartners
    .filter((link) => link.project_id === projectId)
    .map((link) => ({ link, partner: data.partners.find((p) => p.id === link.partner_id) ?? null }))
    .filter((row): row is { link: ProjectPartner; partner: Partner } => row.partner !== null);

/** Total agreed for a project, so an impossible 130 % is visible. */
export const agreedShare = (links: ProjectPartner[]) =>
  links.reduce((sum, link) => sum + Number(link.share ?? 0), 0);

export const colorOf = (projects: Project[], projectId: string | null | undefined): TagColor =>
  projects.find((p) => p.id === projectId)?.color ?? "slate";

export interface PartnerActivity {
  date: ISODate | null;
  charge: Charge;
  paidBy: Partner | null;
  split: SplitResult;
}

/** Who paid what, in order: the list the project card shows. */
export function partnerActivity(
  data: ShareInput & { charges: Charge[]; partners: Partner[] },
  projectId: string,
): PartnerActivity[] {
  return sharedCharges(data.charges, projectId).map((charge) => ({
    date: chargeDate(charge),
    charge,
    paidBy: charge.paid_by_partner_id ? (data.partners.find((p) => p.id === charge.paid_by_partner_id) ?? null) : null,
    split: splitOf(charge, data),
  }));
}
