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
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";

export default function SettingsPage() {
  const router = useRouter();
  const { session, updateSession, resetDemoData, logout } = useCredora();
  const { t, role } = useI18n();
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
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar
                name={session?.full_name ?? t("common.credoraUser")}
                className="h-12 w-12 text-[15px]"
              />
              <div>
                <p className="text-[15px] font-semibold text-white">
                  {session?.full_name ?? t("common.credoraUser")}
                </p>
                <p className="text-[11.5px] text-muted">
                  {role(session?.role ?? "Risk Analyst")} ·{" "}
                  {session?.organization_name ?? "Nusantara PayLater"}
                </p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-sage/20 bg-sage/[0.08] px-2.5 py-1 text-[10px] font-medium text-sage">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                {t("settings.active")}
              </span>
            </div>
          </Card>

          <SectionCard
            title={t("settings.profileInfo")}
            subtitle={t("settings.profileInfoSub")}
            action={<UserIcon className="h-4 w-4 text-muted" />}
          >
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="full_name" className="label">
                    {t("settings.fullName")}
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
                    {t("settings.email")}
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
                  <label className="label">{t("settings.role")}</label>
                  <input
                    value={role(session?.role ?? "Risk Analyst")}
                    disabled
                    className="field"
                  />
                </div>
                <div>
                  <label className="label">{t("settings.organization")}</label>
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
                  {t("settings.profileUpdated")}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" className="btn-primary">
                  <CheckIcon className="h-4 w-4" />
                  {t("settings.saveChanges")}
                </button>
                <p className="text-[10.5px] text-muted/70">
                  {t("settings.adminNote")}
                </p>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title={t("settings.orgInfo")}
            subtitle={t("settings.orgInfoSub")}
            action={<BuildingIcon className="h-4 w-4 text-muted" />}
          >
            <div>
              <InfoRow
                label={t("settings.organization")}
                value={session?.organization_name ?? "Nusantara PayLater"}
              />
              <InfoRow
                label={t("settings.orgId")}
                value={session?.organization_id ?? "—"}
                mono
              />
              <InfoRow
                label={t("settings.dataIsolation")}
                value={t("settings.dataIsolationValue")}
              />
              <InfoRow
                label={t("settings.accessModel")}
                value={t("settings.accessModelValue")}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            title={t("settings.security")}
            subtitle={t("settings.securitySub")}
            action={<ShieldIcon className="h-4 w-4 text-muted" />}
          >
            <div className="space-y-3 text-[11.5px] leading-relaxed text-muted">
              <p>{t("settings.securityDesc")}</p>
              <InfoRow
                label={t("settings.authProvider")}
                value={t("settings.authProviderValue")}
              />
              <InfoRow
                label={t("settings.sessionStorage")}
                value={t("settings.sessionStorageValue")}
              />
              <InfoRow
                label={t("settings.dataLayer")}
                value={t("settings.dataLayerValue")}
              />
            </div>
          </SectionCard>

          <SectionCard
            title={t("settings.demoControls")}
            subtitle={t("settings.demoControlsSub")}
            action={<DatabaseIcon className="h-4 w-4 text-muted" />}
          >
            <div className="flex items-start gap-2.5 rounded-lg border border-risk-mid/20 bg-risk-mid/[0.06] px-3.5 py-2.5">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-risk-mid" />
              <p className="text-[11px] leading-relaxed text-muted">
                {t("settings.demoWarning")}
              </p>
            </div>

            {dataReset && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-risk-low/25 bg-risk-low/10 px-3 py-2 text-[11.5px] text-[#8fd3ab]">
                <CheckIcon className="h-4 w-4" />
                {t("settings.demoRestored")}
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
                {confirmReset
                  ? t("settings.confirmReset")
                  : t("settings.resetDemo")}
              </button>
              {confirmReset && (
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="btn-secondary"
                >
                  {t("settings.cancel")}
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
                <p className="text-[12.5px] font-medium text-white">
                  {t("settings.signOut")}
                </p>
                <p className="text-[11px] text-muted">
                  {t("settings.signOutSub")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary mt-3 w-full"
            >
              <LogoutIcon className="h-4 w-4" />
              {t("settings.logout")}
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
