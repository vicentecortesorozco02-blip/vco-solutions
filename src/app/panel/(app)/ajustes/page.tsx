import type { Metadata } from "next";

import { SettingsForm } from "@/components/panel/SettingsForm";
import { PageHeader } from "@/components/panel/ui";
import { requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const { profile, email } = await requirePanelSession();
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <PageHeader title="Ajustes" question={`Sesión iniciada como ${email}`} />
      <SettingsForm name={profile.display_name ?? ""} theme={profile.theme} />
    </div>
  );
}
