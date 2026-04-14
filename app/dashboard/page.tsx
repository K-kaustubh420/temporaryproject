"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import PriorityCard from "../components/PriorityCard";
import EmailListItem, { EmailItem } from "../components/EmailListItem";
import { useMailContext, TriagedEmail } from "../context/MailContext";

function mapPriority(p?: string): "critical" | "high" | "medium" | "low" {
  switch (p) {
    case "Critical": return "critical";
    case "High": return "high";
    case "Medium": return "medium";
    default: return "low";
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return dateStr || "";
  }
}

function extractSender(from: string): string {
  if (!from) return "Unknown";
  // "John Doe <john@email.com>" → "John Doe"
  const match = from.match(/^([^<]+)/);
  if (match) return match[1].trim().split(" ")[0]; // First name
  return from.split("@")[0];
}

function toEmailItem(email: TriagedEmail): EmailItem {
  return {
    id: String(email.uid),
    from: extractSender(email.from),
    subject: email.subject || "(No Subject)",
    time: formatTime(email.date),
    priority: mapPriority(email.triage?.priority),
    category: email.triage?.tags?.[0]?.label || "Pending",
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { credentials, emails, loading, triageAll } = useMailContext();

  // Redirect to login if no credentials
  useEffect(() => {
    if (!credentials) {
      router.push("/login");
    }
  }, [credentials, router]);

  // Auto-triage all emails when they load
  useEffect(() => {
    if (emails.length > 0) {
      triageAll();
    }
  }, [emails.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    let high = 0, medium = 0, low = 0;
    for (const e of emails) {
      const p = mapPriority(e.triage?.priority);
      if (p === "critical" || p === "high") high++;
      else if (p === "medium") medium++;
      else low++;
    }
    return { high, medium, low };
  }, [emails]);

  const highPriorityEmails = useMemo(() => {
    return emails
      .filter((e) => {
        const p = mapPriority(e.triage?.priority);
        return p === "critical" || p === "high";
      })
      .slice(0, 5)
      .map(toEmailItem);
  }, [emails]);

  if (!credentials) return null;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="top-accent-bar" />
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-4xl text-zinc-100 mb-2">Dashboard</h1>
          <p className="text-zinc-400 text-base">
            Manage and triage your emails with absolute control.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 mb-6 text-zinc-400 text-sm animate-fade-in">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Fetching and triaging emails...
          </div>
        )}

        {/* Priority Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <PriorityCard count={stats.high} label="High" priority="high" />
          <PriorityCard count={stats.medium} label="Medium" priority="medium" />
          <PriorityCard count={stats.low} label="Low" priority="low" />
        </div>

        {/* Recent High Priority Emails */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-base font-semibold text-zinc-100 mb-4">
            Recent High Priority Emails
          </h2>

          <div className="flex flex-col gap-2">
            {highPriorityEmails.length > 0 ? (
              highPriorityEmails.map((email) => (
                <EmailListItem key={email.id} email={email} />
              ))
            ) : (
              <p className="text-sm text-zinc-500 py-4">
                {loading ? "Analyzing emails..." : "No high priority emails found."}
              </p>
            )}
          </div>

          <Link
            href="/inbox"
            className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-green-500 hover:underline transition-colors"
          >
            View All
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 3l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </main>

      <div className="green-glow h-32 pointer-events-none" />
    </div>
  );
}
