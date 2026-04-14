"use client";

import Link from "next/link";

const logoSvg = (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#166534" />
    <path d="M7 10h4v4H7zM13 10h4v4h-4zM7 16h4v4H7zM13 16h4v4h-4zM19 10h2v4h-2zM19 16h2v4h-2z" fill="#22c55e" opacity="0.9" />
  </svg>
);

export default function AuthNavbar() {
  return (
    <nav className="w-full border-b border-(--border-subtle) bg-(--bg-primary)/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          {logoSvg}
          <span className="text-xl font-bold tracking-tight text-(--text-primary)">
            Automailer
          </span>
        </Link>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-(--border-subtle)-[var(--text-primary)] hover:bg-(--bg-surface-hover) transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
