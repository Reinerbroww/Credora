"use client";

import { signIn, signOut } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Application,
  ApplicationInput,
  CredoraData,
  FinalDecision,
  ReviewStatus,
  RiskAssessment,
  Role,
  Session,
  UnderwritingReview,
} from "./types";

const EMPTY_DATA: CredoraData = {
  applications: [],
  assessments: [],
  reviews: [],
};

interface ProfilePayload {
  full_name: string;
  email: string;
  role: string;
  organization_name: string;
}

interface AuthSessionPayload {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    organizationId?: string;
    organizationName?: string;
  } | null;
}

interface ReviewPayload {
  review_status: ReviewStatus;
  final_decision: FinalDecision;
  decision_reason: string;
  review_notes: string;
}

interface CredoraContextValue {
  ready: boolean;
  session: Session | null;
  applications: Application[];
  assessments: RiskAssessment[];
  reviews: UnderwritingReview[];
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateSession: (
    patch: Partial<Pick<Session, "full_name" | "email">>,
  ) => Promise<void>;
  addApplication: (input: ApplicationInput) => Promise<string>;
  runAssessment: (applicationId: string) => Promise<RiskAssessment | null>;
  saveReview: (
    applicationId: string,
    payload: ReviewPayload,
  ) => Promise<boolean>;
  resetDemoData: () => Promise<void>;
  applicationById: (id: string) => Application | undefined;
  latestAssessment: (applicationId: string) => RiskAssessment | undefined;
  latestReview: (applicationId: string) => UnderwritingReview | undefined;
}

const CredoraContext = createContext<CredoraContextValue | null>(null);

function mapSession(payload: AuthSessionPayload | null): Session | null {
  const user = payload?.user;
  if (!user?.id || !user.organizationId) return null;

  return {
    id: user.id,
    full_name: user.name ?? user.email ?? "Credora User",
    role: (user.role as Role | undefined) ?? "Risk Analyst",
    email: user.email ?? "",
    organization_id: user.organizationId,
    organization_name: user.organizationName ?? "Workspace",
  };
}

async function fetchSession(): Promise<Session | null> {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (!response.ok) return null;
  return mapSession((await response.json()) as AuthSessionPayload);
}

async function fetchData(): Promise<CredoraData> {
  const response = await fetch("/api/data", { cache: "no-store" });
  if (!response.ok) return EMPTY_DATA;
  return (await response.json()) as CredoraData;
}

async function fetchProfile(): Promise<ProfilePayload | null> {
  const response = await fetch("/api/profile", { cache: "no-store" });
  if (!response.ok) return null;
  const payload = (await response.json()) as { profile?: ProfilePayload };
  return payload.profile ?? null;
}

export function CredoraProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CredoraData>(EMPTY_DATA);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const hydrate = useCallback(async () => {
    try {
      const nextSession = await fetchSession();
      if (nextSession) {
        const profile = await fetchProfile();
        setSession(
          profile
            ? {
                ...nextSession,
                full_name: profile.full_name,
                email: profile.email,
                role: profile.role as Role,
                organization_name: profile.organization_name,
              }
            : nextSession,
        );
        setData(await fetchData());
      } else {
        setSession(null);
        setData(EMPTY_DATA);
      }
    } catch {
      setSession(null);
      setData(EMPTY_DATA);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // Fetching the session and workspace data after mount is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void hydrate();
  }, [hydrate]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!result?.ok) {
          return {
            ok: false,
            error: "Email or password does not match a registered account.",
          };
        }

        await hydrate();
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: "Unable to reach the authentication service.",
        };
      }
    },
    [hydrate],
  );

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
    } catch {
      // Clear the local session even if the sign-out request fails.
    }
    setSession(null);
    setData(EMPTY_DATA);
  }, []);

  const updateSession = useCallback(
    async (patch: Partial<Pick<Session, "full_name" | "email">>) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) return;

      const payload = (await response.json()) as {
        profile?: { full_name: string; email: string };
      };
      const profile = payload.profile;
      if (!profile) return;

      setSession((current) =>
        current
          ? { ...current, full_name: profile.full_name, email: profile.email }
          : current,
      );
    },
    [],
  );

  const addApplication = useCallback(async (input: ApplicationInput) => {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error("Unable to save the application.");
    }

    const payload = (await response.json()) as { application: Application };
    setData((current) => ({
      ...current,
      applications: [payload.application, ...current.applications],
    }));
    return payload.application.id;
  }, []);

  const runAssessment = useCallback(async (applicationId: string) => {
    const response = await fetch(
      `/api/applications/${applicationId}/assessments`,
      { method: "POST" },
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      assessment: RiskAssessment;
    };
    setData((current) => ({
      ...current,
      assessments: [payload.assessment, ...current.assessments],
      applications: current.applications.map((item) =>
        item.id === applicationId
          ? {
              ...item,
              status:
                item.status === "Pending Review" ? "Assessed" : item.status,
              updated_at: new Date().toISOString(),
            }
          : item,
      ),
    }));
    return payload.assessment;
  }, []);

  const saveReview = useCallback(
    async (applicationId: string, payload: ReviewPayload) => {
      const response = await fetch(
        `/api/applications/${applicationId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) return false;

      const result = (await response.json()) as {
        review: UnderwritingReview;
        application: Application;
      };

      setData((current) => {
        const exists = current.reviews.some(
          (review) => review.application_id === applicationId,
        );
        const reviews = exists
          ? current.reviews.map((review) =>
              review.application_id === applicationId ? result.review : review,
            )
          : [result.review, ...current.reviews];

        return {
          ...current,
          reviews,
          applications: current.applications.map((application) =>
            application.id === applicationId
              ? result.application
              : application,
          ),
        };
      });

      return true;
    },
    [],
  );

  const resetDemoData = useCallback(async () => {
    const response = await fetch("/api/demo/reset", { method: "POST" });
    if (!response.ok) return;

    const next = (await response.json()) as CredoraData;
    setData(next);
  }, []);

  const applicationById = useCallback(
    (id: string) => data.applications.find((application) => application.id === id),
    [data.applications],
  );

  const latestAssessment = useCallback(
    (applicationId: string) =>
      data.assessments
        .filter((assessment) => assessment.application_id === applicationId)
        .sort(
          (a, b) =>
            new Date(b.assessed_at).getTime() - new Date(a.assessed_at).getTime(),
        )[0],
    [data.assessments],
  );

  const latestReview = useCallback(
    (applicationId: string) =>
      data.reviews
        .filter((review) => review.application_id === applicationId)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0],
    [data.reviews],
  );

  const value = useMemo<CredoraContextValue>(
    () => ({
      ready,
      session,
      applications: data.applications,
      assessments: data.assessments,
      reviews: data.reviews,
      login,
      logout,
      updateSession,
      addApplication,
      runAssessment,
      saveReview,
      resetDemoData,
      applicationById,
      latestAssessment,
      latestReview,
    }),
    [
      ready,
      session,
      data,
      login,
      logout,
      updateSession,
      addApplication,
      runAssessment,
      saveReview,
      resetDemoData,
      applicationById,
      latestAssessment,
      latestReview,
    ],
  );

  return (
    <CredoraContext.Provider value={value}>{children}</CredoraContext.Provider>
  );
}

export function useCredora(): CredoraContextValue {
  const context = useContext(CredoraContext);
  if (!context) {
    throw new Error("useCredora must be used within a CredoraProvider");
  }
  return context;
}
