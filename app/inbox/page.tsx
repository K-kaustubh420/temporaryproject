"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
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
  const match = from.match(/^([^<]+)/);
  if (match) return match[1].trim().split(" ")[0];
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

type FilterType = "all" | "critical" | "high" | "medium" | "low";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" className="stroke-zinc-500">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeWidth="1" className="mx-auto mb-4 opacity-40 stroke-zinc-500">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <polyline points="2,7 12,14 22,7" />
    </svg>
  );
}

export default function InboxPage() {
  const router = useRouter();
  const { credentials, emails, loading, fetchEmails, triageAll } = useMailContext();

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!credentials) {
      router.push("/login");
    }
  }, [credentials, router]);

  // Auto-triage when emails arrive
  useEffect(() => {
    if (emails.length > 0) {
      triageAll();
    }
  }, [emails.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const emailItems = useMemo(() => emails.map(toEmailItem), [emails]);

  const filtered = useMemo(() => {
    return emailItems.filter((e) => {
      const matchPriority = filter === "all" || e.priority === filter;
      const matchSearch =
        !search ||
        e.from.toLowerCase().includes(search.toLowerCase()) ||
        e.subject.toLowerCase().includes(search.toLowerCase());
      return matchPriority && matchSearch;
    });
  }, [emailItems, filter, search]);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  if (!credentials) return null;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="top-accent-bar" />
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="font-display text-4xl text-zinc-100 mb-2">Inbox</h1>
            <p className="text-zinc-400 text-base">
              All incoming emails, sorted and organized by triage priority.
            </p>
          </div>
          <button
            onClick={fetchEmails}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-800 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-all"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div
            className="flex items-center gap-2 flex-1 min-w-60 rounded-lg border px-3.5 py-2.5"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
          >
            <SearchIcon />
            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 border-none outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={
                  filter === opt.value
                    ? "px-3.5 py-1.5 rounded-full text-xs font-medium bg-green-800 text-white transition-all"
                    : "px-3.5 py-1.5 rounded-full text-xs font-medium border border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-600 transition-all"
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-3 mb-4 text-zinc-400 text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Fetching emails...
          </div>
        )}

        {/* Email List */}
        <div className="flex flex-col gap-2 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {filtered.length > 0 ? (
            filtered.map((email: EmailItem) => (
              <EmailListItem key={email.id} email={email} />
            ))
          ) : (
            <div className="text-center py-16 text-zinc-500">
              <EmptyIcon />
              <p className="text-sm">
                {loading ? "Loading emails..." : emails.length === 0 ? "No emails fetched yet." : "No emails match your filters."}
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Showing {filtered.length} of {emailItems.length} emails
        </p>
      </main>

      <div className="green-glow h-32 pointer-events-none" />
    </div>
  );
}
