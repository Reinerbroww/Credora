"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  ShieldIcon,
  UserIcon,
  WalletIcon,
  BuildingIcon,
} from "@/components/icons";
import { Card, EmptyState, FieldLabel, PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";
import type {
  DefaultFlag,
  HomeOwnership,
  LoanGrade,
  LoanIntent,
} from "@/lib/types";

interface FormState {
  applicant_name: string;
  applicant_email: string;
  age: string;
  person_income: string;
  loan_amnt: string;
  loan_int_rate: string;
  employment_length: string;
  home_ownership: HomeOwnership;
  loan_intent: LoanIntent;
  loan_grade: LoanGrade;
  cb_person_cred_hist_length: string;
  cb_person_default_on_file: DefaultFlag;
}

const INITIAL_FORM: FormState = {
  applicant_name: "",
  applicant_email: "",
  age: "",
  person_income: "",
  loan_amnt: "",
  loan_int_rate: "",
  employment_length: "",
  home_ownership: "RENT",
  loan_intent: "PERSONAL",
  loan_grade: "B",
  cb_person_cred_hist_length: "",
  cb_person_default_on_file: "N",
};

const HOME_OPTIONS: HomeOwnership[] = ["RENT", "OWN", "MORTGAGE", "OTHER"];

const INTENT_OPTIONS: LoanIntent[] = [
  "PERSONAL",
  "EDUCATION",
  "MEDICAL",
  "VENTURE",
  "HOMEIMPROVEMENT",
  "DEBTCONSOLIDATION",
];

const GRADE_OPTIONS: Array<{ value: LoanGrade; labelKey: string }> = [
  { value: "A", labelKey: "newapp.gradeA" },
  { value: "B", labelKey: "newapp.gradeB" },
  { value: "C", labelKey: "newapp.gradeC" },
  { value: "D", labelKey: "newapp.gradeD" },
  { value: "E", labelKey: "newapp.gradeE" },
  { value: "F", labelKey: "newapp.gradeF" },
  { value: "G", labelKey: "newapp.gradeG" },
];

const DEFAULT_OPTIONS: Array<{ value: DefaultFlag; labelKey: string }> = [
  { value: "N", labelKey: "newapp.defaultNo" },
  { value: "Y", labelKey: "newapp.defaultYes" },
];

function toNumber(value: string): number {
  return Number(value.replace(/[^\d.]/g, ""));
}

function toCurrency(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function formatThousands(value: string): string {
  if (!value) return "";
  const numeric = value.replace(/[^\d]/g, "");
  if (!numeric) return "";
  return new Intl.NumberFormat("id-ID").format(Number(numeric));
}

export default function AddApplicationPage() {
  const router = useRouter();
  const { addApplication, session, ready } = useCredora();
  const { t, home, intent } = useI18n();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const income = toCurrency(form.person_income);
  const loan = toCurrency(form.loan_amnt);
  const ratio = income > 0 && loan > 0 ? loan / income : 0;

  const completion = useMemo(() => {
    const required: Array<keyof FormState> = [
      "applicant_name",
      "applicant_email",
      "age",
      "person_income",
      "loan_amnt",
      "loan_int_rate",
      "employment_length",
      "cb_person_cred_hist_length",
    ];
    const filled = required.filter((field) => String(form[field]).trim() !== "");
    return Math.round((filled.length / required.length) * 100);
  }, [form]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }) as FormState);
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    const age = toNumber(form.age);
    const incomeValue = toCurrency(form.person_income);
    const loanValue = toCurrency(form.loan_amnt);
    const rate = toNumber(form.loan_int_rate);
    const employment = toNumber(form.employment_length);
    const creditHistory = toNumber(form.cb_person_cred_hist_length);

    if (form.applicant_name.trim().length < 3) {
      next.applicant_name = t("newapp.errName");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicant_email.trim())) {
      next.applicant_email = t("newapp.errEmail");
    }
    if (!Number.isFinite(age) || age < 18 || age > 80) {
      next.age = t("newapp.errAge");
    }
    if (!Number.isFinite(incomeValue) || incomeValue <= 0) {
      next.person_income = t("newapp.errIncome");
    }
    if (!Number.isFinite(loanValue) || loanValue <= 0) {
      next.loan_amnt = t("newapp.errLoan");
    }
    if (!Number.isFinite(rate) || rate <= 0 || rate > 60) {
      next.loan_int_rate = t("newapp.errRate");
    }
    if (!Number.isFinite(employment) || employment < 0 || employment > 60) {
      next.employment_length = t("newapp.errEmployment");
    }
    if (
      !Number.isFinite(creditHistory) ||
      creditHistory < 0 ||
      creditHistory > 80
    ) {
      next.cb_person_cred_hist_length = t("newapp.errCreditHistory");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const id = await addApplication({
        applicant_name: form.applicant_name.trim(),
        applicant_email: form.applicant_email.trim(),
        age: Math.round(toNumber(form.age)),
        person_income: toCurrency(form.person_income),
        employment_length: toNumber(form.employment_length),
        loan_amnt: toCurrency(form.loan_amnt),
        loan_int_rate: toNumber(form.loan_int_rate),
        home_ownership: form.home_ownership,
        loan_intent: form.loan_intent,
        loan_grade: form.loan_grade,
        cb_person_cred_hist_length: Math.round(
          toNumber(form.cb_person_cred_hist_length),
        ),
        cb_person_default_on_file: form.cb_person_default_on_file,
      });
      router.push(`/applications/${id}`);
    } catch {
      setErrors((current) => ({
        ...current,
        applicant_name: t("newapp.errSave"),
      }));
      setSubmitting(false);
    }
  };

  if (ready && session?.role !== "Risk Analyst") {
    return (
      <Card>
        <EmptyState
          icon={<ShieldIcon className="h-5 w-5" />}
          title={t("perm.restrictedTitle")}
          description={t("perm.createApps")}
          action={
            <Link href="/applications" className="btn-primary">
              {t("detail.backToApps")}
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="fade-in space-y-5">
      <PageHeader
        eyebrow={t("newapp.eyebrow")}
        title={t("newapp.title")}
        description={t("newapp.description")}
        actions={
          <Link href="/applications" className="btn-secondary">
            {t("common.cancel")}
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1.55fr_0.85fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-sage/20 bg-sage/[0.08] text-sage">
                <UserIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[13.5px] font-semibold text-white">
                  {t("newapp.customerInfo")}
                </h2>
                <p className="text-[11px] text-muted">
                  {t("newapp.customerInfoDesc")}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="applicant_name">
                  {t("newapp.fullName")}
                </FieldLabel>
                <input
                  id="applicant_name"
                  value={form.applicant_name}
                  onChange={(event) => updateField("applicant_name", event.target.value)}
                  className="field"
                  placeholder={t("newapp.fullNamePlaceholder")}
                />
                {errors.applicant_name && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.applicant_name}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <FieldLabel htmlFor="applicant_email">
                  {t("newapp.email")}
                </FieldLabel>
                <input
                  id="applicant_email"
                  type="email"
                  value={form.applicant_email}
                  onChange={(event) => updateField("applicant_email", event.target.value)}
                  className="field"
                  placeholder={t("newapp.emailPlaceholder")}
                />
                {errors.applicant_email && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.applicant_email}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel htmlFor="age">{t("newapp.age")}</FieldLabel>
                <input
                  id="age"
                  inputMode="numeric"
                  value={form.age}
                  onChange={(event) =>
                    updateField("age", event.target.value.replace(/[^\d]/g, ""))
                  }
                  className="field"
                  placeholder={t("newapp.agePlaceholder")}
                />
                {errors.age && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">{errors.age}</p>
                )}
              </div>

              <div>
                <FieldLabel
                  htmlFor="home_ownership"
                  hint={t("hint.homeOwnership")}
                >
                  {t("newapp.homeOwnership")}
                </FieldLabel>
                <select
                  id="home_ownership"
                  value={form.home_ownership}
                  onChange={(event) =>
                    updateField("home_ownership", event.target.value)
                  }
                  className="field"
                >
                  {HOME_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {home(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-sage/20 bg-sage/[0.08] text-sage">
                <WalletIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[13.5px] font-semibold text-white">
                  {t("newapp.financialInfo")}
                </h2>
                <p className="text-[11px] text-muted">
                  {t("newapp.financialInfoDesc")}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel
                  htmlFor="person_income"
                  hint={t("hint.annualIncome")}
                >
                  {t("newapp.annualIncome")}
                </FieldLabel>
                <input
                  id="person_income"
                  inputMode="numeric"
                  value={form.person_income}
                  onChange={(event) =>
                    updateField("person_income", formatThousands(event.target.value))
                  }
                  className="field"
                  placeholder={t("newapp.incomePlaceholder")}
                />
                {errors.person_income && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.person_income}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel htmlFor="loan_amnt" hint={t("hint.loanAmount")}>
                  {t("newapp.loanAmount")}
                </FieldLabel>
                <input
                  id="loan_amnt"
                  inputMode="numeric"
                  value={form.loan_amnt}
                  onChange={(event) =>
                    updateField("loan_amnt", formatThousands(event.target.value))
                  }
                  className="field"
                  placeholder={t("newapp.loanPlaceholder")}
                />
                {errors.loan_amnt && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">{errors.loan_amnt}</p>
                )}
              </div>

              <div>
                <FieldLabel
                  htmlFor="loan_int_rate"
                  hint={t("hint.interestRate")}
                >
                  {t("newapp.interestRate")}
                </FieldLabel>
                <input
                  id="loan_int_rate"
                  inputMode="decimal"
                  value={form.loan_int_rate}
                  onChange={(event) => updateField("loan_int_rate", event.target.value)}
                  className="field"
                  placeholder={t("newapp.interestPlaceholder")}
                />
                {errors.loan_int_rate && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.loan_int_rate}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel htmlFor="loan_intent" hint={t("hint.loanPurpose")}>
                  {t("newapp.loanPurpose")}
                </FieldLabel>
                <select
                  id="loan_intent"
                  value={form.loan_intent}
                  onChange={(event) => updateField("loan_intent", event.target.value)}
                  className="field"
                >
                  {INTENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {intent(option)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel htmlFor="loan_grade" hint={t("hint.loanGrade")}>
                  {t("newapp.loanGrade")}
                </FieldLabel>
                <select
                  id="loan_grade"
                  value={form.loan_grade}
                  onChange={(event) => updateField("loan_grade", event.target.value)}
                  className="field"
                >
                  {GRADE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel
                  htmlFor="cb_person_cred_hist_length"
                  hint={t("hint.creditHistory")}
                >
                  {t("newapp.creditHistory")}
                </FieldLabel>
                <input
                  id="cb_person_cred_hist_length"
                  inputMode="numeric"
                  value={form.cb_person_cred_hist_length}
                  onChange={(event) =>
                    updateField(
                      "cb_person_cred_hist_length",
                      event.target.value.replace(/[^\d]/g, ""),
                    )
                  }
                  className="field"
                  placeholder={t("newapp.creditHistoryPlaceholder")}
                />
                {errors.cb_person_cred_hist_length && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.cb_person_cred_hist_length}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel
                  htmlFor="cb_person_default_on_file"
                  hint={t("hint.historicalDefault")}
                >
                  {t("newapp.historicalDefault")}
                </FieldLabel>
                <select
                  id="cb_person_default_on_file"
                  value={form.cb_person_default_on_file}
                  onChange={(event) =>
                    updateField("cb_person_default_on_file", event.target.value)
                  }
                  className="field"
                >
                  {DEFAULT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-sage/20 bg-sage/[0.08] text-sage">
                <BuildingIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[13.5px] font-semibold text-white">
                  {t("newapp.employmentInfo")}
                </h2>
                <p className="text-[11px] text-muted">
                  {t("newapp.employmentInfoDesc")}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel
                  htmlFor="employment_length"
                  hint={t("hint.employmentLength")}
                >
                  {t("newapp.employmentLength")}
                </FieldLabel>
                <input
                  id="employment_length"
                  inputMode="decimal"
                  value={form.employment_length}
                  onChange={(event) =>
                    updateField("employment_length", event.target.value)
                  }
                  className="field"
                  placeholder={t("newapp.employmentPlaceholder")}
                />
                {errors.employment_length && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.employment_length}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
          <Card className="p-5">
            <h2 className="text-[13px] font-semibold text-white">
              {t("newapp.summary")}
            </h2>
            <div className="mt-3 space-y-2.5">
              <SummaryRow label={t("newapp.applicant")} value={form.applicant_name || "—"} />
              <SummaryRow
                label={t("newapp.annualIncomeShort")}
                value={income > 0 ? formatCurrency(income) : "—"}
              />
              <SummaryRow
                label={t("newapp.loanAmountShort")}
                value={loan > 0 ? formatCurrency(loan) : "—"}
              />
              <SummaryRow
                label={t("newapp.loanToIncome")}
                value={ratio > 0 ? `${(ratio * 100).toFixed(1)}%` : "—"}
              />
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-muted">{t("newapp.completion")}</span>
                <span className="stat-number font-medium text-white">{completion}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-sage transition-[width] duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-5 w-full"
            >
              <CheckIcon className="h-4 w-4" />
              {submitting ? t("newapp.saving") : t("newapp.save")}
            </button>
            <Link
              href="/applications"
              className="mt-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:text-white"
            >
              {t("newapp.cancelReturn")}
            </Link>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-2.5">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-risk-mid" />
              <div>
                <p className="text-[12px] font-medium text-white">
                  {t("newapp.validationNote")}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {t("newapp.validationDesc")}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-muted/60">
            <ArrowRightIcon className="h-3 w-3" />
            {t("newapp.savingOpens")}
          </div>
        </div>
      </form>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft pb-2.5 last:border-b-0 last:pb-0">
      <span className="text-[11.5px] text-muted">{label}</span>
      <span className="max-w-[170px] truncate text-right text-[12px] font-medium text-white">
        {value}
      </span>
    </div>
  );
}
