"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthNavbar from "../components/AuthNavbar";
import { useMailContext } from "../context/MailContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading: ctxLoading, error: ctxError } = useMailContext();

  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [localError, setLocalError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !appPassword) {
      setLocalError("Email and App Password are required.");
      return;
    }

    const success = await login({ email, appPassword });
    if (success) {
      router.push("/dashboard");
    }
  };

  const displayError = localError || ctxError;

  return (
    <div className="flex flex-col min-h-screen bg-(--bg-primary)">
      {/* Top accent bar */}
      <div className="top-accent-bar" />

      {/* Auth Navbar */}
      <AuthNavbar />

      {/* Login Form */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Heading */}
          <h1 className="text-3xl font-bold text-center text-(--text-primary) mb-8">
            Log in Goose
          </h1>

          {displayError && (
            <div className="mb-4 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-300 animate-fade-in text-center">
              {displayError}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-4 py-3 focus-within:border-[var(--accent-green)] focus-within:shadow-[0_0_0_2px_rgba(34,197,94,0.15)] transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)] flex-shrink-0">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              <span className="text-sm text-[var(--text-muted)] flex-shrink-0">Email</span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-sm text-(--text-primary) placeholder:text-[var(--text-muted)] border-none outline-none"
                required
              />
            </div>

            {/* Password Field (App Password) */}
            <div className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 focus-within:border-[var(--accent-green)] focus-within:shadow-[0_0_0_2px_rgba(34,197,94,0.15)] transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)] flex-shrink-0">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 118 0v4" />
              </svg>
              <span className="text-sm text-[var(--text-muted)] flex-shrink-0">Password</span>
              <input
                type="password"
                placeholder="App Password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm text-(--text-primary) placeholder:text-[var(--text-muted)] border-none outline-none"
                required
              />
            </div>

            {/* Phone Field (Optional UI only) */}
            <div className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 focus-within:border-[var(--accent-green)] focus-within:shadow-[0_0_0_2px_rgba(34,197,94,0.15)] transition-all">
              <span className="text-base flex-shrink-0">🇮🇳</span>
              <span className="text-sm text-[var(--text-muted)] flex-shrink-0">+91</span>
              <svg width="10" height="10" viewBox="0 0 10 10" className="text-[var(--text-muted)] flex-shrink-0">
                <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent text-sm text-(--text-primary) placeholder:text-[var(--text-muted)] border-none outline-none"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={ctxLoading}
              className="mt-2 w-full rounded-lg bg-[var(--accent-green-dark)] py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-green)] hover:shadow-lg hover:shadow-green-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {ctxLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting to mailbox...
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-[var(--accent-green)] hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-xs text-[var(--text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          {/* Google Sign In */}
          <button className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 text-sm font-medium text-(--text-primary) transition-all hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-accent)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-[var(--accent-green)] font-medium hover:underline">
              Get Started
            </a>
          </p>
        </div>
      </main>

      <div className="green-glow h-32 pointer-events-none" />
    </div>
  );
}
