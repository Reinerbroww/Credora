"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AlertIcon,
  BuildingIcon,
  CheckIcon,
  DatabaseIcon,
  LogoutIcon,
  RefreshIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/icons";
import {
  Avatar,
  Card,
  InfoRow,
  PageHeader,
  SectionCard,
} from "@/components/ui";
import { useCredora } from "@/lib/store";

export default function SettingsPage() {
  const router = useRouter();
  const { session, updateSession, resetDemoData, logout } = useCredora();
  const [fullName, setFullName] = useState(session?.full_name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [profileSaved, setProfileSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [dataReset, setDataReset] = useState(false);

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    await updateSession({ full_name: fullName.trim(), email: email.trim() });
    setProfileSaved(true);
  };

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await resetDemoData();
    setConfirmReset(false);
    setDataReset(true);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="fade-in space-y-5">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, review organization details, and control the demo workspace."
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar
                name={session?.full_name ?? "Credora User"}
                className="h-12 w-12 text-[15px]"
              />
              <div>
                <p className="text-[15px] font-semibold text-white">
                  {session?.full_name ?? "Credora User"}
                </p>
                <p className="text-[11.5px] text-muted">
                  {session?.role ?? "Risk Analyst"} ·{" "}
                  {session?.organization_name ?? "Nusantara PayLater"}
                </p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-sage/20 bg-sage/[0.08] px-2.5 py-1 text-[10px] font-medium text-sage">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                Active session
              </span>
            </div>
          </Card>

          <SectionCard
            title="Profile information"
            subtitle="Update the display name and contact email used in this workspace."
            action={<UserIcon className="h-4 w-4 text-muted" />}
          >
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="full_name" className="label">
                    Full name
                  </label>
                  <input
                    id="full_name"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setProfileSaved(false);
                    }}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="profile_email" className="label">
                    Email address
                  </label>
                  <input
                    id="profile_email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setProfileSaved(false);
                    }}
                    className="field"
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <input
                    value={session?.role ?? "Risk Analyst"}
                    disabled
                    className="field"
                  />
                </div>
                <div>
                  <label className="label">Organization</label>
                  <input
                    value={session?.organization_name ?? "Nusantara PayLater"}
                    disabled
                    className="field"
                  />
                </div>
              </div>

              {profileSaved && (
                <div className="flex items-center gap-2 rounded-lg border border-risk-low/25 bg-risk-low/10 px-3 py-2 text-[11.5px] text-[#8fd3ab]">
                  <CheckIcon className="h-4 w-4" />
                  Profile updated.
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" className="btn-primary">
                  <CheckIcon className="h-4 w-4" />
                  Save changes
                </button>
                <p className="text-[10.5px] text-muted/70">
                  Role and organization assignment are managed by the
                  administrator.
                </p>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Organization information"
            subtitle="Tenant used to isolate application data."
            action={<BuildingIcon className="h-4 w-4 text-muted" />}
          >
            <div>
              <InfoRow
                label="Organization"
                value={session?.organization_name ?? "Nusantara PayLater"}
              />
              <InfoRow
                label="Organization ID"
                value={session?.organization_id ?? "—"}
                mono
              />
              <InfoRow
                label="Data isolation"
                value="Organization-scoped (server-enforced)"
              />
              <InfoRow label="Access model" value="Role-based review permissions" />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            title="Account security"
            subtitle="Authentication settings for this workspace."
            action={<ShieldIcon className="h-4 w-4 text-muted" />}
          >
            <div className="space-y-3 text-[11.5px] leading-relaxed text-muted">
              <p>
                Credentials are verified against the Neon database with hashed
                passwords, and the session is stored in a signed, HTTP-only
                cookie. Use strong passwords before exposing this deployment
                publicly.
              </p>
              <InfoRow label="Auth provider" value="Auth.js (credentials)" />
              <InfoRow label="Session storage" value="Signed JWT cookie" />
              <InfoRow
                label="Data layer"
                value="Neon PostgreSQL · organization-scoped"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Demo data controls"
            subtitle="Reset the workspace to the seeded illustrative dataset."
            action={<DatabaseIcon className="h-4 w-4 text-muted" />}
          >
            <div className="flex items-start gap-2.5 rounded-lg border border-risk-mid/20 bg-risk-mid/[0.06] px-3.5 py-2.5">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-risk-mid" />
              <p className="text-[11px] leading-relaxed text-muted">
                Resetting removes the organization&apos;s applications,
                assessments, and reviews, then restores the original demo
                records.
              </p>
            </div>

            {dataReset && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-risk-low/25 bg-risk-low/10 px-3 py-2 text-[11.5px] text-[#8fd3ab]">
                <CheckIcon className="h-4 w-4" />
                Demo data restored.
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReset}
                className={
                  confirmReset
                    ? "btn-primary"
                    : "btn-secondary"
                }
              >
                <RefreshIcon className="h-4 w-4" />
                {confirmReset ? "Confirm reset" : "Reset demo data"}
              </button>
              {confirmReset && (
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </SectionCard>

          <Card className="p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-risk-high/20 bg-risk-high/[0.08] text-risk-high">
                <LogoutIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[12.5px] font-medium text-white">Sign out</p>
                <p className="text-[11px] text-muted">
                  End the current workspace session.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary mt-3 w-full"
            >
              <LogoutIcon className="h-4 w-4" />
              Logout
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
