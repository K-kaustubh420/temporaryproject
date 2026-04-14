"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const logoSvg = (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#166534" />
    <path d="M7 10h4v4H7zM13 10h4v4h-4zM7 16h4v4H7zM13 16h4v4h-4zM19 10h2v4h-2zM19 16h2v4h-2z" fill="#22c55e" opacity="0.9" />
  </svg>
);

const navLinks = [
  { href: "/inbox", label: "Inbox" },
  { href: "/triage", label: "Triage" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          {logoSvg}
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-green)] transition-colors">
            Automailer
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[var(--accent-green)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Avatar */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: "var(--avatar-purple)" }}
          aria-label="User profile"
        >
          K
        </button>
      </div>
    </nav>
  );
}
