"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Credentials {
  email: string;
  appPassword: string;
}

export interface InboxEmail {
  messageId: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  uid: number;
}

export interface TriageResult {
  priority: "Low" | "Medium" | "High" | "Critical";
  tags: { label: string; confidence: number; source: string }[];
  globalConfidence: number;
  internalSummary: string;
  customerReply: string;
  thoughtProcess: string[];
  riskForecast: { churnProbability: number; escalationNeeded: boolean };
}

export interface TriagedEmail extends InboxEmail {
  triage?: TriageResult;
  triageLoading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Context shape                                                      */
/* ------------------------------------------------------------------ */

interface MailContextValue {
  credentials: Credentials | null;
  emails: TriagedEmail[];
  loading: boolean;
  error: string | null;
  login: (creds: Credentials) => Promise<boolean>;
  logout: () => void;
  fetchEmails: () => Promise<void>;
  triageEmail: (uid: number) => Promise<void>;
  triageAll: () => Promise<void>;
  getEmailByUid: (uid: number) => TriagedEmail | undefined;
}

const MailContext = createContext<MailContextValue | null>(null);

export function useMailContext() {
  const ctx = useContext(MailContext);
  if (!ctx) throw new Error("useMailContext must be used within MailProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function MailProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("automailer_creds");
    return saved ? JSON.parse(saved) : null;
  });

  const [emails, setEmails] = useState<TriagedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---- Login: try fetching inbox to validate creds ---- */
  const login = useCallback(async (creds: Credentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: creds.email, appPassword: creds.appPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return false;
      }

      // Save creds & emails
      setCredentials(creds);
      localStorage.setItem("automailer_creds", JSON.stringify(creds));
      setEmails(data.data || []);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setError(message);
      setLoading(false);
      return false;
    }
  }, []);

  /* ---- Logout ---- */
  const logout = useCallback(() => {
    setCredentials(null);
    setEmails([]);
    localStorage.removeItem("automailer_creds");
  }, []);

  /* ---- Fetch emails using stored creds ---- */
  const fetchEmails = useCallback(async () => {
    if (!credentials) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email, appPassword: credentials.appPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch emails");
      } else {
        setEmails(data.data || []);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setError(message);
    }
    setLoading(false);
  }, [credentials]);

  /* ---- Triage a single email ---- */
  const triageEmail = useCallback(async (uid: number) => {
    const email = emails.find((e) => e.uid === uid);
    if (!email || email.triage) return;

    // Mark as loading
    setEmails((prev) =>
      prev.map((e) => (e.uid === uid ? { ...e, triageLoading: true } : e))
    );

    try {
      const content = `${email.subject}\n\n${email.body}`;
      const res = await fetch("/api/demo/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const result = await res.json();

      setEmails((prev) =>
        prev.map((e) =>
          e.uid === uid ? { ...e, triage: result, triageLoading: false } : e
        )
      );
    } catch {
      setEmails((prev) =>
        prev.map((e) => (e.uid === uid ? { ...e, triageLoading: false } : e))
      );
    }
  }, [emails]);

  /* ---- Triage all emails ---- */
  const triageAll = useCallback(async () => {
    const untriaged = emails.filter((e) => !e.triage && !e.triageLoading);
    await Promise.all(untriaged.map((e) => triageEmail(e.uid)));
  }, [emails, triageEmail]);

  /* ---- Get email by UID ---- */
  const getEmailByUid = useCallback(
    (uid: number) => emails.find((e) => e.uid === uid),
    [emails]
  );

  return (
    <MailContext.Provider
      value={{
        credentials,
        emails,
        loading,
        error,
        login,
        logout,
        fetchEmails,
        triageEmail,
        triageAll,
        getEmailByUid,
      }}
    >
      {children}
    </MailContext.Provider>
  );
}
