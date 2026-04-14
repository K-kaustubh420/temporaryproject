"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useMailContext } from "../context/MailContext";

interface DepartmentConfig {
  name: string;
  email: string;
  enabled: boolean;
}

const defaultDepartments: DepartmentConfig[] = [
  { name: "Engineering", email: "eng@company.com", enabled: true },
  { name: "Security", email: "security@company.com", enabled: true },
  { name: "Finance", email: "finance@company.com", enabled: true },
  { name: "Legal", email: "legal@company.com", enabled: true },
  { name: "Trust & Safety", email: "trust@company.com", enabled: true },
  { name: "Customer Success", email: "cs@company.com", enabled: true },
  { name: "Support", email: "support@company.com", enabled: true },
];

export default function SettingsPage() {
  const router = useRouter();
  const { credentials, logout } = useMailContext();

  const [departments, setDepartments] = useState(defaultDepartments);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!credentials) {
      router.push("/login");
    }
  }, [credentials, router]);

  const toggleDept = (index: number) => {
    setDepartments((prev) =>
      prev.map((d, i) => (i === index ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!credentials) return null;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="top-accent-bar" />
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-4xl text-zinc-100 mb-2">Settings</h1>
          <p className="text-zinc-400 text-base">
            Configure your email connections and department routing rules.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Connected Account */}
          <section
            className="rounded-xl border p-6 animate-fade-in"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)", animationDelay: "0.05s" }}
          >
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Connected Account</h2>
            <p className="text-sm text-zinc-500 mb-4">Currently connected mailbox.</p>

            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium text-zinc-100">{credentials.email}</p>
                  <p className="text-xs text-zinc-500">IMAP Connected</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md border border-red-800/40 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </section>

          {/* Department Routing */}
          <section
            className="rounded-xl border p-6 animate-fade-in"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)", animationDelay: "0.15s" }}
          >
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Department Routing</h2>
            <p className="text-sm text-zinc-500 mb-5">
              Map triage categories to specific departments for routing.
            </p>

            <div className="flex flex-col gap-3">
              {departments.map((dept, i) => (
                <div
                  key={dept.name}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${dept.enabled ? "bg-green-500" : "bg-zinc-600"}`} />
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{dept.name}</p>
                      <p className="text-xs text-zinc-500">{dept.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDept(i)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      dept.enabled ? "bg-green-800" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        dept.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Save Button */}
          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <button
              onClick={handleSave}
              className="px-8 py-3 rounded-lg bg-green-800 text-sm font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg hover:shadow-green-900/20"
            >
              Save Settings
            </button>
            {saved && (
              <span className="text-sm text-green-500 animate-fade-in flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 8l3 3 5-5" />
                </svg>
                Settings saved successfully
              </span>
            )}
          </div>
        </div>
      </main>

      <div className="green-glow h-32 pointer-events-none" />
    </div>
  );
}
