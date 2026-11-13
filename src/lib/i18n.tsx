"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Period } from "./analytics";
import { setFormatLocale } from "./format";
import type {
  ApplicationStatus,
  FinalDecision,
  HomeOwnership,
  LoanIntent,
  ReviewStatus,
  RiskCategory,
} from "./types";

export type Locale = "en" | "id";

const STORAGE_KEY = "credora.locale";

type Dictionary = Record<string, string>;

const en: Dictionary = {
  "nav.overview": "Overview",
  "nav.applications": "Applications",
  "nav.portfolio": "Portfolio Analytics",
  "nav.underwriting": "Underwriting Reviews",
  "nav.settings": "Settings",

  "section.workspace": "Workspace",
  "section.applications": "Applications",
  "section.underwriting": "Underwriting Reviews",

  "page.overview": "Overview",
  "page.applications": "Applications",
  "page.addApplication": "Add Application",
  "page.riskAssessment": "Risk Assessment",
  "page.applicationDetail": "Application Detail",
  "page.underwriting": "Underwriting Reviews",
  "page.reviewDetail": "Review Detail",
  "page.portfolio": "Portfolio Analytics",
  "page.settings": "Settings",

  "common.view": "View",
  "common.viewAll": "View all",
  "common.cancel": "Cancel",
  "common.details": "Details",
  "common.notAssessed": "Not assessed",
  "common.years": "{value} years",
  "common.tagline": "Smarter Credit. Better Decisions.",
  "common.credoraUser": "Credora User",

  "sidebar.workspace": "Workspace",
  "sidebar.orgSubtitle": "PayLater risk operations",
  "sidebar.navigation": "Navigation",
  "sidebar.riskEngine": "Risk engine",
  "sidebar.online": "Online",
  "sidebar.logout": "Logout",

  "shell.closeNav": "Close navigation",
  "shell.footerLeft": "Credora · Credit Intelligence Platform",
  "shell.footerRight":
    "Predictions are decision support, not automated credit decisions.",

  "topbar.openNav": "Open navigation",
  "topbar.searchPlaceholder": "Search applications...",
  "topbar.searchAria": "Search applications",
  "topbar.demoData": "Demo data",
  "topbar.language": "Language",

  "loader.preparing": "Preparing workspace...",

  "login.badge": "Credit Risk Intelligence",
  "login.titleA": "Smarter credit.",
  "login.titleB": "Better decisions.",
  "login.intro":
    "Credora brings application management, AI-assisted default risk assessment, portfolio analytics, and underwriting review into a single workspace for PayLater teams.",
  "login.f1title": "Structured underwriting",
  "login.f1desc":
    "Keep applications, assessments, and review decisions in one workflow.",
  "login.f2title": "Portfolio visibility",
  "login.f2desc":
    "Monitor risk distribution and application trends from live records.",
  "login.f3title": "Human-led decisions",
  "login.f3desc":
    "Risk estimates support officers; final credit decisions stay with people.",
  "login.engine": "Credit risk engine",
  "login.isolation": "Organization-isolated workspace",
  "login.mvp": "MVP · v1.0",
  "login.secureAccess": "Secure access",
  "login.signInTitle": "Sign in to Credora",
  "login.signInSubtitle":
    "Use your organization account to continue to the risk workspace.",
  "login.workEmail": "Work email",
  "login.emailPlaceholder": "you@company.com",
  "login.password": "Password",
  "login.show": "Show",
  "login.hide": "Hide",
  "login.passwordPlaceholder": "Enter your password",
  "login.errRequired": "Email and password are required.",
  "login.errInvalid":
    "Email or password does not match a registered account.",
  "login.errReach": "Unable to reach the authentication service.",
  "login.errGeneric": "Unable to sign in.",
  "login.signingIn": "Signing in...",
  "login.signIn": "Sign in",
  "login.demoAccounts": "Demo accounts",
  "login.use": "Use",
  "login.demoPassword": "Demo password:",
  "login.demoSeededA": "Accounts are seeded with",
  "login.demoSeededB":
    "; change or remove them before a public deployment.",
  "login.footer": "Credora · Smarter Credit. Better Decisions.",
  "login.newHere": "New to Credora?",
  "login.createAccount": "Create an account",

  "landing.home": "Credora home",
  "landing.navFeatures": "Features",
  "landing.navWorkflow": "Workflow",
  "landing.navWhy": "Why Credora",
  "landing.signIn": "Sign in",
  "landing.getStarted": "Get started",
  "landing.openDashboard": "Open dashboard",
  "landing.badge": "Credit risk intelligence",
  "landing.titleA": "Smarter credit.",
  "landing.titleB": "Better decisions.",
  "landing.intro":
    "Credora brings application management, AI-assisted default risk assessment, portfolio analytics, and underwriting review into a single workspace for PayLater teams.",
  "landing.ctaPrimary": "Create an account",
  "landing.ctaSecondary": "Sign in",
  "landing.point1": "Organization-isolated data",
  "landing.point2": "AI-assisted risk signals",
  "landing.point3": "Human-led decisions",
  "landing.previewEyebrow": "Portfolio snapshot",
  "landing.previewTitle": "Risk workspace",
  "landing.previewTotal": "Total applications",
  "landing.previewTotalHint": "Seeded demo records",
  "landing.previewPending": "Pending review",
  "landing.previewPendingHint": "Awaiting underwriting",
  "landing.previewAssessed": "Assessed",
  "landing.previewAssessedHint": "With a risk score",
  "landing.previewHigh": "High risk",
  "landing.previewHighHint": "Share of assessed",
  "landing.previewDist": "Risk distribution",
  "landing.previewDistSub": "Latest assessment",
  "landing.previewGuardTitle": "Decision support only",
  "landing.previewGuardDesc": "Officers keep final authority",
  "landing.featuresEyebrow": "Capabilities",
  "landing.featuresTitle": "Everything underwriting needs",
  "landing.featuresIntro":
    "Move from raw applications to a recorded credit decision without stitching tools together.",
  "landing.workflowEyebrow": "Workflow",
  "landing.workflowTitle": "From application to decision",
  "landing.workflowIntro":
    "One consistent path for analysts and credit officers, with the assessment history kept alongside every application.",
  "landing.step1Title": "Capture",
  "landing.step1Desc":
    "Record applicant, financial, and employment details in a structured form.",
  "landing.step2Title": "Assess",
  "landing.step2Desc":
    "Generate a default probability, risk category, and contributing factors.",
  "landing.step3Title": "Review",
  "landing.step3Desc":
    "Verify supporting information and add underwriting notes.",
  "landing.step4Title": "Decide",
  "landing.step4Desc":
    "Record the final decision, reason, and updated application status.",
  "landing.whyEyebrow": "Why Credora",
  "landing.whyTitle": "Built for accountable credit teams",
  "landing.whyIntro":
    "Credora keeps risk estimates advisory and every decision attributable to a person, with data scoped to your organization.",
  "landing.why1Title": "Organization isolation",
  "landing.why1Desc":
    "Every record stays inside your organization's workspace.",
  "landing.why2Title": "Assessment history",
  "landing.why2Desc":
    "Every score is stored with the application it belongs to.",
  "landing.why3Title": "Clear guardrails",
  "landing.why3Desc":
    "Risk estimates inform; authorized officers decide.",
  "landing.why4Title": "Portfolio visibility",
  "landing.why4Desc":
    "Track risk distribution and status mix as records change.",
  "landing.ctaEyebrow": "Get started",
  "landing.ctaTitle": "Ready to bring structure to your credit operations?",
  "landing.ctaIntro":
    "Create a workspace, invite your team, and start recording applications and reviews in minutes.",
  "landing.ctaButton": "Create your workspace",
  "landing.footer": "Credora · Smarter Credit. Better Decisions.",

  "register.eyebrow": "Create your workspace",
  "register.title": "Start with Credora",
  "register.subtitle":
    "Set up your organization account to access the credit risk workspace.",
  "register.fullName": "Full name",
  "register.fullNamePlaceholder": "e.g. Rani Prameswari",
  "register.organization": "Organization name",
  "register.organizationPlaceholder": "e.g. Nusantara PayLater",
  "register.role": "Your role",
  "register.passwordPlaceholder": "At least 8 characters",
  "register.confirmPassword": "Confirm password",
  "register.confirmPasswordPlaceholder": "Re-enter your password",
  "register.submit": "Create account",
  "register.submitting": "Creating account...",
  "register.haveAccount": "Already have an account?",
  "register.signIn": "Sign in",
  "register.note":
    "New accounts start with an empty workspace. Add your first application to begin.",
  "register.errName": "Enter your full name.",
  "register.errOrg": "Enter your organization name.",
  "register.errEmail": "Enter a valid email address.",
  "register.errPassword": "Password must be at least 8 characters.",
  "register.errConfirm": "Passwords do not match.",
  "register.errExists": "An account with this email already exists.",
  "register.errSignIn":
    "Account created, but automatic sign-in failed. Please sign in.",
  "register.errGeneric": "Unable to create the account. Please try again.",

  "dash.eyebrow": "Dashboard",
  "dash.title": "Portfolio overview",
  "dash.description":
    "Monitor application flow and credit risk across the organization. {today}",
  "dash.viewPortfolio": "View portfolio",
  "dash.newApplication": "New application",
  "dash.statTotal": "Total Applications",
  "dash.hintTotal": "{count} awaiting first assessment",
  "dash.statPending": "Pending Review",
  "dash.hintPending": "Awaiting underwriting action",
  "dash.statAssessed": "Assessed",
  "dash.hintAssessed": "{percent}% of all applications",
  "dash.statHigh": "High Risk",
  "dash.hintHigh": "{percent}% of assessed portfolio",
  "dash.riskDistTitle": "Risk Portfolio Distribution",
  "dash.riskDistSubtitle": "Latest assessment per application",
  "dash.details": "Details",
  "dash.assessed": "Assessed",
  "dash.unassessedNote": "{count} applications have no assessment yet.",
  "dash.allAssessedNote": "Every application has at least one assessment.",
  "dash.trendTitle": "Application Trend",
  "dash.trendSubtitle": "{count} applications created in the last 6 months",
  "dash.monthly": "Monthly",
  "dash.recentTitle": "Recent Applications",
  "dash.recentSubtitle": "The most recently submitted applications.",
  "dash.empty": "No applications yet. Create the first application to begin.",

  "risk.Low Risk": "Low Risk",
  "risk.Medium Risk": "Medium Risk",
  "risk.High Risk": "High Risk",

  "status.Pending Review": "Pending Review",
  "status.Assessed": "Assessed",
  "status.Under Review": "Under Review",
  "status.Approved": "Approved",
  "status.Rejected": "Rejected",

  "reviewStatus.Pending": "Pending",
  "reviewStatus.In Review": "In Review",
  "reviewStatus.Completed": "Completed",

  "decision.Approved": "Approved",
  "decision.Rejected": "Rejected",
  "decision.Manual Review": "Manual Review",

  "home.RENT": "Rent",
  "home.OWN": "Own",
  "home.MORTGAGE": "Mortgage",
  "home.OTHER": "Other",

  "intent.PERSONAL": "Personal",
  "intent.EDUCATION": "Education",
  "intent.MEDICAL": "Medical",
  "intent.VENTURE": "Business venture",
  "intent.HOMEIMPROVEMENT": "Home improvement",
  "intent.DEBTCONSOLIDATION": "Debt consolidation",

  "role.Risk Analyst": "Risk Analyst",
  "role.Credit Officer": "Credit Officer",

  "perm.restrictedTitle": "Access restricted",
  "perm.createApps": "Only Risk Analysts can create applications.",
  "perm.assess": "Only Risk Analysts can run risk assessments.",
  "perm.decide":
    "Only Credit Officers can record the final credit decision. You can review the application and assessment details in read-only mode.",

  "period.30d": "Last 30 days",
  "period.90d": "Last 90 days",
  "period.year": "This year",
  "period.all": "All time",

  "factor.loan_percent_income": "Loan-to-income ratio",
  "factor.loan_int_rate": "Interest rate",
  "factor.employment_length": "Employment length",
  "factor.person_income": "Annual income",
  "factor.age": "Applicant age",
  "factor.home_ownership": "Home ownership",
  "factor.loan_intent": "Loan purpose",
  "factor.loan_grade": "Loan grade",
  "factor.cb_person_cred_hist_length": "Credit history length",
  "factor.cb_person_default_on_file": "Historical default",

  "chart.increasesRisk": "Increases risk",
  "chart.reducesRisk": "Reduces risk",
  "chart.defaultProbability": "Default probability",
  "chart.trendAria": "Application trend chart",

  "table.appId": "Application ID",
  "table.applicant": "Applicant",
  "table.applied": "Application date",
  "table.loanAmount": "Loan amount",
  "table.status": "Status",
  "table.risk": "Risk level",
  "table.action": "Action",
  "table.view": "View",
  "table.review": "Review",
  "table.notAssessed": "Not assessed",

  "notif.title": "Notifications",
  "notif.workspaceActivity": "Workspace activity",
  "notif.pendingCount": "{count} pending",
  "notif.allClear": "All clear",
  "notif.allCaught": "You're all caught up",
  "notif.noPending": "No pending assessments or reviews.",
  "notif.assessmentsPending": "Assessments pending",
  "notif.assessmentsPendingDesc":
    "{count} applications awaiting a first risk assessment.",
  "notif.queueTitle": "Underwriting queue",
  "notif.queueDesc":
    "{count} assessed applications need a recorded decision.",
  "notif.reviewsRecorded": "Reviews recorded",
  "notif.reviewsRecordedDesc":
    "{count} applications have a final decision on file.",
  "notif.openDashboard": "Open dashboard",
  "notif.aria": "Notifications",
  "notif.ariaPending": "Notifications, {count} items pending",

  "apps.eyebrow": "Credit operations",
  "apps.title": "Application Management",
  "apps.description":
    "Create, search, and track customer credit applications. Assessment results are attached to each application as a history.",
  "apps.add": "Add Application",
  "apps.searchPlaceholder":
    "Search by applicant name, email, or application ID...",
  "apps.searchAria": "Search applications",
  "apps.filterStatusAria": "Filter by status",
  "apps.allStatuses": "All statuses",
  "apps.filterRiskAria": "Filter by risk category",
  "apps.allRisk": "All risk levels",
  "apps.notAssessed": "Not assessed",
  "apps.found": "Applications found: {count}",
  "apps.clearFilters": "Clear filters",
  "apps.noMatchTitle": "No applications match",
  "apps.noMatchDesc":
    "Adjust the search term or filters, or create a new credit application.",
  "apps.resetFilters": "Reset filters",
  "apps.showing": "Showing {start}–{end} of {total}",
  "apps.pageOf": "Page {page} of {total}",
  "apps.prev": "Previous page",
  "apps.next": "Next page",

  "newapp.eyebrow": "New record",
  "newapp.title": "Add Application",
  "newapp.description":
    "Enter the applicant's details to create a new credit application. Fields marked with * are required.",
  "newapp.cancel": "Cancel",
  "newapp.customerInfo": "Customer information",
  "newapp.customerInfoDesc":
    "Applicant identity and living situation.",
  "newapp.fullName": "Full name *",
  "newapp.fullNamePlaceholder": "e.g. Aisyah Putri",
  "newapp.email": "Email address *",
  "newapp.emailPlaceholder": "name@mail.com",
  "newapp.age": "Age *",
  "newapp.agePlaceholder": "e.g. 29",
  "newapp.homeOwnership": "Home ownership",
  "newapp.financialInfo": "Financial information",
  "newapp.financialInfoDesc":
    "Income, loan request, and repayment indicators.",
  "newapp.annualIncome": "Annual income (IDR) *",
  "newapp.incomePlaceholder": "e.g. 12.000.000",
  "newapp.loanAmount": "Requested loan amount (IDR) *",
  "newapp.loanPlaceholder": "e.g. 5.000.000",
  "newapp.interestRate": "Loan interest rate (%) *",
  "newapp.interestPlaceholder": "e.g. 14.5",
  "newapp.loanPurpose": "Loan purpose",
  "newapp.loanGrade": "Loan grade *",
  "newapp.gradeA": "A — lowest risk",
  "newapp.gradeG": "G — highest risk",
  "newapp.creditHistory": "Credit history length (years) *",
  "newapp.creditHistoryPlaceholder": "e.g. 5",
  "newapp.historicalDefault": "Historical default record",
  "newapp.defaultNo": "No record",
  "newapp.defaultYes": "Yes — default on file",
  "newapp.employmentInfo": "Employment information",
  "newapp.employmentInfoDesc":
    "Job stability helps estimate repayment capacity.",
  "newapp.employmentLength": "Employment length (years) *",
  "newapp.employmentPlaceholder": "e.g. 3.5",
  "newapp.summary": "Application summary",
  "newapp.applicant": "Applicant",
  "newapp.annualIncomeShort": "Annual income",
  "newapp.loanAmountShort": "Loan amount",
  "newapp.loanToIncome": "Loan-to-income",
  "newapp.completion": "Form completion",
  "newapp.save": "Save Application",
  "newapp.saving": "Saving...",
  "newapp.cancelReturn": "Cancel and return",
  "newapp.validationNote": "Field validation note",
  "newapp.validationDesc":
    "Check that income, loan amount, and interest rate are entered correctly before saving. Do not enter real customer data in this demo workspace.",
  "newapp.savingOpens": "Saving opens the application detail page.",
  "newapp.errName": "Enter the applicant's full name.",
  "newapp.errEmail": "Enter a valid email address.",
  "newapp.errAge": "Age must be between 18 and 80.",
  "newapp.errIncome": "Income must be greater than zero.",
  "newapp.errLoan": "Loan amount must be greater than zero.",
  "newapp.errRate": "Interest rate must be between 0 and 60.",
  "newapp.errEmployment":
    "Employment length must be between 0 and 60 years.",
  "newapp.errCreditHistory":
    "Credit history length must be between 0 and 80 years.",
  "newapp.errSave":
    "Unable to save the application. Please check the connection and try again.",

  "detail.notFoundTitle": "Application not found",
  "detail.notFoundDesc":
    "The requested application is not available in this workspace. It may have been removed or the link is incorrect.",
  "detail.backToApps": "Back to Applications",
  "detail.applied": "Applied {date}",
  "detail.lastUpdated": "Last updated {date}",
  "detail.openReview": "Open review",
  "detail.assessing": "Assessing...",
  "detail.rerun": "Re-run Assessment",
  "detail.run": "Run Risk Assessment",
  "detail.customerInfo": "Customer information",
  "detail.customerInfoSub": "Identity and household details",
  "detail.fullName": "Full name",
  "detail.email": "Email address",
  "detail.age": "Age",
  "detail.homeOwnership": "Home ownership",
  "detail.financialInfo": "Financial information",
  "detail.financialInfoSub": "Loan request and repayment indicators",
  "detail.annualIncome": "Annual income",
  "detail.loanAmount": "Requested loan amount",
  "detail.interestRate": "Interest rate",
  "detail.loanToIncome": "Loan-to-income",
  "detail.loanPurpose": "Loan purpose",
  "detail.loanGrade": "Loan grade",
  "detail.creditHistory": "Credit history length",
  "detail.employmentInfo": "Employment information",
  "detail.employmentInfoSub":
    "Job stability and past credit behavior",
  "detail.employmentLength": "Employment length",
  "detail.historicalDefault": "Historical default",
  "detail.defaultYes": "Yes — default on file",
  "detail.defaultNo": "No record",
  "detail.organization": "Organization",
  "detail.assessmentHistory": "Assessment history",
  "detail.recordsCount": "Assessments recorded: {count}",
  "detail.noAssessment":
    "No risk assessment has been recorded for this application yet.",
  "detail.latest": "Latest",
  "detail.defaultProb": "Default probability",
  "detail.viewResult": "View result",
  "detail.appStatus": "Application status",
  "detail.appId": "Application ID",
  "detail.appliedOn": "Applied on",
  "detail.createdBy": "Created by",
  "detail.latestAssessment": "Latest assessment",
  "detail.gaugeCaption":
    "Estimated default probability for the requested PayLater exposure. Use with review notes, not as an automatic decision.",
  "detail.viewFull": "View full result",
  "detail.underwritingReview": "Underwriting review",
  "detail.awaitingTitle": "Awaiting assessment",
  "detail.awaitingDesc":
    "Run the risk assessment to generate a default probability, risk category, and contributing factors for this application.",
  "detail.decisionSupport": "Decision support",
  "detail.decisionSupportDesc":
    "Risk estimates are guidance. Final approval or rejection must be recorded by an authorized Credit Officer after manual review.",

  "assess.notFoundTitle": "Application not found",
  "assess.notFoundDesc":
    "The requested application is not available in this workspace.",
  "assess.noAssessmentFor":
    "No assessment has been recorded for {name} yet.",
  "assess.noAvailableTitle": "No assessment available",
  "assess.noAvailableDesc":
    "Run the risk assessment to generate a default probability, risk category, and contributing factors.",
  "assess.run": "Run Risk Assessment",
  "assess.backToDetail": "Back to Application Detail",
  "assess.eyebrowResult": "Assessment result",
  "assess.title": "Credit Risk Assessment",
  "assess.description":
    "{name} · Assessed {date} · Assessments on record: {count}",
  "assess.assessing": "Assessing...",
  "assess.rerun": "Re-run",
  "assess.continueReview": "Continue to Review",
  "assess.defaultProb": "Default probability",
  "assess.riskCategory": "Risk category",
  "assess.assessedAt": "Assessed at",
  "assess.thresholdLow": "Low risk",
  "assess.thresholdMedium": "Medium risk",
  "assess.thresholdHigh": "High risk",
  "assess.summaryLow":
    "The estimated default probability is below the low-risk threshold. Routine handling is appropriate, while the officer still records the final decision.",
  "assess.summaryMedium":
    "The estimate sits in the medium-risk band. Consider repayment capacity, employment stability, and supporting documents before deciding.",
  "assess.summaryHigh":
    "The estimate is above the high-risk threshold. A detailed manual review and additional verification are recommended before approval.",
  "assess.contributing": "Contributing factors",
  "assess.contributingSub":
    "The main factors that increased or reduced the estimated risk",
  "assess.noFactors":
    "No dominant factors were identified for this application.",
  "assess.modelInfo": "Assessment information",
  "assess.modelInfoSub": "How this result was produced",
  "assess.model": "Model",
  "assess.version": "Version",
  "assess.output": "Result type",
  "assess.outputValue": "Estimated probability of default",
  "assess.assessedBy": "Assessed by",
  "assess.caveat":
    "This estimate supports your review; it does not replace it. Always check the applicant's documents and repayment capacity before deciding.",
  "assess.appSummary": "Application summary",
  "assess.applicant": "Applicant",
  "assess.appId": "Application ID",
  "assess.loanAmount": "Loan amount",
  "assess.annualIncome": "Annual income",
  "assess.loanToIncome": "Loan-to-income",
  "assess.interestRate": "Interest rate",
  "assess.officerTitle": "You make the final decision",
  "assess.officerDesc":
    "Continue to the underwriting review to add notes, select the final decision, and record the reason.",
  "assess.backToApp": "Back to application",

  "port.eyebrow": "Analytics",
  "port.title": "Portfolio Analytics",
  "port.description":
    "Application volume, risk mix, and review status for the selected period.",
  "port.periodAria": "Select period",
  "port.total": "Total Applications",
  "port.assessed": "Assessed",
  "port.hintAssessed": "{percent}% of applications in period",
  "port.avgProb": "Avg. default probability",
  "port.hintAvg": "Average of the latest assessment per application",
  "port.highShare": "High Risk share",
  "port.hintHigh": "{count} high-risk applications",
  "port.riskDist": "Risk Distribution",
  "port.riskDistSub": "Latest assessment per application in period",
  "port.noAssessed": "No assessed applications in this period.",
  "port.excluded":
    "{count} applications in this period have no assessment and are excluded from the distribution.",
  "port.appStatus": "Application Status",
  "port.appStatusSub": "Status mix for applications in period",
  "port.noApps": "No applications in this period.",
  "port.statusNote":
    "Status totals come from the current application records. Approved and rejected counts reflect recorded review decisions.",
  "port.riskSummary": "Risk category summary",
  "port.assessedIn": "{count} assessed in {period}",
  "port.shareOfAssessed": "{percent}% of assessed applications",
  "port.footer":
    "Data reflects the current workspace and updates immediately after assessments or reviews are saved.",
  "port.source": "Source: live workspace data",

  "settings.eyebrow": "Account",
  "settings.title": "Settings",
  "settings.description":
    "Manage your profile and demo workspace.",
  "settings.active": "Active session",
  "settings.profileInfo": "Profile information",
  "settings.profileInfoSub":
    "Update the display name and contact email used in this workspace.",
  "settings.fullName": "Full name",
  "settings.email": "Email address",
  "settings.profileUpdated": "Profile updated.",
  "settings.saveChanges": "Save changes",
  "settings.security": "Account security",
  "settings.securitySub": "How your account is protected.",
  "settings.securityDesc":
    "Use a unique password and sign out on shared devices. Contact your administrator if you notice unusual account activity.",
  "settings.demoControls": "Demo data controls",
  "settings.demoControlsSub":
    "Reset the workspace to the seeded illustrative dataset.",
  "settings.demoWarning":
    "Resetting removes all applications, assessments, and reviews, then restores the original demo records.",
  "settings.demoRestored": "Demo data restored.",
  "settings.confirmReset": "Confirm reset",
  "settings.resetDemo": "Reset demo data",
  "settings.cancel": "Cancel",
  "settings.signOut": "Sign out",
  "settings.signOutSub": "End the current workspace session.",
  "settings.logout": "Logout",

  "uw.eyebrow": "Manual review",
  "uw.title": "Underwriting Reviews",
  "uw.description":
    "Review assessed applications, verify supporting information, and record the final credit decision with a clear reason.",
  "uw.allApps": "All applications",
  "uw.awaitingAction": "Awaiting action",
  "uw.completedReviews": "Completed reviews",
  "uw.assessedApps": "Assessed applications",
  "uw.searchPlaceholder": "Search by applicant or application ID...",
  "uw.searchAria": "Search reviews",
  "uw.filterAria": "Filter by review status",
  "uw.allStatuses": "All review statuses",
  "uw.rowsShown": "Reviews shown: {count}",
  "uw.sorted": "Sorted by latest assessment",
  "uw.nothingTitle": "Nothing to review",
  "uw.nothingDesc":
    "Assessed applications will appear here for manual underwriting review.",
  "uw.goApps": "Go to Applications",
  "uw.colReviewStatus": "Review status",

  "uwDetail.notFoundTitle": "Application not found",
  "uwDetail.notFoundDesc":
    "The requested application is not available in this workspace.",
  "uwDetail.backToReviews": "Back to Reviews",
  "uwDetail.backToUnderwriting": "Back to Underwriting Reviews",
  "uwDetail.eyebrowReview": "Underwriting review",
  "uwDetail.applicationDetail": "Application detail",
  "uwDetail.assessmentRequired": "Assessment required",
  "uwDetail.assessmentRequiredDesc":
    "This application does not have a risk assessment yet. Run an assessment before recording an underwriting decision.",
  "uwDetail.predictionResult": "Risk assessment",
  "uwDetail.defaultProb": "Default probability",
  "uwDetail.appCustomerInfo": "Application and customer information",
  "uwDetail.verify":
    "Verify this information against supporting documents.",
  "uwDetail.fullName": "Full name",
  "uwDetail.email": "Email",
  "uwDetail.age": "Age",
  "uwDetail.homeOwnership": "Home ownership",
  "uwDetail.annualIncome": "Annual income",
  "uwDetail.loanAmount": "Loan amount",
  "uwDetail.interestRate": "Interest rate",
  "uwDetail.loanToIncome": "Loan-to-income",
  "uwDetail.loanPurpose": "Loan purpose",
  "uwDetail.employmentLength": "Employment length",
  "uwDetail.recordDecision": "Record review decision",
  "uwDetail.recordDecisionSub":
    "You make the final decision based on your review.",
  "uwDetail.reviewNotes": "Review notes",
  "uwDetail.reviewNotesPlaceholder":
    "Record verification steps, supporting documents, and observations.",
  "uwDetail.finalDecision": "Final decision *",
  "uwDetail.selectDecision": "Select a decision",
  "uwDetail.statusAfterSave": "Review status after save",
  "uwDetail.decisionReason": "Decision reason *",
  "uwDetail.decisionReasonPlaceholder":
    "Explain the reason for the final decision.",
  "uwDetail.errDecision":
    "Select a final decision before saving the review.",
  "uwDetail.errReason":
    "Provide a decision reason of at least 10 characters.",
  "uwDetail.errSave": "Unable to save the review. Please try again.",
  "uwDetail.saved":
    "Review saved. The application status has been updated.",
  "uwDetail.saveReview": "Save Review",
  "uwDetail.viewAssessment": "View assessment result",
  "uwDetail.reviewContext": "Review context",
  "uwDetail.appId": "Application ID",
  "uwDetail.status": "Status",
  "uwDetail.riskCategory": "Risk category",
  "uwDetail.assessedAt": "Assessed at",
  "uwDetail.assessedBy": "Assessed by",
  "uwDetail.latestReview": "Latest review",
  "uwDetail.notes": "Notes",
  "uwDetail.decisionReasonLabel": "Decision reason",
  "uwDetail.reviewedAt": "Reviewed at",
  "uwDetail.humanTitle": "Human accountability",
  "uwDetail.humanDesc":
    "Record a clear reason for every decision. Review notes are saved with the application.",
  "uwDetail.guardrails": "Decision guardrails",
  "uwDetail.guardrail1": "The risk estimate is a guide, not an automatic decision.",
  "uwDetail.guardrail2": "Verify customer data before deciding.",
  "uwDetail.guardrail3": "Each decision and reason is saved.",

  "hint.loanGrade":
    "A–G grade set by the lender's credit policy. A is the lowest risk and G is the highest.",
  "hint.interestRate":
    "The annual interest rate charged on the loan. A higher rate usually means higher risk.",
  "hint.loanToIncome":
    "Loan amount divided by annual income. A higher ratio means the loan is large relative to income.",
  "hint.creditHistory":
    "How long the applicant has had a credit record, in years.",
  "hint.historicalDefault":
    "Whether the applicant has a past default recorded by a credit bureau.",
  "hint.employmentLength":
    "How long the applicant has been in their current job, in years.",
  "hint.homeOwnership":
    "Whether the applicant rents, owns, has a mortgage, or has another living arrangement.",
  "hint.loanPurpose":
    "The intended use of the loan, such as personal, education, or medical.",
  "hint.annualIncome":
    "The applicant's total income per year before tax, in rupiah.",
  "hint.loanAmount":
    "The amount the applicant wants to borrow, in rupiah.",
  "hint.defaultProbability":
    "Estimated chance that this borrower will fail to repay. Lower is safer.",
  "hint.riskCategory":
    "Low, medium, or high risk, based on the default probability band.",

  "demo.workspace": "Demo workspace.",
  "demo.desc":
    "Records are illustrative, and predictions are decision support only — final credit decisions remain with authorized officers.",
};

const id: Dictionary = {
  "nav.overview": "Ringkasan",
  "nav.applications": "Aplikasi",
  "nav.portfolio": "Analitik Portofolio",
  "nav.underwriting": "Tinjauan Underwriting",
  "nav.settings": "Pengaturan",

  "section.workspace": "Ruang Kerja",
  "section.applications": "Aplikasi",
  "section.underwriting": "Tinjauan Underwriting",

  "page.overview": "Ringkasan",
  "page.applications": "Aplikasi",
  "page.addApplication": "Tambah Aplikasi",
  "page.riskAssessment": "Penilaian Risiko",
  "page.applicationDetail": "Detail Aplikasi",
  "page.underwriting": "Tinjauan Underwriting",
  "page.reviewDetail": "Detail Tinjauan",
  "page.portfolio": "Analitik Portofolio",
  "page.settings": "Pengaturan",

  "common.view": "Lihat",
  "common.viewAll": "Lihat semua",
  "common.cancel": "Batal",
  "common.details": "Detail",
  "common.notAssessed": "Belum dinilai",
  "common.years": "{value} tahun",
  "common.tagline": "Kredit Lebih Cerdas. Keputusan Lebih Baik.",
  "common.credoraUser": "Pengguna Credora",

  "sidebar.workspace": "Ruang Kerja",
  "sidebar.orgSubtitle": "Operasional risiko PayLater",
  "sidebar.navigation": "Navigasi",
  "sidebar.riskEngine": "Mesin risiko",
  "sidebar.online": "Daring",
  "sidebar.logout": "Keluar",

  "shell.closeNav": "Tutup navigasi",
  "shell.footerLeft": "Credora · Platform Intelijen Kredit",
  "shell.footerRight":
    "Prediksi adalah pendukung keputusan, bukan keputusan kredit otomatis.",

  "topbar.openNav": "Buka navigasi",
  "topbar.searchPlaceholder": "Cari aplikasi...",
  "topbar.searchAria": "Cari aplikasi",
  "topbar.demoData": "Data demo",
  "topbar.language": "Bahasa",

  "loader.preparing": "Menyiapkan ruang kerja...",

  "login.badge": "Intelijen Risiko Kredit",
  "login.titleA": "Kredit lebih cerdas.",
  "login.titleB": "Keputusan lebih baik.",
  "login.intro":
    "Credora menyatukan pengelolaan aplikasi, penilaian risiko gagal bayar berbantuan AI, analitik portofolio, dan tinjauan underwriting dalam satu ruang kerja untuk tim PayLater.",
  "login.f1title": "Underwriting terstruktur",
  "login.f1desc":
    "Simpan aplikasi, penilaian, dan keputusan tinjauan dalam satu alur kerja.",
  "login.f2title": "Visibilitas portofolio",
  "login.f2desc":
    "Pantau distribusi risiko dan tren aplikasi dari data terkini.",
  "login.f3title": "Keputusan dipimpin manusia",
  "login.f3desc":
    "Perkiraan risiko mendukung petugas; keputusan kredit akhir tetap di tangan manusia.",
  "login.engine": "Mesin risiko kredit",
  "login.isolation": "Ruang kerja terisolasi per organisasi",
  "login.mvp": "MVP · v1.0",
  "login.secureAccess": "Akses aman",
  "login.signInTitle": "Masuk ke Credora",
  "login.signInSubtitle":
    "Gunakan akun organisasi Anda untuk melanjutkan ke ruang kerja risiko.",
  "login.workEmail": "Email kantor",
  "login.emailPlaceholder": "anda@perusahaan.com",
  "login.password": "Kata sandi",
  "login.show": "Tampilkan",
  "login.hide": "Sembunyikan",
  "login.passwordPlaceholder": "Masukkan kata sandi Anda",
  "login.errRequired": "Email dan kata sandi wajib diisi.",
  "login.errInvalid":
    "Email atau kata sandi tidak cocok dengan akun terdaftar.",
  "login.errReach": "Tidak dapat menghubungi layanan autentikasi.",
  "login.errGeneric": "Tidak dapat masuk.",
  "login.signingIn": "Sedang masuk...",
  "login.signIn": "Masuk",
  "login.demoAccounts": "Akun demo",
  "login.use": "Pakai",
  "login.demoPassword": "Kata sandi demo:",
  "login.demoSeededA": "Akun diisi dengan",
  "login.demoSeededB": "; ubah atau hapus sebelum penerapan publik.",
  "login.footer": "Credora · Kredit Lebih Cerdas. Keputusan Lebih Baik.",
  "login.newHere": "Baru di Credora?",
  "login.createAccount": "Buat akun",

  "landing.home": "Beranda Credora",
  "landing.navFeatures": "Fitur",
  "landing.navWorkflow": "Alur kerja",
  "landing.navWhy": "Mengapa Credora",
  "landing.signIn": "Masuk",
  "landing.getStarted": "Mulai",
  "landing.openDashboard": "Buka dasbor",
  "landing.badge": "Intelijen risiko kredit",
  "landing.titleA": "Kredit lebih cerdas.",
  "landing.titleB": "Keputusan lebih baik.",
  "landing.intro":
    "Credora menyatukan pengelolaan aplikasi, penilaian risiko gagal bayar berbantuan AI, analitik portofolio, dan tinjauan underwriting dalam satu ruang kerja untuk tim PayLater.",
  "landing.ctaPrimary": "Buat akun",
  "landing.ctaSecondary": "Masuk",
  "landing.point1": "Data terisolasi per organisasi",
  "landing.point2": "Sinyal risiko berbantuan AI",
  "landing.point3": "Keputusan dipimpin manusia",
  "landing.previewEyebrow": "Ringkasan portofolio",
  "landing.previewTitle": "Ruang kerja risiko",
  "landing.previewTotal": "Total aplikasi",
  "landing.previewTotalHint": "Catatan demo terisi",
  "landing.previewPending": "Menunggu peninjauan",
  "landing.previewPendingHint": "Menunggu underwriting",
  "landing.previewAssessed": "Dinilai",
  "landing.previewAssessedHint": "Memiliki skor risiko",
  "landing.previewHigh": "Risiko tinggi",
  "landing.previewHighHint": "Porsi yang dinilai",
  "landing.previewDist": "Distribusi risiko",
  "landing.previewDistSub": "Penilaian terbaru",
  "landing.previewGuardTitle": "Hanya dukungan keputusan",
  "landing.previewGuardDesc": "Petugas tetap berwenang",
  "landing.featuresEyebrow": "Kemampuan",
  "landing.featuresTitle": "Semua kebutuhan underwriting",
  "landing.featuresIntro":
    "Berpindah dari aplikasi mentah ke keputusan kredit tercatat tanpa menyatukan banyak alat.",
  "landing.workflowEyebrow": "Alur kerja",
  "landing.workflowTitle": "Dari aplikasi hingga keputusan",
  "landing.workflowIntro":
    "Satu jalur konsisten untuk analis dan petugas kredit, dengan riwayat penilaian tersimpan bersama setiap aplikasi.",
  "landing.step1Title": "Catat",
  "landing.step1Desc":
    "Rekam detail pemohon, keuangan, dan pekerjaan dalam formulir terstruktur.",
  "landing.step2Title": "Nilai",
  "landing.step2Desc":
    "Hasilkan probabilitas gagal bayar, kategori risiko, dan faktor yang mempengaruhi.",
  "landing.step3Title": "Tinjau",
  "landing.step3Desc":
    "Verifikasi informasi pendukung dan tambahkan catatan underwriting.",
  "landing.step4Title": "Putuskan",
  "landing.step4Desc":
    "Catat keputusan akhir, alasan, dan status aplikasi terbaru.",
  "landing.whyEyebrow": "Mengapa Credora",
  "landing.whyTitle": "Dibangun untuk tim kredit yang akuntabel",
  "landing.whyIntro":
    "Credora menjadikan perkiraan risiko sebagai saran dan setiap keputusan dapat dilacak ke orangnya, dengan data terbatas pada organisasi Anda.",
  "landing.why1Title": "Isolasi organisasi",
  "landing.why1Desc": "Setiap catatan tetap berada di ruang kerja organisasi Anda.",
  "landing.why2Title": "Riwayat penilaian",
  "landing.why2Desc": "Setiap skor disimpan bersama aplikasi terkait.",
  "landing.why3Title": "Guardrail yang jelas",
  "landing.why3Desc": "Perkiraan risiko memberi masukan; petugas berwenang memutuskan.",
  "landing.why4Title": "Visibilitas portofolio",
  "landing.why4Desc":
    "Pantau distribusi risiko dan komposisi status saat data berubah.",
  "landing.ctaEyebrow": "Mulai sekarang",
  "landing.ctaTitle": "Siap menata operasi kredit Anda?",
  "landing.ctaIntro":
    "Buat ruang kerja, undang tim, dan mulai mencatat aplikasi serta tinjauan dalam hitungan menit.",
  "landing.ctaButton": "Buat ruang kerja",
  "landing.footer": "Credora · Kredit Lebih Cerdas. Keputusan Lebih Baik.",

  "register.eyebrow": "Buat ruang kerja Anda",
  "register.title": "Mulai dengan Credora",
  "register.subtitle":
    "Siapkan akun organisasi Anda untuk mengakses ruang kerja risiko kredit.",
  "register.fullName": "Nama lengkap",
  "register.fullNamePlaceholder": "mis. Rani Prameswari",
  "register.organization": "Nama organisasi",
  "register.organizationPlaceholder": "mis. Nusantara PayLater",
  "register.role": "Peran Anda",
  "register.passwordPlaceholder": "Minimal 8 karakter",
  "register.confirmPassword": "Konfirmasi kata sandi",
  "register.confirmPasswordPlaceholder": "Masukkan ulang kata sandi",
  "register.submit": "Buat akun",
  "register.submitting": "Membuat akun...",
  "register.haveAccount": "Sudah punya akun?",
  "register.signIn": "Masuk",
  "register.note":
    "Akun baru dimulai dengan ruang kerja kosong. Tambahkan aplikasi pertama untuk memulai.",
  "register.errName": "Masukkan nama lengkap Anda.",
  "register.errOrg": "Masukkan nama organisasi Anda.",
  "register.errEmail": "Masukkan alamat email yang valid.",
  "register.errPassword": "Kata sandi minimal 8 karakter.",
  "register.errConfirm": "Kata sandi tidak cocok.",
  "register.errExists": "Akun dengan email ini sudah ada.",
  "register.errSignIn":
    "Akun dibuat, tetapi masuk otomatis gagal. Silakan masuk.",
  "register.errGeneric": "Tidak dapat membuat akun. Silakan coba lagi.",

  "dash.eyebrow": "Dasbor",
  "dash.title": "Ringkasan portofolio",
  "dash.description":
    "Pantau alur aplikasi dan risiko kredit di seluruh organisasi. {today}",
  "dash.viewPortfolio": "Lihat portofolio",
  "dash.newApplication": "Aplikasi baru",
  "dash.statTotal": "Total Aplikasi",
  "dash.hintTotal": "{count} menunggu penilaian pertama",
  "dash.statPending": "Menunggu Peninjauan",
  "dash.hintPending": "Menunggu tindakan underwriting",
  "dash.statAssessed": "Dinilai",
  "dash.hintAssessed": "{percent}% dari semua aplikasi",
  "dash.statHigh": "Risiko Tinggi",
  "dash.hintHigh": "{percent}% dari portofolio yang dinilai",
  "dash.riskDistTitle": "Distribusi Risiko Portofolio",
  "dash.riskDistSubtitle": "Penilaian terbaru per aplikasi",
  "dash.details": "Detail",
  "dash.assessed": "Dinilai",
  "dash.unassessedNote": "{count} aplikasi belum memiliki penilaian.",
  "dash.allAssessedNote": "Setiap aplikasi memiliki setidaknya satu penilaian.",
  "dash.trendTitle": "Tren Aplikasi",
  "dash.trendSubtitle": "{count} aplikasi dibuat dalam 6 bulan terakhir",
  "dash.monthly": "Bulanan",
  "dash.recentTitle": "Aplikasi Terbaru",
  "dash.recentSubtitle": "Aplikasi yang paling baru diajukan.",
  "dash.empty": "Belum ada aplikasi. Buat aplikasi pertama untuk memulai.",

  "risk.Low Risk": "Risiko Rendah",
  "risk.Medium Risk": "Risiko Sedang",
  "risk.High Risk": "Risiko Tinggi",

  "status.Pending Review": "Menunggu Peninjauan",
  "status.Assessed": "Dinilai",
  "status.Under Review": "Dalam Peninjauan",
  "status.Approved": "Disetujui",
  "status.Rejected": "Ditolak",

  "reviewStatus.Pending": "Menunggu",
  "reviewStatus.In Review": "Dalam Peninjauan",
  "reviewStatus.Completed": "Selesai",

  "decision.Approved": "Disetujui",
  "decision.Rejected": "Ditolak",
  "decision.Manual Review": "Peninjauan Manual",

  "home.RENT": "Sewa",
  "home.OWN": "Milik Sendiri",
  "home.MORTGAGE": "KPR",
  "home.OTHER": "Lainnya",

  "intent.PERSONAL": "Pribadi",
  "intent.EDUCATION": "Pendidikan",
  "intent.MEDICAL": "Medis",
  "intent.VENTURE": "Modal usaha",
  "intent.HOMEIMPROVEMENT": "Renovasi rumah",
  "intent.DEBTCONSOLIDATION": "Konsolidasi utang",

  "role.Risk Analyst": "Analis Risiko",
  "role.Credit Officer": "Petugas Kredit",

  "perm.restrictedTitle": "Akses dibatasi",
  "perm.createApps": "Hanya Analis Risiko yang dapat membuat aplikasi.",
  "perm.assess": "Hanya Analis Risiko yang dapat menjalankan penilaian risiko.",
  "perm.decide":
    "Hanya Petugas Kredit yang dapat mencatat keputusan kredit akhir. Anda tetap dapat meninjau detail aplikasi dan penilaian secara hanya-baca.",

  "period.30d": "30 hari terakhir",
  "period.90d": "90 hari terakhir",
  "period.year": "Tahun ini",
  "period.all": "Sepanjang waktu",

  "factor.loan_percent_income": "Rasio pinjaman terhadap pendapatan",
  "factor.loan_int_rate": "Suku bunga",
  "factor.employment_length": "Lama bekerja",
  "factor.person_income": "Pendapatan tahunan",
  "factor.age": "Usia pemohon",
  "factor.home_ownership": "Status tempat tinggal",
  "factor.loan_intent": "Tujuan pinjaman",
  "factor.loan_grade": "Peringkat pinjaman",
  "factor.cb_person_cred_hist_length": "Lama riwayat kredit",
  "factor.cb_person_default_on_file": "Riwayat gagal bayar",

  "chart.increasesRisk": "Menaikkan risiko",
  "chart.reducesRisk": "Menurunkan risiko",
  "chart.defaultProbability": "Probabilitas gagal bayar",
  "chart.trendAria": "Grafik tren aplikasi",

  "table.appId": "ID Aplikasi",
  "table.applicant": "Pemohon",
  "table.applied": "Tanggal aplikasi",
  "table.loanAmount": "Jumlah pinjaman",
  "table.status": "Status",
  "table.risk": "Tingkat risiko",
  "table.action": "Aksi",
  "table.view": "Lihat",
  "table.review": "Tinjau",
  "table.notAssessed": "Belum dinilai",

  "notif.title": "Notifikasi",
  "notif.workspaceActivity": "Aktivitas ruang kerja",
  "notif.pendingCount": "{count} tertunda",
  "notif.allClear": "Semua beres",
  "notif.allCaught": "Semua sudah tertangani",
  "notif.noPending": "Tidak ada penilaian atau tinjauan tertunda.",
  "notif.assessmentsPending": "Penilaian tertunda",
  "notif.assessmentsPendingDesc":
    "{count} aplikasi menunggu penilaian risiko pertama.",
  "notif.queueTitle": "Antrean underwriting",
  "notif.queueDesc":
    "{count} aplikasi yang dinilai memerlukan keputusan tercatat.",
  "notif.reviewsRecorded": "Tinjauan tercatat",
  "notif.reviewsRecordedDesc":
    "{count} aplikasi memiliki keputusan akhir.",
  "notif.openDashboard": "Buka dasbor",
  "notif.aria": "Notifikasi",
  "notif.ariaPending": "Notifikasi, {count} item tertunda",

  "apps.eyebrow": "Operasi kredit",
  "apps.title": "Manajemen Aplikasi",
  "apps.description":
    "Buat, cari, dan lacak aplikasi kredit pelanggan. Hasil penilaian terlampir pada setiap aplikasi sebagai riwayat.",
  "apps.add": "Tambah Aplikasi",
  "apps.searchPlaceholder":
    "Cari berdasarkan nama pemohon, email, atau ID aplikasi...",
  "apps.searchAria": "Cari aplikasi",
  "apps.filterStatusAria": "Filter berdasarkan status",
  "apps.allStatuses": "Semua status",
  "apps.filterRiskAria": "Filter berdasarkan kategori risiko",
  "apps.allRisk": "Semua tingkat risiko",
  "apps.notAssessed": "Belum dinilai",
  "apps.found": "Aplikasi ditemukan: {count}",
  "apps.clearFilters": "Hapus filter",
  "apps.noMatchTitle": "Tidak ada aplikasi yang cocok",
  "apps.noMatchDesc":
    "Sesuaikan kata pencarian atau filter, atau buat aplikasi kredit baru.",
  "apps.resetFilters": "Atur ulang filter",
  "apps.showing": "Menampilkan {start}–{end} dari {total}",
  "apps.pageOf": "Halaman {page} dari {total}",
  "apps.prev": "Halaman sebelumnya",
  "apps.next": "Halaman berikutnya",

  "newapp.eyebrow": "Catatan baru",
  "newapp.title": "Tambah Aplikasi",
  "newapp.description":
    "Masukkan detail pemohon untuk membuat aplikasi kredit baru. Kolom bertanda * wajib diisi.",
  "newapp.cancel": "Batal",
  "newapp.customerInfo": "Informasi pelanggan",
  "newapp.customerInfoDesc":
    "Identitas pemohon dan kondisi tempat tinggal.",
  "newapp.fullName": "Nama lengkap *",
  "newapp.fullNamePlaceholder": "mis. Aisyah Putri",
  "newapp.email": "Alamat email *",
  "newapp.emailPlaceholder": "nama@mail.com",
  "newapp.age": "Usia *",
  "newapp.agePlaceholder": "mis. 29",
  "newapp.homeOwnership": "Status tempat tinggal",
  "newapp.financialInfo": "Informasi keuangan",
  "newapp.financialInfoDesc":
    "Pendapatan, permintaan pinjaman, dan indikator pembayaran.",
  "newapp.annualIncome": "Pendapatan tahunan (IDR) *",
  "newapp.incomePlaceholder": "mis. 12.000.000",
  "newapp.loanAmount": "Jumlah pinjaman diminta (IDR) *",
  "newapp.loanPlaceholder": "mis. 5.000.000",
  "newapp.interestRate": "Suku bunga pinjaman (%) *",
  "newapp.interestPlaceholder": "mis. 14.5",
  "newapp.loanPurpose": "Tujuan pinjaman",
  "newapp.loanGrade": "Peringkat pinjaman *",
  "newapp.gradeA": "A — risiko terendah",
  "newapp.gradeG": "G — risiko tertinggi",
  "newapp.creditHistory": "Lama riwayat kredit (tahun) *",
  "newapp.creditHistoryPlaceholder": "mis. 5",
  "newapp.historicalDefault": "Riwayat gagal bayar",
  "newapp.defaultNo": "Tidak ada catatan",
  "newapp.defaultYes": "Ya — ada riwayat gagal bayar",
  "newapp.employmentInfo": "Informasi pekerjaan",
  "newapp.employmentInfoDesc":
    "Stabilitas pekerjaan membantu memperkirakan kemampuan membayar.",
  "newapp.employmentLength": "Lama bekerja (tahun) *",
  "newapp.employmentPlaceholder": "mis. 3.5",
  "newapp.summary": "Ringkasan aplikasi",
  "newapp.applicant": "Pemohon",
  "newapp.annualIncomeShort": "Pendapatan tahunan",
  "newapp.loanAmountShort": "Jumlah pinjaman",
  "newapp.loanToIncome": "Rasio pinjaman/pendapatan",
  "newapp.completion": "Kelengkapan formulir",
  "newapp.save": "Simpan Aplikasi",
  "newapp.saving": "Menyimpan...",
  "newapp.cancelReturn": "Batal dan kembali",
  "newapp.validationNote": "Catatan validasi kolom",
  "newapp.validationDesc":
    "Periksa kembali pendapatan, jumlah pinjaman, dan suku bunga sebelum menyimpan. Jangan masukkan data pelanggan asli di ruang kerja demo ini.",
  "newapp.savingOpens": "Menyimpan akan membuka halaman detail aplikasi.",
  "newapp.errName": "Masukkan nama lengkap pemohon.",
  "newapp.errEmail": "Masukkan alamat email yang valid.",
  "newapp.errAge": "Usia harus antara 18 dan 80.",
  "newapp.errIncome": "Pendapatan harus lebih dari nol.",
  "newapp.errLoan": "Jumlah pinjaman harus lebih dari nol.",
  "newapp.errRate": "Suku bunga harus antara 0 dan 60.",
  "newapp.errEmployment": "Lama bekerja harus antara 0 dan 60 tahun.",
  "newapp.errCreditHistory":
    "Lama riwayat kredit harus antara 0 dan 80 tahun.",
  "newapp.errSave":
    "Tidak dapat menyimpan aplikasi. Periksa koneksi dan coba lagi.",

  "detail.notFoundTitle": "Aplikasi tidak ditemukan",
  "detail.notFoundDesc":
    "Aplikasi yang diminta tidak tersedia di ruang kerja ini. Mungkin telah dihapus atau tautannya salah.",
  "detail.backToApps": "Kembali ke Aplikasi",
  "detail.applied": "Diajukan {date}",
  "detail.lastUpdated": "Terakhir diperbarui {date}",
  "detail.openReview": "Buka tinjauan",
  "detail.assessing": "Menilai...",
  "detail.rerun": "Jalankan Ulang Penilaian",
  "detail.run": "Jalankan Penilaian Risiko",
  "detail.customerInfo": "Informasi pelanggan",
  "detail.customerInfoSub": "Identitas dan detail rumah tangga",
  "detail.fullName": "Nama lengkap",
  "detail.email": "Alamat email",
  "detail.age": "Usia",
  "detail.homeOwnership": "Status tempat tinggal",
  "detail.financialInfo": "Informasi keuangan",
  "detail.financialInfoSub": "Permintaan pinjaman dan indikator pembayaran",
  "detail.annualIncome": "Pendapatan tahunan",
  "detail.loanAmount": "Jumlah pinjaman diminta",
  "detail.interestRate": "Suku bunga",
  "detail.loanToIncome": "Rasio pinjaman/pendapatan",
  "detail.loanPurpose": "Tujuan pinjaman",
  "detail.loanGrade": "Peringkat pinjaman",
  "detail.creditHistory": "Lama riwayat kredit",
  "detail.employmentInfo": "Informasi pekerjaan",
  "detail.employmentInfoSub":
    "Stabilitas pekerjaan dan perilaku kredit sebelumnya",
  "detail.employmentLength": "Lama bekerja",
  "detail.historicalDefault": "Riwayat gagal bayar",
  "detail.defaultYes": "Ya — ada riwayat gagal bayar",
  "detail.defaultNo": "Tidak ada catatan",
  "detail.organization": "Organisasi",
  "detail.assessmentHistory": "Riwayat penilaian",
  "detail.recordsCount": "Penilaian tercatat: {count}",
  "detail.noAssessment":
    "Belum ada penilaian risiko yang dicatat untuk aplikasi ini.",
  "detail.latest": "Terbaru",
  "detail.defaultProb": "Probabilitas gagal bayar",
  "detail.viewResult": "Lihat hasil",
  "detail.appStatus": "Status aplikasi",
  "detail.appId": "ID Aplikasi",
  "detail.appliedOn": "Diajukan pada",
  "detail.createdBy": "Dibuat oleh",
  "detail.latestAssessment": "Penilaian terbaru",
  "detail.gaugeCaption":
    "Perkiraan probabilitas gagal bayar untuk eksposur PayLater yang diminta. Gunakan bersama catatan tinjauan, bukan sebagai keputusan otomatis.",
  "detail.viewFull": "Lihat hasil lengkap",
  "detail.underwritingReview": "Tinjauan underwriting",
  "detail.awaitingTitle": "Menunggu penilaian",
  "detail.awaitingDesc":
    "Jalankan penilaian risiko untuk menghasilkan probabilitas gagal bayar, kategori risiko, dan faktor yang mempengaruhi aplikasi ini.",
  "detail.decisionSupport": "Dukungan keputusan",
  "detail.decisionSupportDesc":
    "Perkiraan risiko bersifat panduan. Persetujuan atau penolakan akhir harus dicatat oleh Petugas Kredit yang berwenang setelah tinjauan manual.",

  "assess.notFoundTitle": "Aplikasi tidak ditemukan",
  "assess.notFoundDesc":
    "Aplikasi yang diminta tidak tersedia di ruang kerja ini.",
  "assess.noAssessmentFor":
    "Belum ada penilaian yang dicatat untuk {name}.",
  "assess.noAvailableTitle": "Tidak ada penilaian tersedia",
  "assess.noAvailableDesc":
    "Jalankan penilaian risiko untuk menghasilkan probabilitas gagal bayar, kategori risiko, dan faktor yang mempengaruhi.",
  "assess.run": "Jalankan Penilaian Risiko",
  "assess.backToDetail": "Kembali ke Detail Aplikasi",
  "assess.eyebrowResult": "Hasil penilaian",
  "assess.title": "Penilaian Risiko Kredit",
  "assess.description":
    "{name} · Dinilai {date} · Penilaian tercatat: {count}",
  "assess.assessing": "Menilai...",
  "assess.rerun": "Jalankan ulang",
  "assess.continueReview": "Lanjut ke Tinjauan",
  "assess.defaultProb": "Probabilitas gagal bayar",
  "assess.riskCategory": "Kategori risiko",
  "assess.assessedAt": "Dinilai pada",
  "assess.thresholdLow": "Risiko rendah",
  "assess.thresholdMedium": "Risiko sedang",
  "assess.thresholdHigh": "Risiko tinggi",
  "assess.summaryLow":
    "Perkiraan probabilitas gagal bayar berada di bawah ambang risiko rendah. Penanganan rutin sudah sesuai, sementara petugas tetap mencatat keputusan akhir.",
  "assess.summaryMedium":
    "Perkiraan berada di rentang risiko sedang. Pertimbangkan kapasitas pembayaran, stabilitas pekerjaan, dan dokumen pendukung sebelum memutuskan.",
  "assess.summaryHigh":
    "Perkiraan berada di atas ambang risiko tinggi. Tinjauan manual mendetail dan verifikasi tambahan disarankan sebelum persetujuan.",
  "assess.contributing": "Faktor yang mempengaruhi",
  "assess.contributingSub":
    "Faktor utama yang menaikkan atau menurunkan perkiraan risiko",
  "assess.noFactors":
    "Tidak ada faktor dominan yang teridentifikasi untuk aplikasi ini.",
  "assess.modelInfo": "Informasi penilaian",
  "assess.modelInfoSub": "Bagaimana hasil ini dihasilkan",
  "assess.model": "Model",
  "assess.version": "Versi",
  "assess.output": "Jenis hasil",
  "assess.outputValue": "Perkiraan probabilitas gagal bayar",
  "assess.assessedBy": "Dinilai oleh",
  "assess.caveat":
    "Perkiraan ini mendukung tinjauan Anda, bukan menggantikannya. Selalu periksa dokumen pemohon dan kemampuan membayar sebelum memutuskan.",
  "assess.appSummary": "Ringkasan aplikasi",
  "assess.applicant": "Pemohon",
  "assess.appId": "ID Aplikasi",
  "assess.loanAmount": "Jumlah pinjaman",
  "assess.annualIncome": "Pendapatan tahunan",
  "assess.loanToIncome": "Rasio pinjaman/pendapatan",
  "assess.interestRate": "Suku bunga",
  "assess.officerTitle": "Anda yang memutuskan",
  "assess.officerDesc":
    "Lanjut ke tinjauan underwriting untuk menambah catatan, memilih keputusan akhir, dan mencatat alasannya.",
  "assess.backToApp": "Kembali ke aplikasi",

  "port.eyebrow": "Analitik",
  "port.title": "Analitik Portofolio",
  "port.description":
    "Volume aplikasi, komposisi risiko, dan status tinjauan untuk periode terpilih.",
  "port.periodAria": "Pilih periode",
  "port.total": "Total Aplikasi",
  "port.assessed": "Dinilai",
  "port.hintAssessed": "{percent}% aplikasi dalam periode",
  "port.avgProb": "Rata-rata probabilitas gagal bayar",
  "port.hintAvg": "Rata-rata penilaian terbaru per aplikasi",
  "port.highShare": "Porsi Risiko Tinggi",
  "port.hintHigh": "{count} aplikasi berisiko tinggi",
  "port.riskDist": "Distribusi Risiko",
  "port.riskDistSub": "Penilaian terbaru per aplikasi dalam periode",
  "port.noAssessed": "Tidak ada aplikasi yang dinilai dalam periode ini.",
  "port.excluded":
    "{count} aplikasi dalam periode ini belum dinilai dan dikeluarkan dari distribusi.",
  "port.appStatus": "Status Aplikasi",
  "port.appStatusSub": "Komposisi status aplikasi dalam periode",
  "port.noApps": "Tidak ada aplikasi dalam periode ini.",
  "port.statusNote":
    "Total status berasal dari catatan aplikasi saat ini. Jumlah disetujui dan ditolak mencerminkan keputusan tinjauan yang tercatat.",
  "port.riskSummary": "Ringkasan kategori risiko",
  "port.assessedIn": "{count} dinilai dalam {period}",
  "port.shareOfAssessed": "{percent}% dari aplikasi yang dinilai",
  "port.footer":
    "Data mencerminkan ruang kerja saat ini dan diperbarui segera setelah penilaian atau tinjauan disimpan.",
  "port.source": "Sumber: data ruang kerja langsung",

  "settings.eyebrow": "Akun",
  "settings.title": "Pengaturan",
  "settings.description":
    "Kelola profil dan ruang kerja demo Anda.",
  "settings.active": "Sesi aktif",
  "settings.profileInfo": "Informasi profil",
  "settings.profileInfoSub":
    "Perbarui nama tampilan dan email kontak yang digunakan di ruang kerja ini.",
  "settings.fullName": "Nama lengkap",
  "settings.email": "Alamat email",
  "settings.profileUpdated": "Profil diperbarui.",
  "settings.saveChanges": "Simpan perubahan",
  "settings.security": "Keamanan akun",
  "settings.securitySub": "Bagaimana akun Anda dilindungi.",
  "settings.securityDesc":
    "Gunakan kata sandi unik dan keluar saat memakai perangkat bersama. Hubungi administrator jika Anda melihat aktivitas akun yang mencurigakan.",
  "settings.demoControls": "Kontrol data demo",
  "settings.demoControlsSub":
    "Kembalikan ruang kerja ke kumpulan data ilustratif awal.",
  "settings.demoWarning":
    "Mengatur ulang akan menghapus semua aplikasi, penilaian, dan tinjauan, lalu memulihkan catatan demo asli.",
  "settings.demoRestored": "Data demo dipulihkan.",
  "settings.confirmReset": "Konfirmasi atur ulang",
  "settings.resetDemo": "Atur ulang data demo",
  "settings.cancel": "Batal",
  "settings.signOut": "Keluar",
  "settings.signOutSub": "Akhiri sesi ruang kerja saat ini.",
  "settings.logout": "Keluar",

  "uw.eyebrow": "Tinjauan manual",
  "uw.title": "Tinjauan Underwriting",
  "uw.description":
    "Tinjau aplikasi yang telah dinilai, verifikasi informasi pendukung, dan catat keputusan kredit akhir dengan alasan yang jelas.",
  "uw.allApps": "Semua aplikasi",
  "uw.awaitingAction": "Menunggu tindakan",
  "uw.completedReviews": "Tinjauan selesai",
  "uw.assessedApps": "Aplikasi yang dinilai",
  "uw.searchPlaceholder": "Cari berdasarkan pemohon atau ID aplikasi...",
  "uw.searchAria": "Cari tinjauan",
  "uw.filterAria": "Filter berdasarkan status tinjauan",
  "uw.allStatuses": "Semua status tinjauan",
  "uw.rowsShown": "Tinjauan ditampilkan: {count}",
  "uw.sorted": "Diurutkan berdasarkan penilaian terbaru",
  "uw.nothingTitle": "Tidak ada yang perlu ditinjau",
  "uw.nothingDesc":
    "Aplikasi yang dinilai akan muncul di sini untuk tinjauan underwriting manual.",
  "uw.goApps": "Buka Aplikasi",
  "uw.colReviewStatus": "Status tinjauan",

  "uwDetail.notFoundTitle": "Aplikasi tidak ditemukan",
  "uwDetail.notFoundDesc":
    "Aplikasi yang diminta tidak tersedia di ruang kerja ini.",
  "uwDetail.backToReviews": "Kembali ke Tinjauan",
  "uwDetail.backToUnderwriting": "Kembali ke Tinjauan Underwriting",
  "uwDetail.eyebrowReview": "Tinjauan underwriting",
  "uwDetail.applicationDetail": "Detail aplikasi",
  "uwDetail.assessmentRequired": "Penilaian diperlukan",
  "uwDetail.assessmentRequiredDesc":
    "Aplikasi ini belum memiliki penilaian risiko. Jalankan penilaian sebelum mencatat keputusan underwriting.",
  "uwDetail.predictionResult": "Penilaian risiko",
  "uwDetail.defaultProb": "Probabilitas gagal bayar",
  "uwDetail.appCustomerInfo": "Informasi aplikasi dan pelanggan",
  "uwDetail.verify": "Verifikasi informasi ini dengan dokumen pendukung.",
  "uwDetail.fullName": "Nama lengkap",
  "uwDetail.email": "Email",
  "uwDetail.age": "Usia",
  "uwDetail.homeOwnership": "Status tempat tinggal",
  "uwDetail.annualIncome": "Pendapatan tahunan",
  "uwDetail.loanAmount": "Jumlah pinjaman",
  "uwDetail.interestRate": "Suku bunga",
  "uwDetail.loanToIncome": "Rasio pinjaman/pendapatan",
  "uwDetail.loanPurpose": "Tujuan pinjaman",
  "uwDetail.employmentLength": "Lama bekerja",
  "uwDetail.recordDecision": "Catat keputusan tinjauan",
  "uwDetail.recordDecisionSub":
    "Anda membuat keputusan akhir berdasarkan tinjauan Anda.",
  "uwDetail.reviewNotes": "Catatan tinjauan",
  "uwDetail.reviewNotesPlaceholder":
    "Catat langkah verifikasi, dokumen pendukung, dan pengamatan.",
  "uwDetail.finalDecision": "Keputusan akhir *",
  "uwDetail.selectDecision": "Pilih keputusan",
  "uwDetail.statusAfterSave": "Status tinjauan setelah disimpan",
  "uwDetail.decisionReason": "Alasan keputusan *",
  "uwDetail.decisionReasonPlaceholder":
    "Jelaskan alasan keputusan akhir.",
  "uwDetail.errDecision":
    "Pilih keputusan akhir sebelum menyimpan tinjauan.",
  "uwDetail.errReason":
    "Berikan alasan keputusan minimal 10 karakter.",
  "uwDetail.errSave": "Tidak dapat menyimpan tinjauan. Silakan coba lagi.",
  "uwDetail.saved": "Tinjauan disimpan. Status aplikasi telah diperbarui.",
  "uwDetail.saveReview": "Simpan Tinjauan",
  "uwDetail.viewAssessment": "Lihat hasil penilaian",
  "uwDetail.reviewContext": "Konteks tinjauan",
  "uwDetail.appId": "ID Aplikasi",
  "uwDetail.status": "Status",
  "uwDetail.riskCategory": "Kategori risiko",
  "uwDetail.assessedAt": "Dinilai pada",
  "uwDetail.assessedBy": "Dinilai oleh",
  "uwDetail.latestReview": "Tinjauan terbaru",
  "uwDetail.notes": "Catatan",
  "uwDetail.decisionReasonLabel": "Alasan keputusan",
  "uwDetail.reviewedAt": "Ditinjau pada",
  "uwDetail.humanTitle": "Akuntabilitas manusia",
  "uwDetail.humanDesc":
    "Catat alasan yang jelas untuk setiap keputusan. Catatan tinjauan disimpan bersama aplikasi.",
  "uwDetail.guardrails": "Panduan keputusan",
  "uwDetail.guardrail1": "Perkiraan risiko adalah panduan, bukan keputusan otomatis.",
  "uwDetail.guardrail2": "Verifikasi data pelanggan sebelum memutuskan.",
  "uwDetail.guardrail3": "Setiap keputusan dan alasan disimpan.",

  "hint.loanGrade":
    "Peringkat A–G sesuai kebijakan kredit pemberi pinjaman. A adalah risiko terendah dan G tertinggi.",
  "hint.interestRate":
    "Suku bunga tahunan yang dikenakan pada pinjaman. Suku bunga lebih tinggi biasanya berarti risiko lebih tinggi.",
  "hint.loanToIncome":
    "Jumlah pinjaman dibagi pendapatan tahunan. Rasio lebih tinggi berarti pinjaman relatif besar terhadap pendapatan.",
  "hint.creditHistory":
    "Berapa lama pemohon memiliki riwayat kredit, dalam tahun.",
  "hint.historicalDefault":
    "Apakah pemohon memiliki catatan gagal bayar dari biro kredit.",
  "hint.employmentLength":
    "Berapa lama pemohon bekerja di pekerjaan saat ini, dalam tahun.",
  "hint.homeOwnership":
    "Apakah pemohon menyewa, memiliki rumah, memiliki KPR, atau tinggal dengan cara lain.",
  "hint.loanPurpose":
    "Tujuan penggunaan pinjaman, seperti pribadi, pendidikan, atau medis.",
  "hint.annualIncome":
    "Total pendapatan pemohon per tahun sebelum pajak, dalam rupiah.",
  "hint.loanAmount":
    "Jumlah yang ingin dipinjam pemohon, dalam rupiah.",
  "hint.defaultProbability":
    "Perkiraan peluang peminjam gagal membayar. Semakin rendah, semakin aman.",
  "hint.riskCategory":
    "Risiko rendah, sedang, atau tinggi berdasarkan rentang probabilitas gagal bayar.",

  "demo.workspace": "Ruang kerja demo.",
  "demo.desc":
    "Catatan bersifat ilustratif, dan prediksi hanya sebagai pendukung keputusan — keputusan kredit akhir tetap di tangan petugas yang berwenang.",
};

const dictionaries: Record<Locale, Dictionary> = { en, id };

const factorValueMapId: Record<string, string> = {
  Renting: "Sewa",
  Owned: "Milik sendiri",
  Mortgage: "KPR",
  Other: "Lainnya",
  Yes: "Ya",
  "No record": "Tidak ada catatan",
  "Debt consolidation": "Konsolidasi utang",
  "Home improvement": "Renovasi rumah",
  "Business venture": "Modal usaha",
  Personal: "Pribadi",
  Education: "Pendidikan",
  Medical: "Medis",
};

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  risk: (value: RiskCategory) => string;
  status: (value: ApplicationStatus) => string;
  reviewStatus: (value: ReviewStatus) => string;
  decision: (value: FinalDecision) => string;
  home: (value: HomeOwnership) => string;
  intent: (value: LoanIntent) => string;
  role: (value: string) => string;
  period: (value: Period) => string;
  factor: (key: string, fallback: string) => string;
  factorValue: (value: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const localeListeners = new Set<() => void>();
let currentLocale: Locale = "en";
let localeInitialized = false;

function readStoredLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "id") return stored;
    if (navigator.language?.toLowerCase().startsWith("id")) return "id";
  } catch {
    return "en";
  }
  return "en";
}

function subscribeLocale(listener: () => void) {
  localeListeners.add(listener);
  return () => {
    localeListeners.delete(listener);
  };
}

function getLocaleSnapshot(): Locale {
  if (!localeInitialized) {
    currentLocale = readStoredLocale();
    localeInitialized = true;
  }
  return currentLocale;
}

function getLocaleServerSnapshot(): Locale {
  return "en";
}

function writeLocale(next: Locale) {
  currentLocale = next;
  localeInitialized = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore storage failures
  }
  for (const listener of localeListeners) listener();
}

function enumTranslator(locale: Locale, group: string) {
  return (value: string): string => {
    const key = `${group}.${value}`;
    return dictionaries[locale][key] ?? en[key] ?? value;
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getLocaleServerSnapshot,
  );

  setFormatLocale(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    setFormatLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    writeLocale(next);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const template = dictionaries[locale][key] ?? en[key] ?? key;
      return interpolate(template, vars);
    },
    [locale],
  );

  const factorValue = useCallback(
    (value: string) => {
      if (locale === "en") return value;
      let out = value
        .replace(/ yrs$/, " thn")
        .replace(/% of income$/, "% dari pendapatan")
        .replace(/^Grade /, "Peringkat ");
      if (factorValueMapId[out]) out = factorValueMapId[out];
      else if (factorValueMapId[value]) out = factorValueMapId[value];
      return out;
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      risk: enumTranslator(locale, "risk"),
      status: enumTranslator(locale, "status"),
      reviewStatus: enumTranslator(locale, "reviewStatus"),
      decision: enumTranslator(locale, "decision"),
      home: enumTranslator(locale, "home"),
      intent: enumTranslator(locale, "intent"),
      role: enumTranslator(locale, "role"),
      period: enumTranslator(locale, "period"),
      factor: (key: string, fallback: string) => {
        const dictKey = `factor.${key}`;
        const translated = dictionaries[locale][dictKey] ?? en[dictKey];
        return translated ?? fallback;
      },
      factorValue,
    }),
    [locale, setLocale, t, factorValue],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
