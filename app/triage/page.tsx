"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import PriorityBadge from "../components/PriorityBadge";
import { useMailContext, TriagedEmail } from "../context/MailContext";

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
  if (match) return match[1].trim().split(" ")[0];
  return from.split("@")[0];
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return dateStr || "";
  }
}

interface TriageQueueItem {
  uid: number;
  from: string;
  subject: string;
  priority: "critical" | "high" | "medium" | "low";
  confidence: number;
  category: string;
  status: "pending" | "approved" | "rejected" | "forwarded";
  assignedTo?: string;
  time: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-900/30 text-amber-400 border-amber-800/40",
    approved: "bg-green-900/30 text-green-400 border-green-800/40",
    rejected: "bg-red-900/30 text-red-400 border-red-800/40",
    forwarded: "bg-blue-900/30 text-blue-400 border-blue-800/40",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export default function TriagePage() {
  const router = useRouter();
  const { credentials, emails, triageAll } = useMailContext();
  const [statuses, setStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!credentials) {
      router.push("/login");
    }
  }, [credentials, router]);

  // Auto-triage
  useEffect(() => {
    if (emails.length > 0) {
      triageAll();
    }
  }, [emails.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const items: TriageQueueItem[] = useMemo(() => {
    return emails
      .filter((e) => e.triage)
      .map((e) => ({
        uid: e.uid,
        from: extractSender(e.from),
        subject: e.subject || "(No Subject)",
        priority: mapPriority(e.triage?.priority),
        confidence: e.triage?.globalConfidence || 0,
        category: e.triage?.tags?.[0]?.label || "General Support",
        status: (statuses[e.uid] || "pending") as TriageQueueItem["status"],
        time: formatTime(e.date),
      }))
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      });
  }, [emails, statuses]);

  const handleApprove = (uid: number) => {
    setStatuses((prev) => ({ ...prev, [uid]: "approved" }));
  };

  const handleReject = (uid: number) => {
    setStatuses((prev) => ({ ...prev, [uid]: "rejected" }));
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;

  if (!credentials) return null;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="top-accent-bar" />
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-4xl text-zinc-100 mb-2">Triage</h1>
          <p className="text-zinc-400 text-base">
            Review AI-triaged emails and approve routing decisions.
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 text-xs font-bold">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 animate-fade-in">
            <p className="text-sm">
              {emails.some((e) => e.triageLoading) ? "Triaging emails..." : "No triaged emails yet."}
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl border overflow-hidden animate-fade-in"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
          >
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_80px_100px_100px_140px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wider text-zinc-500"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <span>Email</span>
              <span>Category</span>
              <span>Priority</span>
              <span>Confidence</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table Rows */}
            {items.map((item) => (
              <div
                key={item.uid}
                className="grid grid-cols-[1fr_120px_80px_100px_100px_140px] gap-4 items-center px-5 py-4 border-b transition-colors hover:bg-zinc-900/50"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{item.subject}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.from} · {item.time}</p>
                </div>

                <span className="text-xs text-zinc-400 truncate">{item.category}</span>

                <PriorityBadge priority={item.priority} />

                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.confidence}%`,
                        background: item.confidence > 90 ? "var(--accent-green)" : "var(--priority-medium)",
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400">{item.confidence}%</span>
                </div>

                <StatusBadge status={item.status} />

                <div className="flex items-center justify-end gap-2">
                  {item.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleApprove(item.uid)}
                        className="px-3 py-1.5 rounded-md bg-green-800 text-xs font-medium text-white hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.uid)}
                        className="px-3 py-1.5 rounded-md border border-zinc-700 text-xs font-medium text-zinc-500 hover:text-red-400 hover:border-red-800/40 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-500">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="green-glow h-32 pointer-events-none" />
    </div>
  );
}
