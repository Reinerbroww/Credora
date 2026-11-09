"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  UserIcon,
  WalletIcon,
  BuildingIcon,
} from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
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

const HOME_OPTIONS: Array<{ value: HomeOwnership; label: string }> = [
  { value: "RENT", label: "Rent" },
  { value: "OWN", label: "Own" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "OTHER", label: "Other" },
];

const INTENT_OPTIONS: Array<{ value: LoanIntent; label: string }> = [
  { value: "PERSONAL", label: "Personal" },
  { value: "EDUCATION", label: "Education" },
  { value: "MEDICAL", label: "Medical" },
  { value: "VENTURE", label: "Business venture" },
  { value: "HOMEIMPROVEMENT", label: "Home improvement" },
  { value: "DEBTCONSOLIDATION", label: "Debt consolidation" },
];

const GRADE_OPTIONS: Array<{ value: LoanGrade; label: string }> = [
  { value: "A", label: "A — lowest risk" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "G", label: "G — highest risk" },
];

const DEFAULT_OPTIONS: Array<{ value: DefaultFlag; label: string }> = [
  { value: "N", label: "No record" },
  { value: "Y", label: "Yes — default on file" },
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
  const { addApplication } = useCredora();
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
      next.applicant_name = "Enter the applicant's full name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicant_email.trim())) {
      next.applicant_email = "Enter a valid email address.";
    }
    if (!Number.isFinite(age) || age < 18 || age > 80) {
      next.age = "Age must be between 18 and 80.";
    }
    if (!Number.isFinite(incomeValue) || incomeValue <= 0) {
      next.person_income = "Income must be greater than zero.";
    }
    if (!Number.isFinite(loanValue) || loanValue <= 0) {
      next.loan_amnt = "Loan amount must be greater than zero.";
    }
    if (!Number.isFinite(rate) || rate <= 0 || rate > 60) {
      next.loan_int_rate = "Interest rate must be between 0 and 60.";
    }
    if (!Number.isFinite(employment) || employment < 0 || employment > 60) {
      next.employment_length = "Employment length must be between 0 and 60 years.";
    }
    if (
      !Number.isFinite(creditHistory) ||
      creditHistory < 0 ||
      creditHistory > 80
    ) {
      next.cb_person_cred_hist_length =
        "Credit history length must be between 0 and 80 years.";
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
        applicant_name:
          "Unable to save the application. Please check the connection and try again.",
      }));
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in space-y-5">
      <PageHeader
        eyebrow="New record"
        title="Add Application"
        description="Capture the applicant, financial, and employment details required by the risk assessment model. Fields marked with * are required."
        actions={
          <Link href="/applications" className="btn-secondary">
            Cancel
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
                  Customer information
                </h2>
                <p className="text-[11px] text-muted">
                  Identity and household details of the applicant.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="applicant_name" className="label">
                  Full name *
                </label>
                <input
                  id="applicant_name"
                  value={form.applicant_name}
                  onChange={(event) => updateField("applicant_name", event.target.value)}
                  className="field"
                  placeholder="e.g. Aisyah Putri"
                />
                {errors.applicant_name && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.applicant_name}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="applicant_email" className="label">
                  Email address *
                </label>
                <input
                  id="applicant_email"
                  type="email"
                  value={form.applicant_email}
                  onChange={(event) => updateField("applicant_email", event.target.value)}
                  className="field"
                  placeholder="name@mail.com"
                />
                {errors.applicant_email && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.applicant_email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="age" className="label">
                  Age *
                </label>
                <input
                  id="age"
                  inputMode="numeric"
                  value={form.age}
                  onChange={(event) =>
                    updateField("age", event.target.value.replace(/[^\d]/g, ""))
                  }
                  className="field"
                  placeholder="e.g. 29"
                />
                {errors.age && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">{errors.age}</p>
                )}
              </div>

              <div>
                <label htmlFor="home_ownership" className="label">
                  Home ownership
                </label>
                <select
                  id="home_ownership"
                  value={form.home_ownership}
                  onChange={(event) =>
                    updateField("home_ownership", event.target.value)
                  }
                  className="field"
                >
                  {HOME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
                  Financial information
                </h2>
                <p className="text-[11px] text-muted">
                  Income, loan amount, and interest assumptions.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="person_income" className="label">
                  Annual income (IDR) *
                </label>
                <input
                  id="person_income"
                  inputMode="numeric"
                  value={form.person_income}
                  onChange={(event) =>
                    updateField("person_income", formatThousands(event.target.value))
                  }
                  className="field"
                  placeholder="e.g. 12.000.000"
                />
                {errors.person_income && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.person_income}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="loan_amnt" className="label">
                  Requested loan amount (IDR) *
                </label>
                <input
                  id="loan_amnt"
                  inputMode="numeric"
                  value={form.loan_amnt}
                  onChange={(event) =>
                    updateField("loan_amnt", formatThousands(event.target.value))
                  }
                  className="field"
                  placeholder="e.g. 5.000.000"
                />
                {errors.loan_amnt && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">{errors.loan_amnt}</p>
                )}
              </div>

              <div>
                <label htmlFor="loan_int_rate" className="label">
                  Loan interest rate (%) *
                </label>
                <input
                  id="loan_int_rate"
                  inputMode="decimal"
                  value={form.loan_int_rate}
                  onChange={(event) => updateField("loan_int_rate", event.target.value)}
                  className="field"
                  placeholder="e.g. 14.5"
                />
                {errors.loan_int_rate && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.loan_int_rate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="loan_intent" className="label">
                  Loan purpose
                </label>
                <select
                  id="loan_intent"
                  value={form.loan_intent}
                  onChange={(event) => updateField("loan_intent", event.target.value)}
                  className="field"
                >
                  {INTENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="loan_grade" className="label">
                  Loan grade *
                </label>
                <select
                  id="loan_grade"
                  value={form.loan_grade}
                  onChange={(event) => updateField("loan_grade", event.target.value)}
                  className="field"
                >
                  {GRADE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cb_person_cred_hist_length" className="label">
                  Credit history length (years) *
                </label>
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
                  placeholder="e.g. 5"
                />
                {errors.cb_person_cred_hist_length && (
                  <p className="mt-1 text-[11px] text-[#f3938f]">
                    {errors.cb_person_cred_hist_length}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="cb_person_default_on_file" className="label">
                  Historical default record
                </label>
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
                      {option.label}
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
                  Employment information
                </h2>
                <p className="text-[11px] text-muted">
                  Employment stability is a key risk signal.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="employment_length" className="label">
                  Employment length (years) *
                </label>
                <input
                  id="employment_length"
                  inputMode="decimal"
                  value={form.employment_length}
                  onChange={(event) =>
                    updateField("employment_length", event.target.value)
                  }
                  className="field"
                  placeholder="e.g. 3.5"
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
              Application summary
            </h2>
            <div className="mt-3 space-y-2.5">
              <SummaryRow label="Applicant" value={form.applicant_name || "—"} />
              <SummaryRow label="Annual income" value={income > 0 ? formatCurrency(income) : "—"} />
              <SummaryRow label="Loan amount" value={loan > 0 ? formatCurrency(loan) : "—"} />
              <SummaryRow
                label="Loan-to-income"
                value={ratio > 0 ? `${(ratio * 100).toFixed(1)}%` : "—"}
              />
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-muted">Form completion</span>
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
              {submitting ? "Saving..." : "Save Application"}
            </button>
            <Link
              href="/applications"
              className="mt-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:text-white"
            >
              Cancel and return
            </Link>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-2.5">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-risk-mid" />
              <div>
                <p className="text-[12px] font-medium text-white">
                  Field validation note
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Fields mirror the 22-feature LightGBM contract. Monetary inputs
                  are entered in IDR and converted to the model&apos;s USD-scale
                  before scoring. Do not enter real customer data into this demo
                  workspace.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-muted/60">
            <ArrowRightIcon className="h-3 w-3" />
            Saving opens the application detail page.
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
