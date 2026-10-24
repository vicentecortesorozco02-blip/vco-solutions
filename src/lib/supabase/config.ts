/**
 * Supabase settings for the private panel.
 *
 * The publishable key is meant to be public: Row Level Security decides what
 * each signed-in user can read. There is no service-role key anywhere in this
 * app, on purpose.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

/**
 * Accounts allowed into the panel. Anyone can create a Supabase account with
 * the public key, and RLS keeps that account empty; this list keeps it out.
 */
export function allowedEmails(): string[] {
  return (process.env.PANEL_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = allowedEmails();
  // An empty list locks the panel instead of opening it to everyone.
  return allowed.length > 0 && allowed.includes(email.toLowerCase());
}
