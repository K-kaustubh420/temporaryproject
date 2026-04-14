"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import TriagePanel from "../../components/TriagePanel";
import { useMailContext } from "../../context/MailContext";

function mapPriority(p?: string): "critical" | "high" | "medium" | "low" {
  switch (p) {
    case "Critical": return "critical";
    case "High": return "high";
    case "Medium": return "medium";
    default: return "low";
  }
}

function extractSender(from: string): string {
  if (!from) return "Unknown";
  const match = from.match(/^([^<]+)/);
  if (match) return match[1].trim();
  return from.split("@")[0];
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return isToday ? `Today at ${time}` : `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
  } catch {
    return dateStr || "";
  }
}

export default function EmailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { credentials, emails, getEmailByUid, triageEmail } = useMailContext();
  const uid = Number(params.id);

  useEffect(() => {
    if (!credentials) {
      router.push("/login");
    }
  }, [credentials, router]);

  const email = getEmailByUid(uid);

  // Auto-triage this email when opened
  useEffect(() => {
    if (email && !email.triage && !email.triageLoading) {
      triageEmail(uid);
    }
  }, [email, uid, triageEmail]);

  if (!credentials) return null;

  if (!email) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="top-accent-bar" />
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-zinc-500">
            <p className="text-lg mb-2">Email not found</p>
            <Link href="/inbox" className="text-green-500 text-sm hover:underline">
              Back to Inbox
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const senderName = extractSender(email.from);
  const senderInitial = senderName.charAt(0).toUpperCase();
  const triage = email.triage;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="top-accent-bar" />
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex gap-8 animate-fade-in">
          {/* Left Column — Email Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-zinc-100 mb-4">
              {email.subject || "(No Subject)"}
            </h1>

            {/* Sender Info */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: "var(--avatar-purple)" }}
              >
                {senderInitial}
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-100">
                  {senderName}
                </span>
                <span className="ml-2 text-sm text-zinc-500">
                  {formatDate(email.date)}
                </span>
              </div>
            </div>

            {/* Email Body */}
            <div
              className="rounded-xl border p-6 mb-6"
              style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
            >
              <pre className="whitespace-pre-wrap text-sm text-zinc-400 leading-relaxed" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
                {email.body || "(No content)"}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <button className="px-6 py-2.5 rounded-lg bg-green-800 text-sm font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg hover:shadow-green-900/20">
                Assign
              </button>
              <button
                className="px-6 py-2.5 rounded-lg border text-sm font-semibold text-zinc-100 transition-all hover:bg-zinc-800"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
              >
                Forward
              </button>
            </div>

            <Link
              href="/inbox"
              className="inline-flex items-center gap-1 text-sm font-medium text-green-500 hover:underline"
            >
              View Archived
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M5 3l4 4-4 4" />
              </svg>
            </Link>
          </div>

          {/* Right Column — Triage Analysis */}
          <div className="w-80 shrink-0">
            {email.triageLoading ? (
              <div
                className="rounded-xl border p-6 animate-pulse"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
              >
                <h2 className="font-display text-2xl text-zinc-100 mb-6">Triage Analysis</h2>
                <div className="space-y-4">
                  <div className="h-6 bg-zinc-800 rounded w-32" />
                  <div className="h-4 bg-zinc-800 rounded w-24" />
                  <div className="h-2 bg-zinc-800 rounded w-full" />
                  <div className="h-4 bg-zinc-800 rounded w-28" />
                  <div className="h-24 bg-zinc-800 rounded w-full" />
                </div>
              </div>
            ) : triage ? (
              <TriagePanel
                priority={mapPriority(triage.priority)}
                confidence={triage.globalConfidence}
                category={triage.tags?.[0]?.label || "General Support"}
                summary={triage.internalSummary}
                recommendation={triage.customerReply}
              />
            ) : (
              <div
                className="rounded-xl border p-6"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
              >
                <h2 className="font-display text-2xl text-zinc-100 mb-4">Triage Analysis</h2>
                <p className="text-sm text-zinc-500">Triage not yet available.</p>
                <button
                  onClick={() => triageEmail(uid)}
                  className="mt-4 px-4 py-2 rounded-lg bg-green-800 text-xs font-medium text-white hover:bg-green-600 transition-all"
                >
                  Run Triage
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
